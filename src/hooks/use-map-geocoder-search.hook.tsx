import { useCallback, useContext, useReducer } from 'react'
import { AppConfig, AppConfigContext } from '../config'
import { getGeocodingUrl } from '../utils/map.utils'
import { useTranslation } from 'react-i18next'

const initialState = { results: [], isLoading: true, error: false }

const reducer = (state, action) => {
  switch (action.type) {
    case 'SEARCH':
      return {
        ...state, 
        results: action.value,
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
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const mapConfig = appConfig.mapboxgl
  const geocodingConfig = mapConfig?.geocoding!!

  const getSearchResults = useCallback((searchText: string, mapBounds: number[]) => {
    fetch(getGeocodingUrl(geocodingConfig, i18n.language, mapBounds, searchText))
      .then((response) => response.json())
      .then((result) => {
        dispatch({ type: 'SEARCH', value: result.features })
      })
      .catch((error) => {
        console.error(error)
        dispatch({ type: 'ERROR' })
      })
  }, [])

  return [dataState, getSearchResults]
}

export default useMapGeocoderSearch
