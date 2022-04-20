import Typography from '@material-ui/core/Typography'
import { UsersApiFactory, ProfileDto, UpdateProfileInput } from 'ermes-backoffice-ts-sdk'
import { TFunction } from 'i18next'
import MaterialTable, { Column, Options } from 'material-table'
import React, { useMemo, useEffect, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { localizeMaterialTable } from '../../../common/localize-material-table'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import { AdministrationContainer, RefreshButton } from '../../../common/common.components'
import useUsersList from '../../../hooks/use-users-list.hook'
import useOrgList from '../../../hooks/use-organization-list.hooks'
import { Box, Checkbox, Chip, ListItemText, MenuItem, OutlinedInput, Select } from '@material-ui/core'
import useRolesList from '../../../hooks/use-roles.hook'
import { RoleDto, UserDto } from 'ermes-backoffice-ts-sdk'
import { makeStyles } from '@material-ui/core/styles'
import { ClassNameMap } from '@material-ui/core/styles/withStyles'
import { strictEqual } from 'assert'
import { AppConfig, AppConfigContext } from '../../../config'

const options: Options<any> = {
  sorting: true,
  pageSize: 10,
  pageSizeOptions: [10, 20, 30],
  addRowPosition: 'first',
  actionsColumnIndex: -1,
  maxBodyHeight: '63vh',
  minBodyHeight: '63vh'
}
const useStyles = makeStyles((theme) => ({
  chipContainer: {
    width: '100%'
  },
  chipStyle: {
    marginBottom: 3,
    marginRight: '3px',
    position: 'relative',
    float: 'left'
  }
}))

function localizeColumns(
  t: TFunction,
  orgLookup,
  rolesData: RoleDto[],
  classes: ClassNameMap,
  runningSelectorID: number,
  setRunningSelectorID: (elem: number) => void,
  userTagsFilter: string[],
): Column<ProfileDto>[] {
  const lookupKeys = Object.keys(orgLookup)
  const empty = lookupKeys[0]
  const UserRoles = (rolesData.map((r) => r.name) as string[]).filter((r) => userTagsFilter.indexOf(r) === -1)
  const defaultRole = (rolesData as any[]).find((r) => r.default)?.name
  type UserRolesType = typeof UserRoles[number]

  return [
    {
      title: t('admin:user_avatar'),
      field: 'user.imageUrl',
      render: (rowData) => (
        <img
          alt="profile"
          src={
            rowData.user.imageUrl
              ? rowData.user.imageUrl
              : 'https://via.placeholder.com/40x40.png?text=' + t('common:image_not_available')
          }
          style={{ width: 40, borderRadius: '50%' }}
        />
      ),
      initialEditValue: ''
    },
    { title: t('admin:user_username'), field: 'user.username' },
    { title: t('admin:user_email'), field: 'user.email' },
    {
      title: t('admin:user_role'),
      field: 'user.roles',
      editable: 'always',
      disableClick: true,
      width: '30%',
      render: (rowData) => (
        <div className={classes.chipContainer}>
          {rowData?.user?.roles?.map((value) => (
            UserRoles.indexOf(value) !== -1 ? (
              <Chip key={value} label={t('common:role_' + value)} size="small" className={classes.chipStyle} />
            ) : null
          ))}
        </div>
      ),
      initialEditValue: [],
      editComponent: (cellData) => {
        if (cellData.rowData.user === undefined) {
          cellData.rowData.user = {
            roles: [defaultRole]
          }
        }
        return (
          <Select
            labelId="users-multiple-checkbox-label"
            id="users-multiple-checkbox"
            value={cellData?.rowData?.user?.roles}
            onChange={(item) => {
              if (cellData?.rowData?.user?.roles?.indexOf(item.target.value as string) === -1) {
                cellData.rowData.user.roles.push(item.target.value as UserRolesType)
              } else {
                cellData?.rowData?.user?.roles?.splice(cellData?.rowData?.user?.roles?.indexOf(item.target.value as UserRolesType), 1)
              }
            }}
            input={<OutlinedInput label="Tag" />}
            renderValue={(selected) => (
              <div className={classes.chipContainer}>
                {(selected as []).map((value) => (
                  UserRoles.indexOf(value) !== -1 ? (
                    <Chip key={value} label={t('common:role_' + value)} size="small" className={classes.chipStyle} />) : null
                ))}
              </div>
            )}
          >
            {UserRoles?.map((role) => (
              <MenuItem
                value={role}
                selected={false}
              >
                <ListItemText primary={t('common:role_' + role)} />
              </MenuItem>
            ))}
          </Select>
        )
      }
    },
    {
      title: t('admin:user_org_name'),
      field: 'organization.id',
      editable: 'onAdd',
      lookup: orgLookup,
      emptyValue: empty,
      initialEditValue: lookupKeys.length > 1 ? undefined : empty
    }
  ]
}

export function Users() {
  const classes = useStyles()
  const { isOrgLoading, orgLookup } = useOrgList()
  const { t, i18n } = useTranslation(['admin', 'tables'])
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const userAPIFactory = UsersApiFactory(backendAPIConfig)
  const [rolesData, fetchRoles] = useRolesList()

  const { displayErrorSnackbar } = useSnackbars()
  const { usersData, isUserLoading, loadUsers, setUserUpdating, updating } = useUsersList()

  const isOverallLoading: boolean = updating || isOrgLoading || isUserLoading
  const [runningSelectorID, setRunningSelectorID] = useState(0)
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const userTagsFilter = appConfig.userTagsFilter?.filters

  const localization = useMemo(
    () => localizeMaterialTable(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  )

  useEffect(() => {
    fetchRoles(
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, [])

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
          columns={localizeColumns(
            t,
            orgLookup,
            rolesData.data,
            classes,
            runningSelectorID,
            setRunningSelectorID,
            userTagsFilter ? userTagsFilter : []
          )}
          editable={{
            onRowAdd: async (newData: ProfileDto) => {
              const newUserInput: UpdateProfileInput = {
                user: {
                  ...newData.user,
                  roles: newData['user.roles'],
                  imageUrl: newData['user.imageUrl']
                },
                organizationId: newData.organization?.id || newData['organization.id']
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
            onRowUpdate: async (newData: ProfileDto, oldData?: ProfileDto) => {
              const newUserInput: UpdateProfileInput = {
                user: newData.user,
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
