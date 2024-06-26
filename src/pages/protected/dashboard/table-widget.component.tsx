import React from 'react';
import MaterialTable from 'material-table'
import { useTranslation } from 'react-i18next'
import {localizeMaterialTable} from '../../../common/localize-material-table'

export const TableWidget = (
    props
) => {
    const { t } = useTranslation(['labels', 'tables'])
    const columns = [
        { title: t('username'), field: 'displayName' },
        { title: t('user_ssn'), field: 'tax_code' },
        { title: t('organizationName'), field: 'organizationName' },
        { title: t('status'), field: 'status' },
        { title: t('activityName'), field: 'activityName' },
        { title: t('timestamp'), field: 'timestamp' }
    ]
    return (
        <div
            style={{ height: '95%' , overflowY:'auto'}}
        >
            <MaterialTable
                data={props.data}
                columns={columns}
                options={{
                    search: false,
                    toolbar: true,
                    showTitle: false,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 20, 30],
                    emptyRowsWhenPaging:false,
                    doubleHorizontalScroll: false,
                    exportButton: true,
                    exportAllData: true,
                    exportFileName: t("labels:" + props.title) as string,
                    exportDelimiter: ',',
                    maxBodyHeight: '90%'
                }}
                localization={{
                    ...localizeMaterialTable(t),
                    toolbar: {
                        exportCSVName: t("tables:toolbar_exportCsv"),
                        exportPDFName: t("tables:toolbar_exportPdf")
                    }
                }}
            />
        </div>
    )
}