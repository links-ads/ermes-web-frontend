import { useReducer, useMemo } from 'react'
import { MapRequestsApiFactory } from 'ermes-ts-sdk'
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

const useDeleteMapRequest = () => {
  const [deletionState, dispatch] = useReducer(reducer, initialState)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => MapRequestsApiFactory(backendAPIConfig), [backendAPIConfig])

  const deleteMapRequest = (listToDelete: string []) => {
      repApiFactory
      .mapRequestsDeleteMapRequest(listToDelete)
        
        .then((result) => {
           console.log(result)
           dispatch({ type: 'RESULT', value: result.data })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.message })
        })

    }

  return [deletionState, deleteMapRequest]
}

export default useDeleteMapRequest