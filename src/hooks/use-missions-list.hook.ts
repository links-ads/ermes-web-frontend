import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import { MissionsApiFactory, MissionDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'

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
    case 'INITIALIZE':
      return {
        ...currentState,
        isLoading: false,
        data: [...action.value],
        hasMore: false,
        error: true,
        tot: action.tot
      }
  }
  return initialState
}

export default function useMissionsList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { displayErrorSnackbar } = useSnackbars()
  //   const mounted = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const missionsApiFactory = useMemo(() => MissionsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [textQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const mounted = useRef(false)
  const [storedFilters, , ] = useMemoryState(
    'memstate-map',
    null,
    false
  )
  const fetchMissions = useCallback(
    (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}, initialize = false) => {
      const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
      missionsApiFactory
        .missionsGetMissions(
          (filters?.datestart as any)?.selected,
          (filters?.dateend as any)?.selected,
          (filters?.mission as any).content[0].selected,
          (filters?.mapBounds as any).northEast[1],
          (filters?.mapBounds as any).northEast[0],
          (filters?.mapBounds as any).southWest[1],
          (filters?.mapBounds as any).southWest[0],
          MAX_RESULT_COUNT,
          tot,
          undefined,
          textQuery,
          undefined,
          undefined
        )
        .then((result) => {
          let newData: MissionDto[] = transformData(result.data.data) || []
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
    [missionsApiFactory, displayErrorSnackbar, textQuery]
  )
  const applySearchQueryReloadData = (searchQuery: string) => {
    dispatch(initialState)
    setSearchQuery(searchQuery)
  }
  useEffect(() => {
    if (mounted.current) {
      fetchMissions(
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
  }, [textQuery])
  return [dataState, fetchMissions, applySearchQueryReloadData]
}
