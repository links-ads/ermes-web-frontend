import React, { createContext, useCallback, useReducer, useContext } from 'react'
import {
  MapDrawerTabVisibility,
  changeFeatureStatus,
  filtersReducer,
  getDefaultFiltersFromLocalStorageObject,
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
  CheckboxList,
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

  const applyDateFilters = useCallback(
    (filters) => {
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
    },
    [filtersLocalStorageObject]
  )

  const updateTeamList = useCallback(
    (teamList) => {
      const updatedFiltersObj = { ...filtersLocalStorageObject }
      updatedFiltersObj.filters.persons.content[1].options = teamList
      updateFiltersLocalStorage(updatedFiltersObj) // TODO ?? it seems to be updated by itself
      dispatch({
        type: 'UPDATE_FILTERS_OBJECT',
        filtersObj: updatedFiltersObj
      })
    },
    [filtersLocalStorageObject]
  )

  const updateActivities = useCallback(
    (activities) => {
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
    },
    [filtersLocalStorageObject]
  )

  const updateMapBounds = useCallback(
    (mapBounds) => {
      const updatedFiltersObj = { ...filtersLocalStorageObject }
      updatedFiltersObj.filters.mapBounds = mapBounds
      updateFiltersLocalStorage(updatedFiltersObj)
      dispatch({
        type: 'UPDATE_FILTERS_OBJECT',
        filtersObj: updatedFiltersObj
      })
    },
    [filtersLocalStorageObject]
  )

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
    let updatedFiltersObj = { ...filtersLocalStorageObject }
    updatedFiltersObj.filters!.mapBounds = appConfigMapBounds
    ;(updatedFiltersObj.filters!.report! as Accordion).content[0].selected = []
    ;(updatedFiltersObj.filters!.report! as Accordion).content[1].selected = []
    ;(updatedFiltersObj.filters!.report! as Accordion).content[2].selected = (
      initObjectState.filters!.report! as Accordion
    ).content[2].selected
    ;(updatedFiltersObj.filters!.report! as Accordion).content[3].selected = []
    ;(updatedFiltersObj.filters!.mission! as Accordion).content[0].selected = []
    ;(updatedFiltersObj.filters!.persons! as Accordion).content[0].selected = []
    ;(updatedFiltersObj.filters!.persons! as Accordion).content[1].selected = []
    ;(updatedFiltersObj.filters!.mapRequests! as Accordion).content[0].selected = (
      initObjectState.filters!.mapRequests! as Accordion
    ).content[0].selected
    ;(updatedFiltersObj.filters!.mapRequests! as Accordion).content[1].selected = (
      initObjectState.filters!.mapRequests! as Accordion
    ).content[1].selected
    ;(updatedFiltersObj.filters!.communication! as Accordion).content[0].selected = []
    ;(updatedFiltersObj.filters!.communication! as Accordion).content[1].selected = []
    ;(updatedFiltersObj.filters!.alert! as Accordion).content[0].selected = []
    ;(updatedFiltersObj.filters!.multicheckCategories! as CheckboxList).options = (
      initObjectState.filters!.multicheckCategories! as CheckboxList
    ).options
    ;(updatedFiltersObj.filters!.multicheckPersons! as CheckboxList).options = (
      initObjectState.filters!.multicheckPersons! as CheckboxList
    ).options

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

    let newMapDrawerTabVisibility = mapDrawerTabVisibility
    newMapDrawerTabVisibility[EntityType.PERSON] = true
    newMapDrawerTabVisibility[EntityType.COMMUNICATION] = true
    newMapDrawerTabVisibility[EntityType.MAP_REQUEST] = true
    newMapDrawerTabVisibility[EntityType.MISSION] = true
    newMapDrawerTabVisibility[EntityType.REPORT] = true
    newMapDrawerTabVisibility[EntityType.ALERT] = true
    newMapDrawerTabVisibility[EntityType.STATION] = true

    dispatch({
      type: 'RESET',
      filtersObj: updatedFiltersObj,
      filters: resetFilters,
      mapDrawerTabVisibility: newMapDrawerTabVisibility
    })
  }, [filtersLocalStorageObject, appConfig, profile, initObjectState, mapDrawerTabVisibility])

  const updateMapDrawerTabs = useCallback(
    (tabName, tabVisibility, clickCounter) => {
      let newFiltersObject = filtersLocalStorageObject
      let newMapDrawerTabVisibility = mapDrawerTabVisibility
      newMapDrawerTabVisibility[tabName] = tabVisibility
      if (tabName === EntityType.PERSON) {
        for (let key in newFiltersObject.filters.multicheckPersons.options) {
          newFiltersObject.filters.multicheckPersons.options[key] = tabVisibility
        }
        // TODO: check if this is necessary. It seems to not be used anymore
        for (let key in newFiltersObject.filters.multicheckActivities.options) {
          newFiltersObject.filters.multicheckActivities.options[key] = tabVisibility
        }
      } else {
        newFiltersObject.filters.multicheckCategories.options[tabName] = tabVisibility
      }

      // deactivate the others if one feature is selected and if it is the first click
      if (clickCounter === 1 && tabVisibility) {
        if (tabName !== EntityType.COMMUNICATION) {
          changeFeatureStatus(
            newFiltersObject,
            newMapDrawerTabVisibility,
            EntityType.COMMUNICATION,
            !tabVisibility
          )
        }
        if (tabName !== EntityType.MAP_REQUEST) {
          changeFeatureStatus(
            newFiltersObject,
            newMapDrawerTabVisibility,
            EntityType.MAP_REQUEST,
            !tabVisibility
          )
        }
        if (tabName !== EntityType.MISSION) {
          changeFeatureStatus(
            newFiltersObject,
            newMapDrawerTabVisibility,
            EntityType.MISSION,
            !tabVisibility
          )
        }
        if (tabName !== EntityType.REPORT) {
          changeFeatureStatus(
            newFiltersObject,
            newMapDrawerTabVisibility,
            EntityType.REPORT,
            !tabVisibility
          )
        }
        if (tabName !== EntityType.PERSON) {
          changeFeatureStatus(
            newFiltersObject,
            newMapDrawerTabVisibility,
            EntityType.PERSON,
            !tabVisibility
          )
        }
        if (tabName !== EntityType.ALERT) {
          changeFeatureStatus(
            newFiltersObject,
            newMapDrawerTabVisibility,
            EntityType.ALERT,
            !tabVisibility
          )
        }

        if (tabName !== EntityType.STATION) {
          changeFeatureStatus(
            newFiltersObject,
            newMapDrawerTabVisibility,
            EntityType.STATION,
            !tabVisibility
          )
        }
      }

      updateFiltersLocalStorage(newFiltersObject)
      dispatch({
        type: 'UPDATE_MAP_DRAWER_TAB_VISIBILITY',
        filtersObj: newFiltersObject,
        mapDrawerTabVisibility: newMapDrawerTabVisibility
      })
    },
    [filtersLocalStorageObject, mapDrawerTabVisibility]
  )

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
