import { useCallback, useReducer, useMemo } from 'react'
import { MissionsApiFactory, GetEntityByIdOutputOfMissionDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'

const initialState = { error: false, isLoading: true, data: {} }

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'FETCH':
      return {
        ...currentState,
        isLoading: true,
        data: {},
        error: false
      }
    case 'RESULT':
      return {
        isLoading: false,
        data: action.value,
        error: false
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

const useMissionsById = () => {
  const [missionState, dispatch] = useReducer(reducer, initialState)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => MissionsApiFactory(backendAPIConfig), [backendAPIConfig])

  const fetchMissionById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      repApiFactory
        .missionsGetMissionById(id, true)
        .then((result) => {
          let newData: GetEntityByIdOutputOfMissionDto = transformData(result.data)
          sideEffect(newData)
          dispatch({ type: 'RESULT', value: newData })
        })
        .catch(() => {
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory]
  )

  return [missionState, fetchMissionById]
}

export default useMissionsById
