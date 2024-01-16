import React, { useState, useEffect, useMemo } from 'react'
import Typography from '@material-ui/core/Typography'

/*
Replaced material-table with material-table/core for teams, organization and users pages because of this bug:
https://github.com/mbrn/material-table/issues/2650 which was causing random crashes and in general poor performance. 

For the table present in the dashboard, the original material-table is used because it contains the export functionality, not available in the materia-table-core library.
*/
// import MaterialTable, { Column } from 'material-table'
import MaterialTable, { Column } from '@material-table/core'
import { forwardRef } from 'react';
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Paper, TextField, Checkbox, FormControlLabel } from '@material-ui/core'
import { CheckBoxOutlineBlank, CheckBox, Edit } from '@material-ui/icons'
import Autocomplete from '@material-ui/lab/Autocomplete';
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
import { getUserPermissions, useUser } from '../../../state/auth/auth.hooks';

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
function localizeMemColumns(t: TFunction, genLookupObject: Function, membersList: Array<any>, membersTeamId: string): Column<TeamOutputDto>[] {
  const [ selectUsersList, lookupPeople ] = genLookupObject(); 
  // icons for checkbox multi select
  const icon = <CheckBoxOutlineBlank fontSize="small" />;
  const checkedIcon = <CheckBox fontSize="small" />;
  return [{
    title: "id",
    field: 'id', 
    lookup: lookupPeople,
    initialEditValue: membersList,
    editComponent: props => {
      return (      
      <Autocomplete
        multiple
        id={`autocomplete-${membersTeamId}`}
        key={`autocomplete-${membersTeamId}`}
        size="small"
        options={selectUsersList}
        getOptionLabel={(option) => option.name}
        getOptionSelected={(option, value) => option.id === value.id}
        renderOption={(option, { selected }) => (
          <FormControlLabel
            key={option.id}
            control={<Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />}
            label={option.name}
          />
        )}
        disableCloseOnSelect
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={t('admin:team_choose_members')}
          />
        )}        
        value={props.value}
        onChange={(event, newValue) => props.onChange(newValue)}
      />
      )
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
  displaySuccessSnackbar,
  loadTeams,
  localization
) => {
  // Return lookup table with the possible users to be selected

  const membersTeamId = rowData.id;

  const membersList = useMemo(
    () =>
      rowData?.members?.map((member) => {
        let memberObj = {
          id: member.fusionAuthUserGuid,
          name: member.displayName
        }
        return memberObj
      }) || [],
    [rowData]
  );
  
  const genLookupObject = () => {
    // generate lookup object
    let lookupPeople = {}
    // map to user object with id and name to display
    let selectUsers = users.map((elem) => {
      let selectUser = {
        id: elem.user.id,
        name: elem.user.displayName
      }
      lookupPeople[selectUser.id] = selectUser.name
      return selectUser
    })

    return [selectUsers, lookupPeople]
  }

  const membersColumns = useMemo(() => localizeMemColumns(t, genLookupObject, membersList, membersTeamId), [membersList, membersTeamId]);

  // Sync the new members setting, after the user edited
  const SetTeamMembsFromInput = async (newTeamMemInput) => {
    try {
      // loading ON
      setUpdating(true)
      await teamAPIFactory.teamsSetTeamMembers(newTeamMemInput);
      await loadTeams() // refresh
      displaySuccessSnackbar(t('admin:team_members_update_success'));
    } catch (err) {
      displayErrorSnackbar((err as any)?.response?.data.error as String)
    } finally {      
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
  return (
      <MaterialTable
        key={membersTeamId}
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
        data={membersList}
        style={{
          margin: '0px',
          height: '100%',
          width: '100%'
        }}
        columns={membersColumns}
        icons={{
          Add: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
        }}
        editable={{
          onRowAdd: async (newData: any) => {
            const selectedMembersIds = newData.id.map((elem) => elem.id) as string[]
            const newTeamMemInput: SetTeamMembersInput = {
              teamId: rowData.id,
              membersGuids: selectedMembersIds
            }
            await SetTeamMembsFromInput(newTeamMemInput)
          },
          onRowDelete: async (oldData: any) => {
            const newMembersIds = membersList.filter((m) => m.id !== oldData!.id).map((m) => m.id) as string[]
            const newTeamMemInput: SetTeamMembersInput = {
              teamId: rowData.id,
              membersGuids: newMembersIds
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

  const { profile } = useUser()
  const { canCreateTeam, canUpdateTeam } = getUserPermissions(profile)

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

  const { displayErrorSnackbar, displaySuccessSnackbar } = useSnackbars()
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
              isEditable: (rowData) => canUpdateTeam,
              isEditHidden: (rowData) => !canUpdateTeam,
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
            displaySuccessSnackbar,
            loadTeams,
            localization
          )}
        </div>
      </div>
    </AdministrationContainer>
  )
}
