import { useCallback, useContext, useReducer } from 'react'
import { AppConfig, AppConfigContext } from '../config'
import { getGeocodingUrl } from '../utils/map.utils'
import { useTranslation } from 'react-i18next'
import { useSnackbars } from './use-snackbars.hook'

const initialState = { results: [], isLoading: false, error: false }

const reducer = (state, action) => {
  switch (action.type) {
    case 'SEARCH':
      return {
        ...state,
        results: action.value,
        isLoading: false
      }
    case 'LOADING':
      return {
        ...state,
        isLoading: true
      }
    case 'CLEAR':
      return {
        ...state,
        results: [],
        isLoading: false
      }
    case 'ERROR':
      return {
        ...state,
        isLoading: false,
        error: true
      }
    default:
      return initialState
  }
}

const useMapGeocoderSearch = () => {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { i18n } = useTranslation()
  const { displayErrorSnackbar, displaySuccessSnackbar } = useSnackbars()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const mapConfig = appConfig.mapboxgl
  const geocodingConfig = mapConfig?.geocoding!!

  const getSearchResults = useCallback((searchText: string, mapBounds: number[]) => {
    dispatch({ type: 'LOADING' })
    fetch(getGeocodingUrl(geocodingConfig, i18n.language, mapBounds, searchText))
      .then((response) => response.json())
      .then((result) => {
        if (result && result.features) {
          const locationSearchResults = result.features.map((item) => {
            return { id: item.id, name: item.place_name, coordinates: item.center }
          })
          dispatch({ type: 'SEARCH', value: locationSearchResults })
        } else {
          console.error(result.message)
          displayErrorSnackbar(result.message)
          dispatch({ type: 'ERROR' })
        }
      })
      .catch((error) => {
        console.error(error)
        dispatch({ type: 'ERROR' })
      })
  }, [])

  const clearSearchResults = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  return [dataState, getSearchResults, clearSearchResults]
}

export default useMapGeocoderSearch
