import { useCallback, useReducer, useState } from 'react'
import { useSnackbars } from './use-snackbars.hook'

type APIHandlerStateType = {
  error: boolean
  loading: boolean
  result: any
}

type APIHandlerActionType = {
  type: 'CALL' | 'RESULT' | 'ERROR' | 'RESET'
  value?: any
}

const initialState = { error: false, loading: false, result: {} }

const reducer = (
  currentState: APIHandlerStateType,
  action: APIHandlerActionType
): APIHandlerStateType => {
  switch (action.type) {
    case 'CALL':
      return {
        ...currentState,
        loading: true,
        error: false
      }
    case 'RESULT':
      return {
        loading: false,
        result: action.value,
        error: false
      }
    case 'ERROR':
      return {
        ...initialState,
        loading: false,
        error: true
      }
    case 'RESET':
      return initialState
    default:
      return initialState
  }
}

const useAPIHandler = (withSnackbars: boolean = true) => {
  const [withSnack] = useState(withSnackbars)
  const [apiHandlerState, dispatch] = useReducer(reducer, initialState)
  const { displayErrorSnackbar, displaySuccessSnackbar } = useSnackbars()

  const handleAPICall = useCallback(
    (callable, successMessage = '', successCallback = () => {}, errorCallback = () => {}) => {
      dispatch({ type: 'CALL' })
      callable()
        .then((result) => {
          dispatch({ type: 'RESULT', value: result })
          if (withSnack) displaySuccessSnackbar(successMessage)
          successCallback(result)
        })
        .catch((error) => {
          dispatch({ type: 'ERROR' })
          if (withSnack) displayErrorSnackbar(error)
          errorCallback()
        })
    },
  [displayErrorSnackbar, displaySuccessSnackbar,withSnack]
  )

  const resetApiHandlerState = useCallback(() => dispatch({ type: 'RESET' }), [])
  return [apiHandlerState, handleAPICall, resetApiHandlerState] as const
}

export default useAPIHandler
