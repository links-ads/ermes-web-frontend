import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import { CommunicationsApiFactory, DTResultOfCommunicationDto, GetEntityByIdOutputOfCommunicationDto } from 'ermes-ts-sdk'
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
    (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}, initialize = false) => {
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
          if(initialize){
            dispatch({
              type: 'INITIALIZE',
              value: newData,
              tot: totToDown
            })
          }
          else
          {
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

  const getCommunicationById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      commApiFactory
        .communicationsGetCommunicationById(id, true)
        .then((result) => {
          const newData: GetEntityByIdOutputOfCommunicationDto = transformData(result.data)
          sideEffect(newData)
          dispatch({ type: 'FETCH_BY_ID', value: newData })
        })
        .catch((error) => {
          displayErrorSnackbar(error)
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [commApiFactory]
  )
  return [dataState, fetchCommunications, applySearchFilterReloadData, getCommunicationById]
}