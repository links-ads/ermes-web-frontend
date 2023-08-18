import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import { ReportsApiFactory, DTResultOfReportDto, GetEntityByIdOutputOfReportDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'

const MAX_RESULT_COUNT = 9
const initialState = { error: false, isLoading: true, data: [], tot: 0, selectedItems: [] }

const mergeAndRemoveDuplicates = (a, b) => {
  const c = a.concat(b.filter((item) => a.map((e) => e.id).indexOf(item.id) < 0))
  return c
}

const removeDuplicates = (a, b) => {
  if (a.length > 0) {
    const c = a.filter((item) => b.map((e) => e.id).indexOf(item.id) < 0)
    return c
  }
  return a
}

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
    case 'FETCH_BY_ID':
      return {
        ...currentState,
        isLoading: false,
        error: false,
        data: [action.value, ...currentState.data],
        selectedItems: [...currentState.selectedItems, action.value]
      }
    case 'RESULT':
      return {
        ...currentState,
        isLoading: false,
        data: mergeAndRemoveDuplicates(
          [...currentState.selectedItems],
          [...mergeAndRemoveDuplicates([...currentState.data], [...action.value])]
        ),
        error: false,
        tot: action.tot,
        selectedItems: removeDuplicates([...currentState.selectedItems], [...action.value])
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

  // const [filters, setFilters] = useState([])
  const [querySearch, setQuerySearch] = useState<undefined | string>(undefined)
  const { displayErrorSnackbar } = useSnackbars()
  const mounted = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [storedFilters, , ] = useMemoryState(
    'memstate-map',
    null,
    false
  )

  const fetchReportById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      repApiFactory
        .reportsGetReportById(id, true)
        .then((result) => {
          const newData: GetEntityByIdOutputOfReportDto = transformData(result.data)
          sideEffect(newData)
          dispatch({ type: 'FETCH_BY_ID', value: newData })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [repApiFactory]
  )

  const fetchReports = useCallback(
    (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
      repApiFactory
        .reportsGetReports(
          (filters?.report as any).content[0].selected,
          (filters?.report as any).content[1].selected,
          (filters?.report as any).content[3].selected,
          (filters?.datestart as any)?.selected,
          (filters?.dateend as any)?.selected,
          undefined,
          undefined,
          (filters?.mapBounds as any).northEast[1],
          (filters?.mapBounds as any).northEast[0],
          (filters?.mapBounds as any).southWest[1],
          (filters?.mapBounds as any).southWest[0],
          (filters?.report as any).content[2].selected,
          MAX_RESULT_COUNT,
          tot,
          undefined,
          querySearch
        )
        .then((result) => {
          let newData: DTResultOfReportDto[] = transformData(result.data.data) || []

          let totToDown: number = result?.data?.recordsTotal ? result?.data?.recordsTotal : -1
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
    [repApiFactory, displayErrorSnackbar, querySearch]
  )

  const applyFilterReloadData = (newFilters) => {
    dispatch(initialState)
    // setFilters(newFilters)
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
  }, [querySearch])

  return [dataState, fetchReports, applyFilterReloadData, applySearchFilterReloadData, fetchReportById]
}
