import React, { useMemo } from 'react'
import Typography from '@material-ui/core/Typography'
import MaterialTable, { Column, Options } from 'material-table'
import { AdministrationContainer, RefreshButton } from '../common/common.components'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { localizeMaterialTable } from '../../../common/localize-material-table'
import {
  useAPIConfiguration
} from '../../../hooks/api-hooks'
import {
  OrganizationsApiFactory,
  OrganizationDto,
  CreateOrUpdateOrganizationInput
} from 'ermes-backoffice-ts-sdk'
import useOrgList from '../../../hooks/use-organization-list.hooks'

const options: Options<any> = {
  sorting: true,
  pageSize: 10,
  pageSizeOptions: [10, 20, 30],
  addRowPosition: 'first',
  actionsColumnIndex: -1,
  maxBodyHeight: '63vh',
  minBodyHeight: '63vh'
}


function localizeColumns(t: TFunction): Column<OrganizationDto>[] {
  return [
    {
      // see https://material-table.com/#/docs/features/custom-column-rendering
      title: t('org_logo'),
      field: 'logoUrl',
      render: (rowData) =>
        rowData.logoUrl ? (
          <img alt="logo" src={rowData.logoUrl} style={{ width: 40, borderRadius: '50%' }} />
        ) : (
          <span>-</span> // add default logo?
        )
    },
    { title: t('org_short_name'), field: 'shortName' },
    { title: t('org_name'), field: 'name' },
    { title: t('org_description'), field: 'description' },
    { title: t('org_website'), field: 'webSite' }
  ]
}


export function Organizations() {
  const { t, i18n } = useTranslation(['admin', 'tables'])
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const orgAPIFactory = OrganizationsApiFactory(backendAPIConfig)
  const { displayErrorSnackbar } = useSnackbars()

  const { orgData, isOrgLoading, loadOrganizations, setOrgUpdating } = useOrgList()

  const columns = useMemo(
    () => localizeColumns(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  )
  // eslint-enable-next-line react-hooks/exhaustive-deps

  const localization = useMemo(
    () => localizeMaterialTable(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  )
  // eslint-enable-next-line react-hooks/exhaustive-deps

  console.debug('organizations', orgData, isOrgLoading)

  return (
    <AdministrationContainer>
      <div className="table-container">
        <MaterialTable
          isLoading={isOrgLoading}
          style={{
            width: '100%',
            height: '100%'
          }}
          title={
            <Typography variant="h5" component="span">
              {t('admin:organizations')}
              <RefreshButton
                onClick={() =>
                  loadOrganizations(/* {
                    headers: {
                      Accept: 'application/json'
                    }
                  } */)
                }
              />
            </Typography>
          }            
          onRowClick={(e, rowData: any) => {
            // console.log(rowData)
            return  window.location.href=window.location.href + '/teams'
          }}
          options={options}
          //options={{ ...options, minBodyHeight: bodyHeight, maxBodyHeight: bodyHeight }}
          localization={localization}
          data={orgData}
          columns={columns}
          editable={{
            onRowAdd: async (newData: OrganizationDto) => {
              const newDataInput: CreateOrUpdateOrganizationInput = {
                organization: newData
              }
              try {
                // loading ON
                setOrgUpdating(true)
                await orgAPIFactory.organizationsCreateOrUpdateOrganization(newDataInput)
                await loadOrganizations() // refresh
              } catch (err) {
                displayErrorSnackbar(err.response?.data.error)
              } finally {
                // loading OFF
                setOrgUpdating(false)
              }
            },
            onRowUpdate: async (newData: OrganizationDto, oldData?: OrganizationDto) => {
              const newDataInput: CreateOrUpdateOrganizationInput = {
                organization: newData
              }
              try {
                // loading ON
                setOrgUpdating(true)
                await orgAPIFactory.organizationsCreateOrUpdateOrganization(newDataInput)
                await loadOrganizations() // refresh
              } catch (err) {
                displayErrorSnackbar(err.response?.data.error)
              } finally {
                // loading OFF
                setOrgUpdating(false)
              }
            },
            onRowDelete: async (oldData: OrganizationDto) => {
              const id = oldData.id
              if (typeof id !== undefined) {
                try {
                  // loading ON
                  setOrgUpdating(true)
                  await orgAPIFactory.organizationsDeleteOrganization(id)
                  await loadOrganizations() // refresh
                } catch (err) {
                  displayErrorSnackbar(err.response?.data.error)
                } finally {
                  // loading OFF
                  setOrgUpdating(false)
                }
              }
            }
          }}
        />
      </div>
    </AdministrationContainer>
  )
}
