import { useCallback, useReducer, useMemo } from 'react'
import { GeoJsonApiFactory } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { useTranslation } from 'react-i18next'


const initialState = {
  error: false,
  errorData: {},
  isLoading: true,
  data: {
    type: 'FeatureCollection',
    features: [],
    downloadUrl: ''
  },
  tot: 0
}

const reducer = (currentState, action) => {
    switch (action.type) {
        case 'FETCH':
            return {
                ...currentState,
                isLoading: true,
                data: {
                    type: 'FeatureCollection',
                    features: [],
                    downloadUrl: ''
                },
                error: false
            }
        case 'RESULT':
            return {
                ...currentState,
                isLoading: false,
                data: { ...action.value },
                error: false
            }
        case 'DOWNLOAD': 
            return {
              ...currentState,
              isLoading: false,
              data: { ...currentState.data, downloadUrl: action.value },
              error: false
            }
        case 'ERROR':
            return {
                ...currentState,
                isLoading: false,
                data: {
                  ...currentState.data
                },
                hasMore: false,
                error: true,
                errorData: action.value
            }
    }
    return initialState
}

export default function GetApiGeoJson() {
    const [dataState, dispatch] = useReducer(reducer, initialState)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const repApiFactory = useMemo(() => GeoJsonApiFactory(backendAPIConfig), [backendAPIConfig])
    const {displayErrorSnackbar, displaySuccessSnackbar} = useSnackbars()
    const [storedFilters, ,] = useMemoryState(
        'memstate-map',
        null,
        false
    )
    const { t, i18n } = useTranslation();    
    
    const fetchGeoJson = useCallback(
      (teamIds, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
        dispatch({ type: 'FETCH' })
        const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
        repApiFactory
          .geoJsonGetFeatureCollection(
            (filters?.datestart as any)?.selected
              ? (filters?.datestart as any)?.selected
              : undefined,
            (filters?.dateend as any)?.selected ? (filters?.dateend as any)?.selected : undefined,
            (filters?.mapBounds as any).northEast[1],
            (filters?.mapBounds as any).northEast[0],
            (filters?.mapBounds as any).southWest[1],
            (filters?.mapBounds as any).southWest[0],
            undefined,
            (filters?.persons as any).content[0].selected,
            (filters?.report as any).content[0].selected,
            (filters?.report as any).content[1].selected,
            (filters?.mission as any).content[0].selected,
            (filters?.mapRequests as any).content[2].selected,
            (filters?.mapRequests as any).content[1].selected,
            (filters?.mapRequests as any).content[0].selected,
            undefined,
            teamIds,
            (filters?.report as any).content[2].selected,
            (filters?.report as any).content[3].selected,
            {
              headers: {
                'Accept-Language': i18n.language
              }
            }
          )
          .then((result) => {
            dispatch({
              type: 'RESULT',
              value: {
                type: 'FeatureCollection',
                features: (result?.data.features || []).map((e, i) => {
                  return e as unknown as GeoJSON.Feature
                }),
                downloadUrl: ''
              }
            })
          })
          .catch((err) => {
            displayErrorSnackbar(err)
            dispatch({ type: 'ERROR', value: errorData })
          })
      },
      [repApiFactory, displayErrorSnackbar, storedFilters]
    )

    const downloadGeoJson = useCallback(
      (
        teamIds,
        entityTypes,
        activityIds,
        transformData = (data) => {},
        errorData = {},
        sideEffect = (data) => {}
      ) => {
        const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
        repApiFactory
          .geoJsonDownloadFeatureCollection(
            (filters?.datestart as any)?.selected
              ? (filters?.datestart as any)?.selected
              : undefined,
            (filters?.dateend as any)?.selected ? (filters?.dateend as any)?.selected : undefined,
            (filters?.mapBounds as any).northEast[1],
            (filters?.mapBounds as any).northEast[0],
            (filters?.mapBounds as any).southWest[1],
            (filters?.mapBounds as any).southWest[0],
            entityTypes,
            (filters?.persons as any).content[0].selected,
            (filters?.report as any).content[0].selected,
            (filters?.report as any).content[1].selected,
            (filters?.mission as any).content[0].selected,
            (filters?.mapRequests as any).content[2].selected,
            (filters?.mapRequests as any).content[1].selected,
            (filters?.mapRequests as any).content[0].selected,
            activityIds,
            teamIds,
            (filters?.report as any).content[2].selected,
            (filters?.report as any).content[3].selected,
            {
              headers: {
                'Accept-Language': i18n.language
              }
            }
          )
          .then((result) => {
            const { fileType, fileToken, fileName } = result.data
            const base_url = backendAPIConfig.basePath
            const downloadUrl = `${base_url}/File/DownloadTempFile?fileType=${fileType}&fileToken=${fileToken}&fileName=${fileName}`
            dispatch({
              type: 'DOWNLOAD',
              value: downloadUrl
            })
            displaySuccessSnackbar(t('maps:download_successful'))
          })
          .catch((err) => {
            displayErrorSnackbar(err)
            dispatch({ type: 'ERROR', value: err })
          })
      },
      [repApiFactory, displayErrorSnackbar, displaySuccessSnackbar, storedFilters]
    )

    return [dataState, fetchGeoJson, downloadGeoJson] //, filterByDate
}