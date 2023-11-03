import { DTOrder, DTOrderDir, UsersApiFactory } from 'ermes-backoffice-ts-sdk'
import MaterialTable, { Options } from 'material-table'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { localizeMaterialTable } from '../../../common/localize-material-table'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import { ProfileApiFactory } from 'ermes-ts-sdk'
import { Chip, makeStyles, Typography } from '@material-ui/core'
import { AdministrationContainer } from '../../../common/common.components'
import { CreatAxiosInstance } from '../../../utils/axios.utils'

const options: Options<any> = {
  sorting: false,
  search: true,
  paging: true,
  pageSize: 10,
  pageSizeOptions: [10, 20, 30, 40, 50],
  loadingType: 'overlay',
  maxBodyHeight: '63vh',
  minBodyHeight: '63vh',
  addRowPosition: 'first', // When adding a new element, where to add it (top or bottom)
  actionsColumnIndex: -1 // In which position is the actions column, -1 is the last, default is 0
}

const useStyles = makeStyles((theme) => ({
  chipContainer: {
    width: '100%',
    zIndex: 1
  },
  chipStyle: {
    zIndex: 30,
    marginBottom: 3,
    marginRight: '3px',
    position: 'relative',
    float: 'left'
  }
}))

const UncompletedUsersComponent = (props) => {
  const classes = useStyles()
  const { t, i18n } = useTranslation(['admin', 'tables'])
  const { language } = i18n
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const backendUrl = backendAPIConfig.basePath!
  const axiosInstance = CreatAxiosInstance(backendUrl)  
  const usersAPIFactory = UsersApiFactory(backendAPIConfig, backendUrl, axiosInstance)
  const profileAPIFactory = ProfileApiFactory(backendAPIConfig, backendUrl, axiosInstance)
  const { displaySuccessSnackbar, displayErrorSnackbar } = useSnackbars()

  const localizeColumns = useMemo(() => {
    return [
      {
        title: t('admin:user_fusion_auth_id'),
        field: 'user.id',
        render: (rowData) => rowData.user.id
      },
      {
        title: t('admin:user_email'),
        field: 'user.email',
        render: (rowData) => rowData.user.email
      },
      {
        title: t('admin:user_username'),
        field: 'user.username',
        render: (rowData) => rowData.user.displayName
      },
      {
        title: t('admin:user_roles'),
        field: 'user.roles',
        render: (rowData) => {
          return (
            <div className={classes.chipContainer}>
              {rowData?.user?.roles?.map((value) => {
                return (
                  <Chip
                    key={value}
                    label={t('common:role_' + value)}
                    size="small"
                    className={classes.chipStyle}
                  />
                )
              })}
            </div>
          )
        }
      },
      {
        title: t('admin:user_org_name'),
        field: 'organization.shortName',
        render: (rowData) => rowData.organization?.shortName
      },
      {
        title: t('admin:user_verified'),
        field: 'user.verified',
        render: (rowData) => {
          if (rowData.user.verified) {
            return <CheckIcon />
          } else {
            return <ClearIcon />
          }
        }
      }
    ]
  }, [language])

  const loadIncompletedRegistrationUsers = useCallback(
    async (query) => {
      const response = await usersAPIFactory
        .usersGetUncompletedUsers(
          query.pageSize,
          query.page * query.pageSize,
          0,
          query.search,
          false,
          //TODO: sorting not working
          //Current OpenAPI version does not support array in query string
          //https://stackoverflow.com/questions/52892768/openapi-query-string-parameter-with-list-of-objects
          query.orderBy !== undefined
            ? ([
                {
                  column: query.orderBy.field,
                  dir: query.orderDirection === 'asc' ? DTOrderDir.ASC : DTOrderDir.DESC
                }
              ] as DTOrder[])
            : undefined
        )
        .then((response) => {
          if (response && response.data && response.data.data) {
            return {
              data: response.data.data!,
              page: query.page,
              totalCount: response.data.recordsTotal!
            }
          } else {
            return {
              data: [],
              page: query.page,
              totalCount: 0
            }
          }
        })
        .catch((err) => {
          displayErrorSnackbar(err)
          return {
            data: [],
            page: query.page,
            totalCount: 0
          }
        })
      return response
    },
    [displayErrorSnackbar, usersAPIFactory]
  )

  const deleteImcompleteRegistrationUser = useCallback(
    (fusionAuthUserId) => {
      profileAPIFactory
        .profileDeleteProfile(fusionAuthUserId)
        .then((response) => {
          if (response && response.data) {
            displaySuccessSnackbar(t('admin:uncompleted_users_delete_success'))
          } else {
            displayErrorSnackbar(t('admin:uncompleted_users_delete_error'))
          }
        })
        .catch((err) => {
          displayErrorSnackbar(err)
        })
    },
    [displaySuccessSnackbar, displayErrorSnackbar]
  )

  const localization = useMemo(
    () => localizeMaterialTable(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  )

  return (
    <AdministrationContainer>
      <div className="table-container">
        <MaterialTable
          style={{
            width: '100%',
            height: '100%'
          }}
          columns={localizeColumns}
          title={
            <Typography variant="h5" component="span">
              {t('admin:uncompleted_users')}
            </Typography>
          }
          options={options}
          localization={localization}
          data={(query) =>
            new Promise((resolve, reject) => {
              loadIncompletedRegistrationUsers(query).then((response) =>
                resolve({
                  data: response.data,
                  page: query.page,
                  totalCount: response.totalCount
                })
              )
            })
          }
          editable={{
            onRowDelete: async (oldData) => {
              const userId = oldData.user.id
              deleteImcompleteRegistrationUser(userId)
            }
          }}
        />
      </div>
    </AdministrationContainer>
  )
}

export default UncompletedUsersComponent
