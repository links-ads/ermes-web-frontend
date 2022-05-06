import { useCallback, useReducer, useMemo } from 'react'
import { GeoJsonApiFactory } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { useTranslation } from 'react-i18next'


const initialState = {
    error: false, isLoading: true, data: {
        type: 'FeatureCollection',
        features: []
    }, tot: 0
}

const reducer = (currentState, action) => {
    switch (action.type) {
        case 'FETCH':
            return {
                ...currentState,
                isLoading: true,
                data: {
                    type: 'FeatureCollection',
                    features: []
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
        case 'ERROR':
            return {
                ...currentState,
                isLoading: false,
                data: {
                    type: 'FeatureCollection',
                    features: []
                },
                hasMore: false,
                error: true
            }
    }
    return initialState
}

export default function GetApiGeoJson() {
    const [dataState, dispatch] = useReducer(reducer, initialState)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const repApiFactory = useMemo(() => GeoJsonApiFactory(backendAPIConfig), [backendAPIConfig])
    const {displayErrorSnackbar} = useSnackbars()
    const [storedFilters, ,] = useMemoryState(
        'memstate-map',
        null,
        false
    )
    const { i18n } = useTranslation()

    const fetchGeoJson = useCallback(
      (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
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
                })
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
    return [dataState, fetchGeoJson] //, filterByDate
}