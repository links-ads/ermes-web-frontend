import { TFunction } from 'i18next'
import { Localization } from 'material-table'

export function localizeMaterialTable(t: TFunction): Localization {
  return {
    body: {
      emptyDataSourceMessage: t('tables:body_emptyDataSourceMessage'),
      addTooltip: t('tables:body_addTooltip'),
      deleteTooltip: t('tables:body_deleteTooltip'),
      editTooltip: t('tables:body_editTooltip'),
      filterRow: {
        filterTooltip: t('tables:body_filterRow_filterTooltip')
      },
      editRow: {
        deleteText: t('tables:body_editRow_deleteText'),
        cancelTooltip: t('tables:body_editRow_cancelTooltip'),
        saveTooltip: t('tables:body_editRow_saveTooltip')
      }
    },
    grouping: {
      placeholder: t('tables:grouping_placeholder')
    },
    header: {
      actions: t('tables:header_actions')
    },
    pagination: {
      labelDisplayedRows: t('tables:pagination_labelDisplayedRows'),
      labelRowsSelect: t('tables:pagination_labelRowsSelect'),
      labelRowsPerPage: t('tables:pagination_labelRowsPerPage'),
      firstAriaLabel: t('tables:pagination_firstAriaLabel'),
      firstTooltip: t('tables:pagination_firstTooltip'),
      previousAriaLabel: t('tables:pagination_previousAriaLabel'),
      previousTooltip: t('tables:pagination_previousTooltip'),
      nextAriaLabel: t('tables:pagination_nextAriaLabel'),
      nextTooltip: t('tables:pagination_nextTooltip'),
      lastAriaLabel: t('tables:pagination_lastAriaLabel'),
      lastTooltip: t('tables:pagination_lastTooltip')
    },
    toolbar: {
      addRemoveColumns: t('tables:toolbar_addRemoveColumns'),
      nRowsSelected: t('tables:toolbar_nRowsSelected'),
      showColumnsTitle: t('tables:toolbar_showColumnsTitle'),
      showColumnsAriaLabel: t('tables:toolbar_showColumnsAriaLabel'),
      exportTitle: t('tables:toolbar_exportTitle'),
      exportAriaLabel: t('tables:toolbar_exportAriaLabel'),
      //exportName: t('tables:toolbar_exportName'),
      searchTooltip: t('tables:toolbar_searchTooltip'),
      searchPlaceholder: t('tables:toolbar_searchPlaceholder')
    }
  }
}
