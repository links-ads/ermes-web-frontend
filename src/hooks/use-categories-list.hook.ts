import { useCallback, useReducer, useMemo } from 'react'
import { CategoryDto, ReportsApiFactory } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useTranslation } from 'react-i18next'

const initialState = { error: false, isLoading: true, data: [] }

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
        data: [...currentState.data, ...action.value],
        error: false
      }
    case 'ERROR':
      return {
        ...currentState,
        isLoading: false,
        data: action.value,
        hasMore: false
      }
  }
  return initialState
}

export default function useCategoriesList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { displayErrorSnackbar } = useSnackbars()
  const { i18n } = useTranslation()
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig), [backendAPIConfig]);

  const fetchCategoriesList = useCallback(
    (transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      repApiFactory
        .reportsGetCategories({
          headers: {
            'Accept-Language': i18n.language
          }
        })
        .then((result) => {
          let newData: CategoryDto[] =
            transformData(result.data.categories?.map((elem) => elem.categories).flat()) || []
          dispatch({
            type: 'RESULT',
            value: newData
          })
        })
        .catch((err) => {
          displayErrorSnackbar(err)
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory, displayErrorSnackbar]
  )

  return [dataState, fetchCategoriesList];
}
