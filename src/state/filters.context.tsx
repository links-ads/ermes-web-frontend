import React, { createContext, useCallback, useEffect, useReducer, useContext } from 'react'
import { filtersReducer, initializer } from '../hooks/use-app-bar-filters.hook'
import { useUser } from './auth/auth.hooks'
import { AppConfigContext } from '../config/config.context'
import { AppConfig } from '../config/config.types'
import { ROLE_CITIZEN } from '../App.const'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'

export const FiltersContext = createContext({
  filters: {},
  localStorageFilters: {} as FiltersDescriptorType | undefined,
  applyDate: (filters) => {},
  updateActivities: (activities) => {},
  updateMapBounds: (mapBounds) => {},
  applyFilters: (filtersObj) => {},
  updateTeamList: (teamList) => {},
  resetFilters: (appConfigMapBounds, isCitizen) => {}
})

const FiltersContextProvider = (props) => {
  const { profile } = useUser()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const [filtersObj, dispatch] = useReducer(filtersReducer, initializer(profile, appConfig))
  const { filtersLocalStorageObject, filters } = filtersObj

  const applyDateFilters = useCallback((filters) => {
    dispatch({
      type: 'APPLY_DATE',
      filters: { datestart: filters.datestart, dateend: filters.dateend }
    })
  }, [])

  const updateTeamList = useCallback((teamList) => {
    dispatch({
      type: 'UPDATE_TEAM_LIST',
      teamList: teamList
    })
  }, [])

  const updateActivities = useCallback((activities) => {
    dispatch({
      type: 'UPDATE_ACTIVITIES',
      activities: activities
    })
  }, [])

  const updateMapBounds = useCallback((mapBounds) => {
    dispatch({
      type: 'UPDATE_MAP_BOUNDS',
      mapBounds: mapBounds
    })
  }, [])

  const applyFilters = useCallback((filtersObj) => {
    dispatch({
      type: 'APPLY_FILTERS',
      filtersObject: filtersObj
    })
  }, [])

  const resetFilters = useCallback(() => {
    dispatch({
      type: 'RESET',
      appConfigMapBounds: {
        northEast: appConfig?.mapboxgl?.mapBounds?.northEast,
        southWest: appConfig?.mapboxgl?.mapBounds?.southWest,
        zoom: appConfig?.mapboxgl?.mapViewport?.zoom
      },
      isCitizen: profile?.role == ROLE_CITIZEN
    })
  }, [])

  return (
    <FiltersContext.Provider
      value={{
        filters: filters,
        localStorageFilters: filtersLocalStorageObject,
        applyDate: applyDateFilters,
        updateActivities: updateActivities,
        updateMapBounds: updateMapBounds,
        applyFilters: applyFilters,
        updateTeamList: updateTeamList,
        resetFilters: resetFilters
      }}
    >
      {props.children}
    </FiltersContext.Provider>
  )
}

export default FiltersContextProvider
