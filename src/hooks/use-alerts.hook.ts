import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import {
  AlertsApiFactory,
  AlertDto,
  GetEntityByIdOutputOfAlertDto
} from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'

const MAX_RESULT_COUNT = 9
const initialState = { error: false, isLoading: true, data: [], tot: 0, selectedAlert: {}, selectedItems: [] }

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
        tot: action.tot,
        selectedAlert: {}
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
        selectedAlert: {},
        selectedItems: removeDuplicates([...currentState.selectedItems], [...action.value])
      }
    case 'ERROR':
      return {
        ...currentState,
        isLoading: false,
        data: action.value,
        hasMore: false,
        error: true,
        selectedAlert: {}
      }
    case 'FETCHBYID':
      return {
        ...currentState,
        isLoading: false,
        data: [...currentState.data],
        hasMore: false,
        error: false,
        selectedAlert: action.value
      }
    case 'INITIALIZE':
      return {
        ...currentState,
        isLoading: false,
        data: [...action.value],
        hasMore: false,
        error: true,
        tot: action.tot
      }
    case 'APPEND_SELECTED':
      return {
        ...currentState,
        data: appendWithoutDuplicates([...action.value], [...currentState.data]),
        selectedItems: [...action.value]
      }
  }
  return initialState
}

export default function useAlertList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { displayErrorSnackbar } = useSnackbars()
  //   const mounted = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const alertsApiFactory = useMemo(
    () => AlertsApiFactory(backendAPIConfig),
    [backendAPIConfig]
  )
  const [textQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const mounted = useRef(false)
  const [storedFilters, ,] = useMemoryState('memstate-map', null, false)
  const fetchAlerts = useCallback(
    (
      tot,
      transformData = (data) => {},
      errorData = {},
      sideEffect = (data) => {},
      initialize = false
    ) => {
      const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
      alertsApiFactory
        .alertsGetAlerts(
          (filters?.datestart as any)?.selected,
          (filters?.dateend as any)?.selected,
          (filters?.mapBounds as any).northEast[1],
          (filters?.mapBounds as any).northEast[0],
          (filters?.mapBounds as any).southWest[1],
          (filters?.mapBounds as any).southWest[0],
          (filters?.alert as any).content[0]?.selected,
          MAX_RESULT_COUNT,
          tot,
          undefined,
          textQuery,
          undefined,
          undefined
        )
        .then((result) => {
          let newData: AlertDto[] = transformData(result.data.data) || [] // Where is MapRequestsDto
          let totToDown: number = result?.data?.recordsTotal ? result?.data?.recordsTotal : -1
          if (initialize) {
            dispatch({
              type: 'INITIALIZE',
              value: newData,
              tot: totToDown
            })
          } else {
            dispatch({
              type: 'RESULT',
              value: newData,
              tot: totToDown
            })
          }
        })
        .catch((err) => {
          displayErrorSnackbar(err)
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [AlertsApiFactory, displayErrorSnackbar, textQuery, storedFilters]
  )
  const applySearchQueryReloadData = (searchQuery: string) => {
    dispatch(initialState)
    setSearchQuery(searchQuery)
  }
  useEffect(() => {
    if (mounted.current) {
      fetchAlerts(
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
  }, [textQuery, fetchAlerts])

  const fetchAlertById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      alertsApiFactory
        .alertsGetAlertById(id, true)
        .then((result) => {
          let newData: GetEntityByIdOutputOfAlertDto = transformData(result.data)
          sideEffect(newData)
          dispatch({ type: 'FETCHBYID', value: newData })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [alertsApiFactory]
  )

  const appendSelectedItems = useCallback((selectedItems) => {
    dispatch({ type: 'APPEND_SELECTED', value: selectedItems })
  }, [])

  return [
    dataState,
    fetchAlerts,
    applySearchQueryReloadData,
    fetchAlertById,
    appendSelectedItems
  ]
}
