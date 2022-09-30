import React, { useState, useEffect, useMemo } from 'react'
import Typography from '@material-ui/core/Typography'

/*
Replaced material-table with material-table/core for teams, organization and users pages because of this bug:
https://github.com/mbrn/material-table/issues/2650 which was causing random crashes and in general poor performance. 

For the table present in the dashboard, the original material-table is used because it contains the export functionality, not available in the materia-table-core library.
*/
// import MaterialTable, { Column } from 'material-table'
import MaterialTable, { Column } from '@material-table/core'

import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { ListItemText, MenuItem, Paper, Select } from '@material-ui/core'
import {
  TeamsApiAxiosParamCreator,
  TeamsApiFactory,
  DTResultOfTeamOutputDto,
  TeamOutputDto,
  CreateUpdateTeamInput,
  SetTeamMembersInput
} from 'ermes-ts-sdk'
import {
  APIAxiosHookOpts,
  useAxiosWithParamCreator,
  useAPIConfiguration
} from '../../../hooks/api-hooks'
import { AdministrationContainer, RefreshButton } from '../../../common/common.components'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import { localizeMaterialTable } from '../../../common/localize-material-table'
import useUsersList from '../../../hooks/use-users-list.hook'
import useOrgList from '../../../hooks/use-organization-list.hooks'

const MAX_RESULT_COUNT = 100
type TmsApiPC = typeof TeamsApiAxiosParamCreator
type KRTmsApiPC = keyof ReturnType<TmsApiPC>

function localizeColumns(t: TFunction, orgLookup): Column<TeamOutputDto>[] {
  const lookupKeys = Object.keys(orgLookup)
  const empty = lookupKeys[0] || ''
  return [
    { title: t('admin:team_name'), field: 'name' },
    {
      title: t('admin:team_org_name'),
      field: 'organization.id',
      editable: 'onAdd',
      lookup: orgLookup,
      initialEditValue: (lookupKeys.length > 1) ? undefined : empty,
      emptyValue: empty
    },
    {
      title: t('admin:team_people_count'),
      field: 'members.length',
      editable: 'never',
      emptyValue: '0'
    }
  ]
}
function localizeMemColumns(t: TFunction, genLookupObject: Function, membersIds: string[]): Column<TeamOutputDto>[] {
  const lookupObj = genLookupObject()
  const orgUsersEntries = Object.entries(lookupObj)
  const availableOrgUsers = orgUsersEntries.filter(entry => !membersIds.includes(entry[0]))
  return [{
    title: t('admin:team_mem_name'), field: 'fusionAuthUserGuid', lookup: lookupObj,
    initialEditValue: availableOrgUsers.length > 0 ? availableOrgUsers[0][0] : undefined,
    editComponent: props => {
      return (<Select
        value={props.value || ''}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {/* shows only user not already included in this team or the user currently in edit mode */}
        {orgUsersEntries.filter(entry => !membersIds.includes((entry[0])) || props.rowData.id === parseInt(entry[0]))
          .map((entry) => (
            <MenuItem
              key={entry[0]}
              value={entry[0]}
            >
              <ListItemText primary={entry[1] as string} />
            </MenuItem>))}
      </Select>)
    }
  }]
}

