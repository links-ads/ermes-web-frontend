import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import { CommunicationsApiFactory, DTResultOfCommunicationDto } from 'ermes-ts-sdk'
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
  }
  return initialState
}
export default function useCommList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { displayErrorSnackbar } = useSnackbars()
  
  const [searchText, setSearchText] = useState<string | undefined>(undefined)
  
  const mounted = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const commApiFactory = useMemo(
    () => CommunicationsApiFactory(backendAPIConfig),
    [backendAPIConfig]
  )
  const [storedFilters, , ] = useMemoryState(
    'memstate-map',
    null,
    false
  )

  const fetchCommunications = useCallback(
    (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters

      commApiFactory
        .communicationsGetCommunications(
          (filters?.datestart as any)?.selected,
          (filters?.dateend as any)?.selected,
          (filters?.mapBounds as any).northEast[1],
          (filters?.mapBounds as any).northEast[0],
          (filters?.mapBounds as any).southWest[1],
          (filters?.mapBounds as any).southWest[0],
          MAX_RESULT_COUNT,
          tot,
          undefined,
          searchText,
          false
        )
        .then((result) => {
          let newData: DTResultOfCommunicationDto[] = transformData(result.data.data) || []
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
    [commApiFactory, displayErrorSnackbar, searchText]
  )
  const applySearchFilterReloadData = (newFilters: string) => {
    dispatch(initialState)
    setSearchText(newFilters)
  }
  useEffect(() => {
    if (mounted.current) {
      fetchCommunications(
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
  }, [searchText])
  return [dataState, fetchCommunications, applySearchFilterReloadData]
}