import { useCallback, useReducer, useMemo, useState, useEffect, useRef, useContext } from 'react'
import {
  ReportsApiFactory,
  DTResultOfReportDto
} from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { ErmesAxiosContext } from '../state/ermesaxios.context'
import { FiltersContext } from '../state/filters.context'

const MAX_RESULT_COUNT = 9
const initialState = { error: false, isLoading: true, data: [], tot: 0, selectedItems: [] }

const mergeAndRemoveDuplicates = (a, b) => {
  const c = a.concat(b.filter((item) => a.map((e) => e.id).indexOf(item.id) < 0))
  return c
}

const appendWithoutDuplicates = (a, b) => {
  const appendList = a.filter((item) => b.map((e) => e.id).indexOf(item.id) < 0)
  const c = appendList.concat(b)
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
    case 'APPEND_SELECTED':
      return {
        ...currentState,
        data: appendWithoutDuplicates([...action.value], [...currentState.data]),
        selectedItems: [...action.value]
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
  const backendUrl = backendAPIConfig.basePath!
  const {axiosInstance} = useContext(ErmesAxiosContext)      
  const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig, backendUrl, axiosInstance), [backendAPIConfig])
  const [storedFilters, ,] = useMemoryState('memstate-map', null, false)

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
          if (err?.response?.status !== 401) displayErrorSnackbar(err)
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

  const appendSelectedItems = useCallback((selectedItems) => {
    dispatch({ type: 'APPEND_SELECTED', value: selectedItems })
  }, [])

  return [
    dataState,
    fetchReports,
    applyFilterReloadData,
    applySearchFilterReloadData,
    appendSelectedItems
  ]
}