const RenderMembersTables = (
  rowData,
  t,
  users,
  usersLoading,
  setUpdating,
  teamAPIFactory,
  displayErrorSnackbar,
  loadTeams,
  localization
) => {
  // Return lookup table with the possible users to be selected

  const membersIds = useMemo(() => rowData?.members?.map((mem) => {
    console.log('heymem', mem)
    return mem.fusionAuthUserGuid}) || [], [rowData])
  const genLookupObject = () => {
    let persons: any = {}
    console.log('heyusers', Object.entries(users)[0])
    Object.entries(users).filter((entry: [string, any]) => entry[1].organization.id === rowData.organization.id).forEach(([key, value]: any) => {
      persons[value.user.id] = (value.user.displayName == null ? (value.user.username == null ? value.user.email : value.user.username) : value.user.displayName)
    })
    console.log('heypersons', persons)
    return persons
  }

  // Sync the new members setting, after the user edited
  const SetTeamMembsFromInput = async (newTeamMemInput) => {
    try {
      // loading ON
      setUpdating(true)
      await teamAPIFactory.teamsSetTeamMembers(newTeamMemInput)
      await loadTeams() // refresh
    } catch (err) {
      displayErrorSnackbar((err as any)?.response?.data.error as String)
    } finally {
      console.log('DOWNLOAD TEAMS, HERE WE GO: ', rowData)
      // loading OFF
      setUpdating(false)
    }
  }

  // If no row is selected...
  if (!rowData || !rowData.id) {
    return (
      <div className="teams-select-team-centered">
        <span>
          <h1>{t('admin:team_select_members')}</h1>
        </span>
      </div>
    )
  }
console.log('Rdatas', rowData)
  return (
    <MaterialTable
      isLoading={usersLoading}
      components={{
        Container: (props) => <Paper className="insideTable table-wrap-style" elevation={0} {...props} />
      }}
      title={rowData.name}
      localization={localization}
      options={{
        // toolbar: false,
        // showTitle: false,
        paging: false,
        search: false,
        addRowPosition: 'first', // When adding a new element, where to add it (top or bottom)
        actionsColumnIndex: -1 // In which position is the actions column, -1 is the last,
      }}
      data={rowData.members!}
      style={{
        margin: '0px',
        height: '100%',
        width: '100%'
      }}
      columns={localizeMemColumns(t, genLookupObject, membersIds)}
      editable={{
        onRowAdd: async (newData: any) => {
          console.log('heyadding team member upd', newData)
          const ids: string[] = membersIds.concat([newData.fusionAuthUserGuid])
          const newTeamMemInput: SetTeamMembersInput = {
            teamId: rowData.id,
            membersGuids: ids
          }
          await SetTeamMembsFromInput(newTeamMemInput)
        },
        onRowUpdate: async (newData: any, oldData?: any) => {
          let ids = [...membersIds]
          const i = ids.indexOf(oldData!.fusionAuthUserGuid)
          ids[i] = String(newData!.fusionAuthUserGuid)
          const newTeamMemInput: SetTeamMembersInput = {
            teamId: rowData.id,
            membersGuids: ids
          }
          await SetTeamMembsFromInput(newTeamMemInput)
        },
        onRowDelete: async (oldData: any) => {
          let ids: string[] = [...membersIds]
          const i = ids.indexOf(String(oldData!.fusionAuthUserGuid))
          ids.splice(i, 1)
          const newTeamMemInput: SetTeamMembersInput = {
            teamId: rowData.id,
            membersGuids: ids
          }
          await SetTeamMembsFromInput(newTeamMemInput)
        }
      }}
    />
  )
}

