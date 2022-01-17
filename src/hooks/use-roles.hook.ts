import { useReducer, useMemo, useCallback } from 'react'
import { RolesApiFactory, RoleDto } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'

const initialState = { error: false, isLoading: true, data: [], tot: 0 }

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'FETCH':
      return {
        ...currentState,
        isLoading: true,
        data: [],
        error: false
      }
    case 'RESULT':
      return {
        ...currentState,
        isLoading: false,
        data: [...action.value],
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

export default function useRolesList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { displayErrorSnackbar } = useSnackbars()
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => RolesApiFactory(backendAPIConfig), [backendAPIConfig])

  const fetchRoles = useCallback(
    (transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      repApiFactory
        .rolesGetRoles()
        .then((result) => {
          let newData: RoleDto[] = transformData(result.data.roles) || []
          dispatch({ type: 'RESULT', value: newData })
        })
        .catch((err) => {
          displayErrorSnackbar(err)
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory]
  )
  return [dataState, fetchRoles]
}
