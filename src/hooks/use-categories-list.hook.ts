import { useCallback, useReducer, useMemo, useContext } from 'react'
import { CategoryDto, ReportsApiFactory } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useTranslation } from 'react-i18next'
import { ErmesAxiosContext } from '../state/ermesaxios.context'

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
  const backendUrl = backendAPIConfig.basePath!
  const {axiosInstance} = useContext(ErmesAxiosContext)  
  const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig, backendUrl, axiosInstance), [backendAPIConfig]);

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
          if (err?.response?.status !== 401) displayErrorSnackbar(err)
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory, displayErrorSnackbar]
  )

  return [dataState, fetchCategoriesList];
}