export function Teams() {
  // Load Hook to retrieve list of all users
  const { usersData, isUserLoading } = useUsersList()
  const { isOrgLoading, orgLookup } = useOrgList()
  // Documents involved in translation
  const { t } = useTranslation(['admin', 'tables'])

  // Load api to get the data needed for Teams, set it to backoffice (not public) and load load the configurations
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const teamAPIFactory = TeamsApiFactory(backendAPIConfig)
  const methodName: KRTmsApiPC = 'teamsGetTeams'
  const opts: APIAxiosHookOpts<TmsApiPC> = {
    type: 'backoffice',
    args: [MAX_RESULT_COUNT], // TODO ADD PAGING PARAMS AND FILTERS
    paramCreator: TeamsApiAxiosParamCreator,
    methodName
  }
  const [
    { data: result, loading: teamsLoading, error: teamsError },
    loadTeams
  ] = useAxiosWithParamCreator<TmsApiPC, DTResultOfTeamOutputDto | undefined>(opts, false)

  const { displayErrorSnackbar } = useSnackbars()
  const teams: TeamOutputDto[] = result?.data || []
  const [updating, setUpdating] = useState<boolean>(false)
  const [data, setData] = useState<TeamOutputDto[]>(teams)
  const isLoading: boolean = updating || teamsLoading || isOrgLoading// true if one true, otherwise false
  const [selectedRow, setSelectedRow] = useState<number>(-1)
  const [membersData, setMembersData] = useState<TeamOutputDto>(selectedRow !== -1 ? teams[selectedRow] : {})


  useEffect(() => {

    if (!teamsLoading) {

      setData(teams)

      if (selectedRow !== -1) {
        setMembersData(teams.find((team: TeamOutputDto) => team.id === selectedRow) || {})
      }
    }
  }, [teamsLoading, teams, selectedRow])

  useEffect(() => {
    if (teamsError) {
      displayErrorSnackbar(teamsError.response?.data.error)
    }
  }, [teamsError, displayErrorSnackbar])

  const columns = useMemo(() => localizeColumns(t, orgLookup), [t, orgLookup])

  const localization = useMemo(() => localizeMaterialTable(t), [t])

  return (
    <AdministrationContainer>
      <div className="not-column-centered">
        <div className="table-container table-container-half table-container-half-left">
          <MaterialTable
            isLoading={isLoading}
            components={{
              Container: (props) => <Paper className="table-wrap-style" elevation={0} {...props} />
            }}
            style={{
              width: '100%',
              height: '100%'
            }}
            title={
              <Typography variant="h5" component="span">
                {t('admin:team_name')}
                <RefreshButton onClick={() => loadTeams()} />
              </Typography>
            }
            options={{
              sorting: true,
              pageSize: 10,
              paging: false,
              pageSizeOptions: [10, 20, 30],
              addRowPosition: 'first', // When adding a new element, where to add it (top or bottom)
              actionsColumnIndex: -1, // In which position is the actions column, -1 is the last, default is 0
              maxBodyHeight: '63vh',
              minBodyHeight: '63vh',
              rowStyle: (rowData) => ({
                backgroundColor:
                  selectedRow === rowData.tableData.id ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
              })
            }}
            localization={localization}
            data={data}
            columns={columns}
            onRowClick={(e, rowData: any) => {
              setSelectedRow(rowData.id!)
            }}
            editable={{
              onRowAdd: async (newData) => {
                const newTeamInput: CreateUpdateTeamInput = {
                  team: {
                    name: newData.name as string,
                    organizationId: newData.organization?.id || newData['organization.id']
                  }
                }
                try {
                  // loading ON
                  setUpdating(true)
                  await teamAPIFactory.teamsCreateOrUpdateTeam(newTeamInput)
                  await loadTeams() // refresh
                } catch (err) {
                  displayErrorSnackbar((err as any)?.response?.data.error as String)
                } finally {
                  // loading OFF
                  setUpdating(false)
                }
              },
              onRowUpdate: async (newData: TeamOutputDto, oldData?: TeamOutputDto) => {
                const newTeamInput: CreateUpdateTeamInput = {
                  team: { ...newData, name: newData.name! }
                }
                try {
                  // loading ON
                  setUpdating(true)
                  await teamAPIFactory.teamsCreateOrUpdateTeam(newTeamInput)
                  await loadTeams() // refresh
                } catch (err) {
                  displayErrorSnackbar((err as any)?.response?.data.error as String)
                } finally {
                  // loading OFF
                  setUpdating(false)
                }
              },
              onRowDelete: async (oldData: TeamOutputDto) => {
                const id = oldData.id
                if (typeof id !== undefined) {
                  try {
                    // loading ON
                    setUpdating(true)
                    await teamAPIFactory.teamsDeleteTeam(id)
                    await loadTeams() // refresh
                  } catch (err) {
                    displayErrorSnackbar((err as any)?.response?.data.error as String)
                  } finally {
                    // loading OFF
                    setUpdating(false)
                  }
                }
              }
            }}
          />
        </div>
        <div className="table-container table-container-half table-container-half-right">
          {RenderMembersTables(
            membersData,
            t,
            usersData,
            isUserLoading,
            setUpdating,
            teamAPIFactory,
            displayErrorSnackbar,
            loadTeams,
            localization
          )}
        </div>
      </div>
    </AdministrationContainer>
  )
}
