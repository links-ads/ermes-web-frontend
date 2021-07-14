import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import { ReportsApiFactory, DTResultOfReportDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'

const MAX_RESULT_COUNT = 9
const initialState = { error: false, isLoading: true, data: [], tot: 0 }

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'FETCH':
      return {
        ...currentState,
        isLoading: true,
        data: [],
        error: false,
        tot: action.tot
      }
    case 'RESULT':
      return {
        ...currentState,
        isLoading: false,
        data: [...currentState.data, ...action.value],
        error: false,
        tot: action.tot
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

export default function useReportList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)

  const [filters, setFilters] = useState([])
  const [querySearch, setQuerySearch] = useState<undefined | string>(undefined)
  const { displayErrorSnackbar } = useSnackbars()
  const mounted = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig), [backendAPIConfig])

  const fetchReports = useCallback(
    (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      repApiFactory
        .reportsGetReports(
          filters,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          MAX_RESULT_COUNT,
          tot,
          undefined,
          querySearch
        )
        .then((result) => {
          let newData: DTResultOfReportDto[] = transformData(result.data.data) || []

          let totToDown: number = result?.data?.recordsTotal ? result?.data?.recordsTotal : -1
          console.log('REPORT', newData)
          dispatch({
            type: 'RESULT',
            value: newData,
            tot: totToDown
          })
        })
        .catch((err) => {
          displayErrorSnackbar(err)
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory, displayErrorSnackbar, filters]
  )

  const applyFilterReloadData = (newFilters) => {
    dispatch(initialState)
    setFilters(newFilters)
  }
  const applySearchFilterReloadData = (query: string) => {
    dispatch(initialState)
    setQuerySearch(query)
  }
  useEffect(() => {
    if (mounted.current) {
      fetchReports(
        0,
        (data) => {
          return data
        },
        {},
        (data) => {
          return data
        }
      )
    } else {
      mounted.current = true
    }
  }, [filters, querySearch])

  return [dataState, fetchReports, applyFilterReloadData, applySearchFilterReloadData]
}
