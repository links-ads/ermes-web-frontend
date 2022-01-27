import Typography from '@material-ui/core/Typography'
import { UsersApiFactory, ProfileDto, UpdateProfileInput } from 'ermes-backoffice-ts-sdk'
import { TFunction } from 'i18next'
import MaterialTable, { Column, Options } from 'material-table'
import React, { useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { localizeMaterialTable } from '../../../common/localize-material-table'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import { AdministrationContainer, RefreshButton } from '../../../common/common.components'
import useUsersList from '../../../hooks/use-users-list.hook'
import useOrgList from '../../../hooks/use-organization-list.hooks'
import { Box, Chip, MenuItem, OutlinedInput, Select } from '@material-ui/core'
import useRolesList from '../../../hooks/use-roles.hook'
import { RoleDto, UserDto } from 'ermes-backoffice-ts-sdk'
import { makeStyles } from '@material-ui/core/styles'
import { ClassNameMap } from '@material-ui/core/styles/withStyles'

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
  isSelectorOpen: boolean,
  setIsSelectorOpen: (elem: boolean) => void
): Column<ProfileDto>[] {
  const lookupKeys = Object.keys(orgLookup)
  const empty = lookupKeys[0]
  const UserRoles = rolesData.map((r) => r.name) as string[]

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
      // lookup:  UserDto.roles,
      width: '30%',
      render: (rowData) => (
        <div className={classes.chipContainer}>
          {rowData?.user?.roles?.map((value) => (
            <Chip key={value} label={value} size="small" className={classes.chipStyle} />
          ))}
        </div>
      ),
      initialEditValue: [],
      editComponent: (cellData) => {
        return (
          <Select
            labelId="demo-multiple-name-label"
            id="demo-multiple-name"
            multiple
            
            open={isSelectorOpen}
            defaultValue={['first_responder']}
            value={cellData.value || ['first_responder']}
            onClick={(e) => {
              setIsSelectorOpen(true)
            }}
            onChange={(item) => {
              // Add the new value to the end array
              cellData.value.splice(
                0,
                cellData.value.length,
                ...(item.target.value as UserRolesType[])
              )
            }}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            renderValue={(selected) => (
              <div className={classes.chipContainer}>
                {(selected as []).map((value) => (
                  <Chip key={value} label={value} size="small" className={classes.chipStyle} />
                ))}
              </div>
            )}
          >
            {UserRoles?.map((name) => (
              <MenuItem
                key={name}
                value={name}
                onClick={(e) => {
                  setIsSelectorOpen(false)
                }}
              >
                {name}
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
  const [isSelectorOpen, setisSelectorOpen] = useState(true)

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
            isSelectorOpen,
            setisSelectorOpen
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
