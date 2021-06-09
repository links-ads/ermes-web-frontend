import React from 'react';
import MaterialTable, { Column, Options } from 'material-table'
import { useTranslation } from 'react-i18next'

export const TableWidget = (
    props
) => {
    const { t, i18n } = useTranslation(['labels'])
    // TODO convertire nomi in ogni lingua
    let dateOptions = { dateStyle: 'short', timeStyle: 'short', hour12: false } as Intl.DateTimeFormatOptions
    let formatter = new Intl.DateTimeFormat('en-GB', dateOptions)
    const columns = [
        { title: t('username'), field: 'username' },
        { title: t('user_ssn'), render: rowData => rowData.id },
        { title: t('organizationName'), field: 'organizationName' },
        { title: t('status'), field: 'status' },
        { title: t('activityName'), render: rowData => rowData.status === 'Active' ? rowData.activityName : '-' },
        { title: t('timestamp'), render: rowData => formatter.format(new Date(rowData.timestamp)) }
    ]
    return (
        <div
        style={{ overflowY: 'auto', height: '95%'}}
        >
            <MaterialTable
                data={props.data}
                columns={columns}
                options={{
                    search: false,
                    toolbar: false,
                    paging: false,
                    doubleHorizontalScroll: false,
                    // maxBodyHeight: '90%'
                }}
                // style={{ overflowX: 'scroll', width: '120%' }}
            />
        </div>
    )
}