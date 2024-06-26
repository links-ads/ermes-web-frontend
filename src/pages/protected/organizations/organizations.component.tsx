import React, { useMemo } from 'react'
import Typography from '@material-ui/core/Typography'
import MaterialTable, { Column, Options } from 'material-table'
import { AdministrationContainer } from '../../../common/common.components'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import { useTranslation } from 'react-i18next'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import {
  OrganizationsApiFactory,
  OrganizationDto,
  CreateOrUpdateOrganizationInput,
  DTOrderDir
} from 'ermes-backoffice-ts-sdk'
import useOrgList from '../../../hooks/use-organization-list.hooks'
import { useUserPermission, useUser } from '../../../state/auth/auth.hooks'
import { ROLE_ADMIN } from '../../../App.const'
import { Select, MenuItem } from '@material-ui/core'
import customClasses from './organization.module.css'
import { DTOrder } from 'ermes-ts-sdk'
import { localizeMaterialTable } from '../../../common/localize-material-table'
import {
  PermissionAction,
  PermissionEntity,
  PermissionGranularity
} from '../../../state/auth/auth.consts'

const options: Options<any> = {
  sorting: false,
  search: true,
  paging: true,
  pageSize: 10,
  pageSizeOptions: [10, 20, 30, 40, 50],
  maxBodyHeight: '63vh',
  minBodyHeight: '63vh',
  addRowPosition: 'first', // When adding a new element, where to add it (top or bottom)
  actionsColumnIndex: -1 // In which position is the actions column, -1 is the last, default is 0
}

export function Organizations() {
  const { t, i18n } = useTranslation(['admin', 'tables'])
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const orgAPIFactory = OrganizationsApiFactory(backendAPIConfig)
  const { displayErrorSnackbar } = useSnackbars()

  const user = useUser()
  const { orgData } = useOrgList()

  const canCreateParentOrganization = useUserPermission(
    PermissionEntity.ORGANIZATION,
    PermissionAction.CREATE,
    PermissionGranularity.PARENT
  )
  const canCreateChildOrganization = useUserPermission(
    PermissionEntity.ORGANIZATION,
    PermissionAction.CREATE,
    PermissionGranularity.CHILD
  )
  const canUpdateOrganization = useUserPermission(
    PermissionEntity.ORGANIZATION,
    PermissionAction.UPDATE
  )
  const canUpdateAllOrganizations = useUserPermission(
    PermissionEntity.ORGANIZATION,
    PermissionAction.UPDATE_ALL
  )

  function localizeColumns(): Column<OrganizationDto>[] {
    return [
      {
        title: t('org_logo'),
        field: 'logoUrl',
        render: (rowData) =>
          rowData.logoUrl ? (
            <img alt="logo" src={rowData.logoUrl} style={{ width: 40, borderRadius: '50%' }} />
          ) : (
            <span></span> // add default logo?
          ),
        initialEditValue: '',
        emptyValue: ''
      },
      { title: t('org_short_name'), field: 'shortName' },
      { title: t('org_name'), field: 'name' },
      { title: t('org_description'), field: 'description' },
      { title: t('org_members_tax_code'), field: 'membersHaveTaxCode', type: 'boolean' },
      {
        title: t('org_parent'),
        field: 'parentId',
        render: (rowData) => rowData.parentName,
        editComponent: (props) => {
          return (
            <Select
              displayEmpty={true}
              value={props.value}
              onChange={(e) => {
                props.onChange(e.target.value)
              }}
            >
              {canCreateParentOrganization && (
                <MenuItem value={undefined}>
                  <em>{t('org_no_parent')}</em>
                </MenuItem>
              )}
              {(canCreateParentOrganization || canCreateChildOrganization) &&
                orgData
                  .filter((entry) =>
                    canCreateParentOrganization
                      ? entry.parentId === null && entry.id !== props.rowData.id
                      : entry.parentId !== null
                  )
                  .map((entry) => (
                    <MenuItem
                      key={entry.id}
                      value={canCreateParentOrganization ? entry.id : entry.parentId!!}
                    >
                      {canCreateParentOrganization ? entry.name : entry.parentName}
                    </MenuItem>
                  ))}
            </Select>
          )
        }
      }
    ]
  }

  const localization = useMemo(
    () => localizeMaterialTable(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  )

  return (
    <AdministrationContainer>
      <div className={customClasses['organization-table-container']}>
        <MaterialTable
          columns={localizeColumns()}
          title={
            <Typography variant="h5" component="span">
              {t('admin:organizations')}
            </Typography>
          }
          options={options}
          localization={localization}
          data={(query) =>
            new Promise((resolve, reject) => {
              orgAPIFactory
                .organizationsGetOrganizations(
                  0,
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
                  resolve({
                    data: response.data.data!,
                    page: query.page,
                    totalCount: response.data.recordsTotal!
                  })
                })
            })
          }
          editable={{
            isEditable: (rowData) => canUpdateOrganization || canUpdateAllOrganizations,
            isEditHidden: (rowData) => !(canUpdateOrganization || canUpdateAllOrganizations),
            onRowAdd:
              canCreateParentOrganization || canCreateChildOrganization
                ? async (newData) => {
                    const newOrgInput: CreateOrUpdateOrganizationInput = {
                      organization: {
                        name: newData.name,
                        description: newData.description,
                        shortName: newData.shortName,
                        logoUrl: newData.logoUrl,
                        parentId: newData.parentId,
                        membersHaveTaxCode: newData.membersHaveTaxCode
                      }
                    }

                    if (!canCreateParentOrganization && !newData.parentId) {
                      displayErrorSnackbar(t('org_parent_required'))
                      return
                    }

                    try {
                      await orgAPIFactory.organizationsCreateOrUpdateOrganization(newOrgInput)
                      orgData.push(newOrgInput.organization)
                    } catch (err) {
                      displayErrorSnackbar((err as any)?.response?.data.error as String)
                    }
                  }
                : undefined,
            onRowUpdate:
              canUpdateOrganization || canUpdateAllOrganizations
                ? async (newData: OrganizationDto, oldData?: OrganizationDto) => {
                    const newOrgInput: CreateOrUpdateOrganizationInput = {
                      organization: { ...newData }
                    }

                    if (!canCreateParentOrganization && !newData.parentId) {
                      displayErrorSnackbar(t('org_parent_required'))
                      return
                    }

                    try {
                      await orgAPIFactory.organizationsCreateOrUpdateOrganization(newOrgInput)
                    } catch (err) {
                      displayErrorSnackbar((err as any)?.response?.data.error as String)
                    }
                  }
                : undefined
          }}
          onRowClick={(e, rowData: any) => {
            return (window.location.href = window.location.href + '/teams')
          }}
        />
      </div>
    </AdministrationContainer>
  )
}
