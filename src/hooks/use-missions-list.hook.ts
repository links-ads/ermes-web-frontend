import { useCallback, useReducer, useMemo, useState } from 'react'
import { MissionsApiFactory, MissionDto } from 'ermes-ts-sdk'
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

export default function useMissionsList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { displayErrorSnackbar } = useSnackbars()
  //   const mounted = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const missionsApiFactory = useMemo(() => MissionsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [filters, setFilters] = useState([])

  const fetchMissions = useCallback(
    (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
        missionsApiFactory.missionsGetMissions(
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
          undefined,
          undefined,
          undefined
        )
        .then((result) => {
            let newData: MissionDto[] = transformData(result.data.data) || []

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
    [missionsApiFactory, displayErrorSnackbar, filters]
  )
  const applyFilterReloadData = (newFilters) => {
    // dispatch(initialState)
    setFilters(newFilters)
  }
  return [dataState, fetchMissions, applyFilterReloadData]
}
