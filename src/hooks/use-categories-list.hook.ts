import { useCallback, useReducer, useMemo } from 'react'
import { CategoryDto, GetCategoriesOutput } from 'ermes-ts-sdk'
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

  const fetchCategoriesList = useCallback(
    async (transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      const response = await fetch(
        backendAPIConfig.basePath +
          '/api/services/app/Reports/GetCategories?culture=' +
          i18n.language
      );

      if (!response.ok) {
        displayErrorSnackbar('Error while fetching Category List');
        dispatch({ type: 'ERROR', value: 'Error while fetching Category List' });
      }

      const output = (await response.json()) as GetCategoriesOutput;
      let newData: CategoryDto[] =
        transformData(output.categories?.map((elem) => elem.categories).flat()) || []
      dispatch({
        type: 'RESULT',
        value: newData
      });
    },
    [i18n.language, displayErrorSnackbar]
  )

  return [dataState, fetchCategoriesList]
}
