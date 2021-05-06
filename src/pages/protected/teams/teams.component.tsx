import React, { useState, useEffect, useMemo } from 'react'
import Typography from '@material-ui/core/Typography'
import MaterialTable, { Column } from 'material-table'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Paper } from '@material-ui/core'
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
import { AdministrationContainer, RefreshButton } from '../common/common.components'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import { localizeMaterialTable } from '../../../common/localize-material-table'
import useUsersList from '../../../hooks/use-users-list.hook'

const MAX_RESULT_COUNT = 1000
type TmsApiPC = typeof TeamsApiAxiosParamCreator
type KRTmsApiPC = keyof ReturnType<TmsApiPC>

function localizeColumns(t: TFunction): Column<TeamOutputDto>[] {
  return [
    { title: t('admin:team_name'), field: 'name' },
    { title: t('admin:team_org_name'), field: 'organization.name', editable: 'never' },
    {
      title: t('admin:team_people_count'),
      field: 'members.length',
      editable: 'never',
      emptyValue: '0'
    }
  ]
}
function localizeMemColumns(t: TFunction, genLookupObject: Function): Column<TeamOutputDto>[] {
  return [{ title: t('admin:team_mem_name'), field: 'id', lookup: genLookupObject() }]
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
  const genLookupObject = () => {
    let persons: any = {}
    Object.entries(users).forEach(([key, value]: any) => {
      persons[value.personId] = value.user.username
    })
    console.log(persons)
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
      displayErrorSnackbar(err.response?.data.error)
    } finally {
      // loading OFF
      setUpdating(false)
    }
  }

  // If no row is selected...
  if (!rowData.id) {
    return (
      <div className="teams-select-team-centered">
        <span>
          <h1>{t('admin:team_select_members')}</h1>
        </span>
      </div>
    )
  }

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
      columns={localizeMemColumns(t, genLookupObject)}
      editable={{
        onRowAdd: async (newData: TeamOutputDto) => {
          const ids = rowData.members.map((mem) => mem.id).concat([Number(newData.id)])
          const newTeamMemInput: SetTeamMembersInput = {
            teamId: rowData.id,
            membersIds: ids
          }
          await SetTeamMembsFromInput(newTeamMemInput)
        },
        onRowUpdate: async (newData: TeamOutputDto, oldData?: TeamOutputDto) => {
          let ids = rowData.members.map((mem) => mem.id)
          const i = ids.indexOf(Number(oldData!.id))
          ids[i] = Number(newData!.id)
          const newTeamMemInput: SetTeamMembersInput = {
            teamId: rowData.id,
            membersIds: ids
          }
          await SetTeamMembsFromInput(newTeamMemInput)
        },
        onRowDelete: async (oldData: TeamOutputDto) => {
          let ids = rowData.members.map((mem) => mem.id)
          const i = ids.indexOf(Number(oldData!.id))
          ids.splice(i, 1)
          const newTeamMemInput: SetTeamMembersInput = {
            teamId: rowData.id,
            membersIds: ids
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
  const isLoading: boolean = updating || teamsLoading // true if one true, otherwise false
  const [membersData, setMembersData] = useState<TeamOutputDto>({})
  const [selectedRow, setSelectedRow] = useState<number>(-1)

  useEffect(() => {
    if (!teamsLoading) {
      setData(teams)
      if (selectedRow !== -1) {
        setMembersData(teams[selectedRow])
      }
    }
  }, [teamsLoading, selectedRow, teams])

  useEffect(() => {
    if (teamsError) {
      displayErrorSnackbar(teamsError.response?.data.error)
    }
  }, [teamsError, displayErrorSnackbar])

  const columns = useMemo(() => localizeColumns(t), [t])

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
              setMembersData(rowData!)
              setSelectedRow(rowData.tableData.id!)
            }}
            editable={{
              onRowAdd: async (newData: TeamOutputDto) => {
                const newTeamInput: CreateUpdateTeamInput = {
                  team: {
                    name: newData.name!
                  }
                }
                try {
                  // loading ON
                  setUpdating(true)
                  await teamAPIFactory.teamsCreateOrUpdateTeam(newTeamInput)
                  await loadTeams() // refresh
                } catch (err) {
                  displayErrorSnackbar(err.response?.data.error)
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
                  displayErrorSnackbar(err.response?.data.error)
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
                    displayErrorSnackbar(err.response?.data.error)
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
