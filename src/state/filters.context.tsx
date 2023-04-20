import React, { createContext, useCallback, useReducer, useContext } from 'react'
import { MapDrawerTabVisibility, filtersReducer, initializer } from '../hooks/use-filters-object.hook'
import { useUser } from './auth/auth.hooks'
import { AppConfigContext } from '../config/config.context'
import { AppConfig } from '../config/config.types'
import { ROLE_CITIZEN } from '../App.const'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { FiltersType } from '../common/filters/reducer'

export const FiltersContext = createContext({
  filters: {} as FiltersType,
  localStorageFilters: {} as FiltersDescriptorType | undefined,
  mapDrawerTabVisibility: {} as MapDrawerTabVisibility,
  applyDate: (filters) => {},
  updateActivities: (activities) => {},
  updateMapBounds: (mapBounds) => {},
  applyFilters: (filtersObj) => {},
  updateTeamList: (teamList) => {},
  resetFilters: (appConfigMapBounds, isCitizen) => {},
  updateMapDrawerTabs: (tabName, tabVisibility) => {}
})

const FiltersContextProvider = (props) => {
  const { profile } = useUser()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const [filtersObj, dispatch] = useReducer(filtersReducer, initializer(profile, appConfig))
  const { filtersLocalStorageObject, filters, mapDrawerTabVisibility } = filtersObj

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

  const updateMapDrawerTabs = useCallback((tabName, tabVisibility) => {
    dispatch({
      type: 'UPDATE_MAP_DRAWER_TAB_VISIBILITY', 
      name: tabName,
      visibility: tabVisibility
    })
  },[])

  return (
    <FiltersContext.Provider
      value={{
        filters: filters,
        localStorageFilters: filtersLocalStorageObject,
        mapDrawerTabVisibility: mapDrawerTabVisibility, 
        applyDate: applyDateFilters,
        updateActivities: updateActivities,
        updateMapBounds: updateMapBounds,
        applyFilters: applyFilters,
        updateTeamList: updateTeamList,
        resetFilters: resetFilters,
        updateMapDrawerTabs: updateMapDrawerTabs
      }}
    >
      {props.children}
    </FiltersContext.Provider>
  )
}

export default FiltersContextProvider