import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import {
  MapRequestsApiFactory,
  MapRequestDto,
  MapRequestStatusType,
  GetEntityByIdOutputOfMapRequestDto
} from 'ermes-ts-sdk' // MapRequestDto
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { useTranslation } from 'react-i18next'

const MAX_RESULT_COUNT = 9
const initialState = {
  error: false,
  isLoading: true,
  data: [],
  tot: 0,
  selectedMr: {},
  selectedItems: []
}

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
        selectedMr: {}
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
        selectedMr: {},
        selectedItems: removeDuplicates([...currentState.selectedItems], [...action.value])
      }
    case 'ERROR':
      return {
        ...currentState,
        isLoading: false,
        // data: action.value,
        hasMore: false,
        error: true,
        selectedMr: {}
      }
    case 'DELETE':
      const toBeDeletedCode = action.value[0]
      const mrToUpdateIndex = currentState.data.map((item) => item.code).indexOf(toBeDeletedCode)
      if (mrToUpdateIndex < 0) {
        return {
          ...currentState,
          isLoading: true,
          data: [],
          error: false,
          tot: action.tot,
          selectedMr: {}
        }
      }
      currentState.data[mrToUpdateIndex].status = MapRequestStatusType.CANCELED

      return {
        ...currentState,
        isLoading: false,
        data: [...currentState.data],
        hasMore: false,
        error: false,
        selectedMr: {}
      }
    case 'FETCHBYID':
      return {
        ...currentState,
        isLoading: false,
        data: [...currentState.data],
        hasMore: false,
        error: false,
        selectedMr: action.value
      }
    case 'INITIALIZE':
      return {
        ...currentState,
        isLoading: false,
        data: [...action.value],
        hasMore: false,
        error: false,
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

export default function useMapRequestList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { i18n, t } = useTranslation(['maps'])
  const { displayErrorSnackbar, displaySuccessSnackbar } = useSnackbars()
  //   const mounted = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const maprequestApiFactory = useMemo(
    () => MapRequestsApiFactory(backendAPIConfig),
    [backendAPIConfig]
  )
  const [textQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const mounted = useRef(false)
  const housePartner = 'links.'
  const [storedFilters, ,] = useMemoryState('memstate-map', null, false)
  const fetchMapRequests = useCallback(
    (
      tot,
      transformData = (data) => {},
      errorData = {},
      sideEffect = (data) => {},
      initialize = false
    ) => {
      const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
      maprequestApiFactory
        .mapRequestsGetMapRequests(
          (filters?.datestart as any)?.selected,
          (filters?.dateend as any)?.selected,
          (filters?.mapRequests as any).content[1].selected,
          (filters?.mapRequests as any).content[0].selected,
          (filters?.mapBounds as any).northEast[1],
          (filters?.mapBounds as any).northEast[0],
          (filters?.mapBounds as any).southWest[1],
          (filters?.mapBounds as any).southWest[0],
          MAX_RESULT_COUNT,
          tot,
          undefined,
          textQuery,
          undefined,
          undefined,
          {
            headers: {
              'Accept-Language': i18n.language
            }
          }
        )
        .then((result) => {
          let newData: MapRequestDto[] = transformData(result.data.data) || [] // Where is MapRequestsDto
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
    [maprequestApiFactory, displayErrorSnackbar, textQuery, storedFilters]
  )
  const applySearchQueryReloadData = (searchQuery: string) => {
    dispatch(initialState)
    setSearchQuery(searchQuery)
  }
  useEffect(() => {
    if (mounted.current) {
      fetchMapRequests(
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
  }, [textQuery, fetchMapRequests])

  const deleteMapRequest = (listToDelete: string[]) => {
    maprequestApiFactory
      .mapRequestsDeleteMapRequest(listToDelete.map((item) => housePartner + item))
      .then((result) => {
        const deletedCodes: string[] = result.data.deletedMapRequestCodes!.map((item) =>
          item.split(housePartner).length >= 1 ? item.split(housePartner)[1] : item
        )
        dispatch({ type: 'DELETE', value: deletedCodes })
        displaySuccessSnackbar(t('maps:mapRequestDeleteSuccess'))
      })
      .catch((error) => {
        console.error(error)
        displayErrorSnackbar(t('maps:mapRequestDeleteError'))
        // do not empty list for this kind of error
        // dispatch({ type: 'ERROR', value: error.message })
      })
  }

  const fetchMapRequestById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      maprequestApiFactory
        .mapRequestsGetMapRequestById(id, true)
        .then((result) => {
          let newData: GetEntityByIdOutputOfMapRequestDto = transformData(result.data)
          sideEffect(newData)
          dispatch({ type: 'FETCHBYID', value: newData })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.message })
        })
    },
    [maprequestApiFactory]
  )

  const appendSelectedItems = useCallback((selectedItems) => {
    dispatch({ type: 'APPEND_SELECTED', value: selectedItems })
  }, [])

  return [
    dataState,
    fetchMapRequests,
    applySearchQueryReloadData,
    deleteMapRequest,
    fetchMapRequestById,
    appendSelectedItems
  ]
}
