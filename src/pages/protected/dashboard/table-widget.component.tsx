import React from 'react';
import MaterialTable, { Column, Options } from 'material-table'
import { useTranslation } from 'react-i18next'

export const TableWidget = (
    props
) => {
    const { t, i18n } = useTranslation(['labels', 'tables'])
    const columns = [
        { title: t('username'), field: 'username' },
        { title: t('user_ssn'), render: rowData => rowData.id },
        { title: t('organizationName'), field: 'organizationName' },
        { title: t('status'), field: 'status' },
        { title: t('activityName'), field: 'activityName' },
        { title: t('timestamp'), field: 'timestamp' }
    ]
    return (
        <div
            style={{ overflowY: 'auto', height: '95%' }}
        >
            <MaterialTable
                data={props.data}
                columns={columns}
                options={{
                    search: false,
                    toolbar: true,
                    showTitle: false,
                    paging: false,
                    doubleHorizontalScroll: false,
                    exportButton: true,
                    exportAllData: true,
                    exportFileName: t("labels:"+props.title) as string,
                    exportDelimiter: ','
                    // maxBodyHeight: '90%'
                }}
                localization={{
                    toolbar: {
                        exportCSVName: t("tables:toolbar_exportCsv"),
                        exportPDFName: t("tables:toolbar_exportPdf")
                    }
                }}
            // style={{ overflowX: 'scroll', width: '120%' }}
            />
        </div>
    )
}