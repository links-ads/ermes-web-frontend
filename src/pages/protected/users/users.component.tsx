import Typography from '@material-ui/core/Typography'
import {
  UsersApiFactory,
  ProfileDto,
  UpdateProfileInput
} from 'ermes-backoffice-ts-sdk'
import { TFunction } from 'i18next'
import MaterialTable, { Column, Options } from 'material-table'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { localizeMaterialTable } from '../../../common/localize-material-table'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import { AdministrationContainer, RefreshButton } from '../common/common.components'
import useUsersList from '../../../hooks/use-users-list.hook'
import useOrgList from '../../../hooks/use-organization-list.hooks'

const options: Options = {
  sorting: true,
  pageSize: 10,
  pageSizeOptions: [10, 20, 30],
  addRowPosition: 'first',
  actionsColumnIndex: -1,
  maxBodyHeight: '63vh',
  minBodyHeight: '63vh'
}

function localizeColumns(t: TFunction, orgLookup): Column<ProfileDto>[] {
  const empty = Object.keys(orgLookup)[0]
  return [
    {
      title: t('admin:user_avatar'),
      field: 'user.imageUrl',
      render: (rowData) =>
        rowData.user.imageUrl ? (
          <img
            alt="profile"
            src={rowData.user.imageUrl}
            style={{ width: 40, borderRadius: '50%' }}
          />
        ) : (
          <span>-</span> // add default avatar?
        )
    },
    { title: t('admin:user_username'), field: 'user.username' },
    { title: t('admin:user_email'), field: 'user.email' },
    { title: t('admin:user_first_name'), field: 'user.firstName' },
    { title: t('admin:user_last_name'), field: 'user.lastName' },
    {
      title: t('admin:user_org_name'),
      field: 'organization.id',
      editable: 'onAdd',
      lookup: orgLookup,
      emptyValue: empty,
      initialEditValue: empty,
      
    }
  ]
}


export function Users() {
  const { isOrgLoading, orgLookup } = useOrgList()
  const { t, i18n } = useTranslation(['admin', 'tables'])
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const userAPIFactory = UsersApiFactory(backendAPIConfig)

  const { displayErrorSnackbar } = useSnackbars()
  const { usersData, isUserLoading, loadUsers, setUserUpdating, updating } = useUsersList()

  const isOverallLoading: boolean = updating || isOrgLoading || isUserLoading 
  // const lookupObject: any = {}

  // useEffect(() => {
  //   Object.entries(orgData).forEach(([key, value]: any) => {
  //     lookupObject[value.id] = value.name
  //   })
  //   console.log(lookupObject)
  // }, [isOverallLoading])

  // const columns = useMemo(
  //   () => localizeColumns(t, orgLookup),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [i18n.language]
  // )
  // eslint-enable-next-line react-hooks/exhaustive-deps

  const localization = useMemo(
    () => localizeMaterialTable(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  )
  // eslint-enable-next-line react-hooks/exhaustive-deps


  return (
    <AdministrationContainer>
      <div className="table-container">
        <MaterialTable
          isLoading={isOverallLoading}
          style={{
            width: '100%',
            height: '100%'
          }}
          title={
            <Typography variant="h5" component="span">
              {t('admin:users')}
              <RefreshButton
                onClick={() =>
                  loadUsers(/* {
                    headers: {
                      Accept: 'application/json'
                    }
                  } */)
                }
              />
            </Typography>
          }
          options={options}
          //options={{ ...options, minBodyHeight: bodyHeight, maxBodyHeight: bodyHeight }}
          localization={localization}
          data={usersData}
          columns={ localizeColumns(t, orgLookup)}
          editable={{
            onRowAdd: async (newData: ProfileDto) => {
              const newUserInput: UpdateProfileInput = {
                user: newData.user,
                // TODO HANDLE
                organizationId: newData.organization?.id
              }
              console.log(newData)
              try {
                // loading ON
                setUserUpdating(true)
                await userAPIFactory.usersCreateOrUpdateUser(newUserInput)
                await loadUsers() // refresh
              } catch (err) {
                displayErrorSnackbar(err.response?.data.error)
              } finally {
                // loading OFF
                setUserUpdating(false)
              }
            },
            onRowUpdate: async (newData: ProfileDto, oldData?: ProfileDto) => {
              const newUserInput: UpdateProfileInput = {
                user: newData.user,
                // TODO HANDLE
                organizationId: newData.organization?.id
              }
              try {
                // loading ON
                setUserUpdating(true)
                await userAPIFactory.usersCreateOrUpdateUser(newUserInput)
                await loadUsers() // refresh
              } catch (err) {
                displayErrorSnackbar(err.response?.data.error)
              } finally {
                // loading OFF
                setUserUpdating(false)
              }
            },
            onRowDelete: async (oldData: ProfileDto) => {
              const id = oldData.personId
              if (typeof id !== undefined) {
                try {
                  // loading ON
                  setUserUpdating(true)
                  // METHOD IS MISSING
                  // await userAPIFactory.deleteUserById(id)
                  await loadUsers() // refresh
                } catch (err) {
                  displayErrorSnackbar(err.response?.data.error)
                } finally {
                  // loading OFF
                  setUserUpdating(false)
                }
              }
            }
          }}
        />
      </div>
    </AdministrationContainer>
  )
}
