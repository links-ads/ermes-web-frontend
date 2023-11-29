import { useCallback, useReducer, useMemo } from 'react'
import { ReportsApiFactory, GetEntityByIdOutputOfReportDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'

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

  const fetchAnnotations = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
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
    (id, isValid, rejectionNote) => {
      repApiFactory
        .reportsValidateReport({ reportId: id, isValid: isValid, rejectionNote: rejectionNote })
        .then((result) => {
          console.debug(result)
          
          if (result.data.response?.success) {
            displaySuccessSnackbar("L'annotazione è stata validata con successo")
          }
          else{
            displayErrorSnackbar('Si è verificato un errore durante la validazione dell\'annotazione')
          }
        })
        .catch((error) => {
          console.error(error)
          displayErrorSnackbar('Si è verificato un errore durante la validazione dell\'annotazione')
        })
    },
    [repApiFactory]
  )

  const updateReportStatus = useCallback((id, status) => {
    repApiFactory
      .reportsUpdateReportStatus({ reportId: id, status: status })
      .then((result) => {
        console.debug(result)
        if (result.data) {
          displaySuccessSnackbar("Lo stato dell'annotazione è stata aggiornata con successo")
        }
        else{
          displayErrorSnackbar('Si è verificato un errore durante l\'aggiornamento dello stato dell\'annotazione')
        }
      })
      .catch((error) => {
        console.error(error)
        displayErrorSnackbar('Si è verificato un errore durante l\'aggiornamento dello stato dell\'annotazione')
      })
  }, [repApiFactory])

  return [annotationsState, fetchAnnotations, validateReport, updateReportStatus]
}

export default useReportById
