import React, { createContext, useCallback, useReducer, useContext } from 'react'
import {
  MapDrawerTabVisibility,
  changeFeatureStatus,
  filtersReducer,
  getDefaultFiltersFromLocalStorageObject,
  getDefaultMapDrawerTabVisibility,
  getMapDrawerTabVisibility,
  initializer,
  updateFiltersLocalStorage
} from '../hooks/use-filters-object.hook'
import { useUser } from './auth/auth.hooks'
import { AppConfigContext } from '../config/config.context'
import { AppConfig } from '../config/config.types'
import { ROLE_CITIZEN } from '../App.const'
import {
  Accordion,
  FiltersDescriptorType,
  MapBounds,
  MultipleSelect,
  Select
} from '../common/floating-filters-tab/floating-filter.interface'
import { FiltersType } from '../common/filters/reducer'
import { initObjectState } from '../pages/protected/map/map-filters-init.state'
import { EntityType } from 'ermes-backoffice-ts-sdk'

export const FiltersContext = createContext({
  filters: {} as FiltersType,
  localStorageFilters: {} as FiltersDescriptorType | undefined,
  mapDrawerTabVisibility: {} as MapDrawerTabVisibility,
  lastUpdate: {} as string,
  applyDate: (filters) => {},
  updateActivities: (activities) => {},
  updateMapBounds: (mapBounds) => {},
  applyFilters: (filtersObj) => {},
  updateTeamList: (teamList) => {},
  resetFilters: () => {},
  updateMapDrawerTabs: (tabName, tabVisibility, clickCounter) => {},
  setLastUpdate: (lastUpdate) => {}
})

