import { useCallback, useReducer, useMemo, useState, useEffect, useRef, useContext } from 'react'
import { StationsApiFactory, StationDto } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { ErmesAxiosContext } from '../state/ermesaxios.context'

const MAX_RESULT_COUNT = 9

const initialState = {
  error: false,
  isLoading: true,
  data: [],
  tot: 0,
  selectedCamera: {},
  selectedItems: []
}

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
        tot: action.tot,
        selectedCamera: {}
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
        selectedCamera: {},
        selectedItems: removeDuplicates([...currentState.selectedItems], [...action.value])
      }
    case 'ERROR':
      return {
        ...currentState,
        isLoading: false,
        data: action.value,
        hasMore: false,
        error: true,
        selectedCamera: {}
      }
    case 'FETCHBYID':
      return {
        ...currentState,
        isLoading: false,
        data: [...currentState.data],
        hasMore: false,
        error: false,
        selectedCamera: action.value
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
  }
  return initialState
}

export default function useCameraList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)

  const { displayErrorSnackbar } = useSnackbars()
  //   const mounted = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const backendUrl = backendAPIConfig.basePath!
  const {axiosInstance} = useContext(ErmesAxiosContext)
  const camerasApiFactory = useMemo(
    () => StationsApiFactory(backendAPIConfig, backendUrl, axiosInstance),
    [backendAPIConfig]
  )
  const [textQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const mounted = useRef(false)
  const [storedFilters, ,] = useMemoryState('memstate-map', null, false)
  const fetchCameras = useCallback(
    (
      tot,
      transformData = (data) => data,
      errorData = {},
      sideEffect = (data) => {},
      initialize = false
    ) => {
      const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters

      dispatch({ type: 'FETCH', tot: tot })

      camerasApiFactory
        .stationsGetStations(
          (filters?.datestart as any)?.selected,
          (filters?.dateend as any)?.selected,
          (filters?.mapBounds as any).northEast[1],
          (filters?.mapBounds as any).northEast[0],
          (filters?.mapBounds as any).southWest[1],
          (filters?.mapBounds as any).southWest[0],
          MAX_RESULT_COUNT,
          tot,
          undefined,
          textQuery
        )
        .then((result) => {
          let newData: StationDto[] = transformData(result.data.data) || []
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
    [StationsApiFactory, displayErrorSnackbar, textQuery, storedFilters]
  )
  const applySearchQueryReloadData = (searchQuery: string) => {
    dispatch(initialState)
    setSearchQuery(searchQuery)
  }
  useEffect(() => {
    if (mounted.current) {
      fetchCameras(
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
  }, [textQuery, fetchCameras])

  const fetchCameraSensors = useCallback(
    (
      stationId,
      sensorId,
      transformData = (data) => data?.measurements,
      errorData = {},
      sideEffect = (data) => {}
    ) => {
      const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters

      return camerasApiFactory
        .stationsGetMeasuresByStationAndSensor(
          stationId,
          sensorId,
          (filters?.datestart as any)?.selected,
          (filters?.dateend as any)?.selected
        )
        .then((result) => {
          let newData: any = transformData(result.data)
          sideEffect(newData)

          return newData
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [camerasApiFactory, storedFilters]
  )
  return [dataState, fetchCameras, applySearchQueryReloadData, fetchCameraSensors]
}
