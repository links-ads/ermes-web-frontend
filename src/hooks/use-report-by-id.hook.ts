import { useCallback, useReducer, useMemo } from 'react'
import { ReportsApiFactory, GetEntityByIdOutputOfReportDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useTranslation } from 'react-i18next'

const initialState = { error: false, isLoading: true, data: {} }

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'FETCH':
      return {
        ...currentState,
        isLoading: true,
        data: {},
        error: false
      }
    case 'RESULT':
      return {
        isLoading: false,
        data: action.value,
        error: false
      }
    case 'ERROR':
      return {
        ...currentState,
        isLoading: false,
        data: action.value,
        hasMore: false,
        error: true
      }
  }
  return initialState
}

const useReportById = () => {
  const [annotationsState, dispatch] = useReducer(reducer, initialState)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig), [backendAPIConfig])
  const { displayErrorSnackbar, displaySuccessSnackbar } = useSnackbars()
  const { t } = useTranslation(['maps'])

  const fetchAnnotations = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      dispatch({ type: 'FETCH' })
      repApiFactory
        .reportsGetReportById(id, false)
        .then((result) => {
          let newData: GetEntityByIdOutputOfReportDto = transformData(result.data)
          sideEffect(newData)
          dispatch({ type: 'RESULT', value: newData })
        })
        .catch(() => {
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory]
  )

  const validateReport = useCallback(
    (id, isValid, validationNote) => {
      repApiFactory
        .reportsValidateReport({ reportId: id, isValid: isValid, rejectionNote: validationNote })
        .then((result) => {
          console.debug(result)
          if (result.data.response?.success) {
            displaySuccessSnackbar(t('maps:validateReportSuccess'))
          } else {
            displayErrorSnackbar(t('maps:validateReportError'))
          }
        })
        .catch((error) => {
          console.error(error)
          displayErrorSnackbar(t('maps:validateReportError'))
        })
    },
    [repApiFactory]
  )

  const updateReportStatus = useCallback(
    (id, status) => {
      repApiFactory
        .reportsUpdateReportStatus({ reportId: id, status: status })
        .then((result) => {
          console.debug(result)
          if (result.data) {
            displaySuccessSnackbar(t('maps:changeReportStatusSuccess'))
          } else {
            displayErrorSnackbar(t('maps:changeReportStatusError'))
          }
        })
        .catch((error) => {
          console.error(error)
          displayErrorSnackbar(t('maps:changeReportStatusError'))
        })
    },
    [repApiFactory]
  )

  return [annotationsState, fetchAnnotations, validateReport, updateReportStatus]
}

export default useReportById