const FiltersContextProvider = (props) => {
  const { profile } = useUser()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const [filtersState, dispatch] = useReducer(filtersReducer, initializer(profile, appConfig))
  const { filtersLocalStorageObject, filters, mapDrawerTabVisibility, lastUpdate } = filtersState

  const applyDateFilters = useCallback((filters) => {
    const updatedFiltersObj = { ...filtersLocalStorageObject }
    updatedFiltersObj.filters.datestart.selected = filters.datestart.toISOString()
    updatedFiltersObj.filters.dateend.selected = filters.dateend.toISOString()
    updateFiltersLocalStorage(updatedFiltersObj)
    dispatch({
      type: 'APPLY_DATE',
      filters: {
        datestart: filters.datestart,
        dateend: filters.dateend
      },
      filtersObj: updatedFiltersObj
    })
  }, [])

  const updateTeamList = useCallback((teamList) => {
    const updatedFiltersObj = { ...filtersLocalStorageObject }
    updatedFiltersObj.filters.persons.content[1].options = teamList
    updateFiltersLocalStorage(updatedFiltersObj) // TODO ?? it seems to be updated by itself
    dispatch({
      type: 'UPDATE_FILTERS_OBJECT',
      filtersObj: updatedFiltersObj
    })
  }, [])

  const updateActivities = useCallback((activities) => {
    const updatedFiltersObj = { ...filtersLocalStorageObject }
    updatedFiltersObj.filters.multicheckActivities = {
      title: 'multicheck_activities',
      type: 'checkboxlist',
      options: activities,
      tab: 2
    }
    updateFiltersLocalStorage(updatedFiltersObj)
    dispatch({
      type: 'UPDATE_FILTERS_OBJECT',
      filtersObj: updatedFiltersObj
    })
  }, [])

  const updateMapBounds = useCallback((mapBounds) => {
    const updatedFiltersObj = { ...filtersLocalStorageObject }
    updatedFiltersObj.filters.mapBounds = mapBounds
    updateFiltersLocalStorage(updatedFiltersObj)
    dispatch({
      type: 'UPDATE_FILTERS_OBJECT',
      filtersObj: updatedFiltersObj
    })
  }, [])

  const applyFilters = useCallback((filtersObject) => {
    updateFiltersLocalStorage(filtersObject)
    const updatedFilters = getDefaultFiltersFromLocalStorageObject(filtersObject)
    const newMapDrawerTabVisibility = getMapDrawerTabVisibility(filtersObject)
    dispatch({
      type: 'APPLY_FILTERS',
      filtersObj: filtersObject,
      filters: updatedFilters,
      mapDrawerTabVisibility: newMapDrawerTabVisibility
    })
  }, [])

  const resetFilters = useCallback(() => {
    const appConfigMapBounds: MapBounds = {
      northEast: appConfig?.mapboxgl?.mapBounds?.northEast!,
      southWest: appConfig?.mapboxgl?.mapBounds?.southWest!,
      zoom: appConfig?.mapboxgl?.mapViewport?.zoom!
    }
    const isCitizen = profile?.role === ROLE_CITIZEN
    const updatedFiltersObj = { ...initObjectState }
    updatedFiltersObj.filters!.mapBounds = appConfigMapBounds
    if (isCitizen) {
      const citizenHazardContent: Select | MultipleSelect = {
        name: 'hazard_visibility',
        options: ['Public'],
        type: 'select',
        selected: 'Public'
      }
      ;(updatedFiltersObj.filters!.report! as Accordion).content[2] = citizenHazardContent
    }
    const resetFilters = getDefaultFiltersFromLocalStorageObject(updatedFiltersObj, true)
    updateFiltersLocalStorage(updatedFiltersObj)
    const newMapDrawerTabVisibility = getDefaultMapDrawerTabVisibility()
    dispatch({
      type: 'RESET',
      filtersObj: updatedFiltersObj,
      filters: resetFilters,
      // mapDrawerTabVisibility: newMapDrawerTabVisibility
    })
  }, [initObjectState])

  const updateMapDrawerTabs = useCallback((tabName, tabVisibility, clickCounter) => {
    let updatedFiltersObj = { ...filtersLocalStorageObject }
    let newMapDrawerTabVisibility = { ...mapDrawerTabVisibility }
    newMapDrawerTabVisibility[tabName] = tabVisibility
    if (tabName === EntityType.PERSON) {
      for (let key in updatedFiltersObj.filters.multicheckPersons.options) {
        updatedFiltersObj.filters.multicheckPersons.options[key] = tabVisibility
      }

      for (let key in updatedFiltersObj.filters.multicheckActivities.options) {
        updatedFiltersObj.filters.multicheckActivities.options[key] = tabVisibility
      }
    } else {
      updatedFiltersObj.filters.multicheckCategories.options[tabName] = tabVisibility
    }

    // deactivate the others if one feature is selected and if it is the first click
    if (clickCounter === 1 && tabVisibility) {
      if (tabName !== EntityType.COMMUNICATION) {
        changeFeatureStatus(
          updatedFiltersObj,
          newMapDrawerTabVisibility,
          EntityType.COMMUNICATION,
          !tabVisibility
        )
      }
      if (tabName !== EntityType.MAP_REQUEST) {
        changeFeatureStatus(
          updatedFiltersObj,
          newMapDrawerTabVisibility,
          EntityType.MAP_REQUEST,
          !tabVisibility
        )
      }
      if (tabName !== EntityType.MISSION) {
        changeFeatureStatus(
          updatedFiltersObj,
          newMapDrawerTabVisibility,
          EntityType.MISSION,
          !tabVisibility
        )
      }
      if (tabName !== EntityType.REPORT) {
        changeFeatureStatus(
          updatedFiltersObj,
          newMapDrawerTabVisibility,
          EntityType.REPORT,
          !tabVisibility
        )
      }
      if (tabName !== EntityType.PERSON) {
        changeFeatureStatus(
          updatedFiltersObj,
          newMapDrawerTabVisibility,
          EntityType.PERSON,
          !tabVisibility
        )
      }
      if (tabName !== EntityType.ALERT) {
        changeFeatureStatus(
          updatedFiltersObj,
          newMapDrawerTabVisibility,
          EntityType.ALERT,
          !tabVisibility
        )
      }

      if (tabName !== EntityType.STATION) {
        changeFeatureStatus(
          updatedFiltersObj,
          newMapDrawerTabVisibility,
          EntityType.STATION,
          !tabVisibility
        )
      }
    }

    updateFiltersLocalStorage(updatedFiltersObj)
    dispatch({
      type: 'UPDATE_MAP_DRAWER_TAB_VISIBILITY',
      filtersObj: updatedFiltersObj,
      mapDrawerTabVisibility: newMapDrawerTabVisibility
    })
  }, [])

  const setLastUpdate = useCallback((lastUpdate) => {
    dispatch({
      type: 'SET_LAST_UPDATE',
      lastUpdate: lastUpdate
    })
  }, [])

  return (
    <FiltersContext.Provider
      value={{
        filters: filters,
        localStorageFilters: filtersLocalStorageObject,
        mapDrawerTabVisibility: mapDrawerTabVisibility,
        lastUpdate: lastUpdate,
        applyDate: applyDateFilters,
        updateActivities: updateActivities,
        updateMapBounds: updateMapBounds,
        applyFilters: applyFilters,
        updateTeamList: updateTeamList,
        resetFilters: resetFilters,
        updateMapDrawerTabs: updateMapDrawerTabs,
        setLastUpdate: setLastUpdate
      }}
    >
      {props.children}
    </FiltersContext.Provider>
  )
}

export default FiltersContextProvider
