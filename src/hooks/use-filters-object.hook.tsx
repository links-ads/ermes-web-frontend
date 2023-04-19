import { FiltersType } from '../common/filters/reducer'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { initObjectState } from '../pages/protected/map/map-filters-init.state'
import { getFilterObjFromFilters, _MS_PER_DAY } from '../utils/utils.common'
import { ROLE_CITIZEN } from '../App.const'

export interface MapDrawerTabVisibility {
  Person: boolean
  Report: boolean
  Mission: boolean
  Communication: boolean
  MapRequest: boolean
}

const filtersInitialState = {
  filtersLocalStorageObject: {},
  filters: {},
  mapDrawerTabVisibility: {
    Person: true,
    Report: true,
    Mission: true,
    Communication: true,
    MapRequest: true
  }
}

const localStorageKey = 'memstate-map'

const updateFiltersLocalStorage = (filtersObj) => {
  localStorage.setItem(localStorageKey, JSON.stringify(JSON.parse(JSON.stringify(filtersObj))))
}

const getDefaultFiltersFromLocalStorageObject = (filtersObj) => {
  const defaultStartDate = filtersObj
    ? filtersObj.filters
      ? filtersObj.filters.datestart
        ? (filtersObj.filters.datestart as any).selected
        : undefined
      : undefined
    : undefined
  const defaultEndDate = filtersObj
    ? filtersObj.filters
      ? filtersObj.filters.dateend
        ? (filtersObj.filters.dateend as any).selected
        : undefined
      : undefined
    : undefined

  const filtersArgs = {
    datestart: defaultStartDate
      ? new Date(Date.parse(defaultStartDate))
      : new Date(new Date().valueOf() - _MS_PER_DAY * 3),
    dateend: defaultEndDate
      ? new Date(Date.parse(defaultEndDate))
      : new Date(new Date().valueOf() + _MS_PER_DAY * 7)
  }
  return filtersArgs
}

export const initializer = (userProfile, appConfig) => {
  let filtersArgs = {}
  let filtersObj = {} as any
  let storedFilters = localStorage.getItem(localStorageKey)
  if (storedFilters === null) {
    filtersObj = initObjectState
    filtersObj.filters.mapBounds.northEast = appConfig?.mapboxgl?.mapBounds?.northEast
    filtersObj.filters.mapBounds.southWest = appConfig?.mapboxgl?.mapBounds?.southWest
    filtersObj.filters.mapBounds.zoom = appConfig?.mapboxgl?.mapViewport?.zoom
    filtersObj.filters.report.content[2] =
      userProfile?.role == ROLE_CITIZEN
        ? {
            name: 'hazard_visibility',
            options: ['Public'],
            type: 'select',
            selected: 'Public'
          }
        : {
            name: 'hazard_visibility',
            options: ['Private', 'Public', 'All'],
            type: 'select',
            selected: 'Private'
          }
  } else {
    filtersObj = JSON.parse(storedFilters)
  }

  filtersArgs = getDefaultFiltersFromLocalStorageObject(filtersObj)
  updateFiltersLocalStorage(filtersObj)

  let tabVisibility = filtersInitialState.mapDrawerTabVisibility
  tabVisibility.Communication = filtersObj.filters.multicheckCategories.options.Communication
  tabVisibility.MapRequest = filtersObj.filters.multicheckCategories.options.MapRequest
  tabVisibility.Mission = filtersObj.filters.multicheckCategories.options.Mission
  tabVisibility.Report = filtersObj.filters.multicheckCategories.options.Report
  tabVisibility.Person = filtersObj.filters.multicheckPersons.options.Active

  return {
    filtersLocalStorageObject: filtersObj as FiltersDescriptorType,
    filters: filtersArgs as FiltersType,
    mapDrawerTabVisibility: filtersInitialState.mapDrawerTabVisibility as MapDrawerTabVisibility
  }
}

export const filtersReducer = (currentState, action) => {
  const {
    filtersLocalStorageObject: currentFiltersObject,
    filters: currentFilters,
    mapDrawerTabVisibility: currentMapDrawerTabVisibility
  } = currentState
  let newFiltersObject = currentFiltersObject
  let newMapDrawerTabVisibility = currentMapDrawerTabVisibility
  switch (action.type) {
    case 'APPLY_DATE':
      const newFilters = action.filters
      const updatedFiltersObject = getFilterObjFromFilters(newFilters, {}, {}, false)
      if (
        newFiltersObject &&
        newFiltersObject.filters &&
        updatedFiltersObject &&
        updatedFiltersObject.filters
      ) {
        ;(newFiltersObject.filters.datestart as any).selected = (
          updatedFiltersObject.filters.datestart as any
        ).selected as string
        ;(newFiltersObject.filters.dateend as any).selected = (
          updatedFiltersObject.filters.dateend as any
        ).selected as string
        updateFiltersLocalStorage(newFiltersObject)
      }
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: action.filters,
        mapDrawerTabVisibility: currentMapDrawerTabVisibility
      }
    case 'APPLY_FILTERS':
      newFiltersObject = action.filtersObject
      updateFiltersLocalStorage(newFiltersObject)
      const updatedFilters = getDefaultFiltersFromLocalStorageObject(newFiltersObject)
      newMapDrawerTabVisibility.Communication = newFiltersObject.filters.multicheckCategories.options.Communication
      newMapDrawerTabVisibility.MapRequest = newFiltersObject.filters.multicheckCategories.options.MapRequest
      newMapDrawerTabVisibility.Mission = newFiltersObject.filters.multicheckCategories.options.Mission
      newMapDrawerTabVisibility.Report = newFiltersObject.filters.multicheckCategories.options.Report
      newMapDrawerTabVisibility.Person = newFiltersObject.filters.multicheckPersons.options.Active
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: updatedFilters,
        mapDrawerTabVisibility: newMapDrawerTabVisibility
      }
    case 'UPDATE_ACTIVITIES':
      const newActivities = action.activities
      newFiltersObject.filters.multicheckActivities = {
        title: 'multicheck_activities',
        type: 'checkboxlist',
        options: newActivities,
        tab: 2
      }
      updateFiltersLocalStorage(newFiltersObject)
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: currentFilters,
        mapDrawerTabVisibility: currentMapDrawerTabVisibility
      }
    case 'UPDATE_TEAM_LIST':
      const teamList = action.teamList
      newFiltersObject.filters.persons.content[1].options = teamList
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: currentFilters,
        mapDrawerTabVisibility: currentMapDrawerTabVisibility
      }
    case 'UPDATE_MAP_BOUNDS':
      const newMapBounds = action.mapBounds
      newFiltersObject.filters.mapBounds = newMapBounds
      updateFiltersLocalStorage(newFiltersObject)
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: currentFilters,
        mapDrawerTabVisibility: currentMapDrawerTabVisibility
      }
    case 'RESET':
      const appConfigMapBounds = action.appConfigMapBounds
      const isCitizen = action.isCitizen
      newFiltersObject = initObjectState
      newFiltersObject.filters.mapBounds = appConfigMapBounds
      if (isCitizen) {
        const citizenHazardContent = {
          name: 'hazard_visibility',
          options: ['Public'],
          type: 'select',
          selected: 'Public'
        }
        newFiltersObject.filters.report.content[2] = citizenHazardContent
      }
      const resetFilters = getDefaultFiltersFromLocalStorageObject(newFiltersObject)
      updateFiltersLocalStorage(newFiltersObject)
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: resetFilters,
        mapDrawerTabVisibility: currentMapDrawerTabVisibility
      }
    case 'UPDATE_MAP_DRAWER_TAB_VISIBILITY':
      newMapDrawerTabVisibility[action.name] = action.visibility
      if (action.name === 'Person'){
        for (let key in newFiltersObject.filters.multicheckPersons.options){
          newFiltersObject.filters.multicheckPersons.options[key] = action.visibility
        }

        for (let key in newFiltersObject.filters.multicheckActivities.options){
          newFiltersObject.filters.multicheckActivities.options[key] = action.visibility
        }
      }
      else {
        newFiltersObject.filters.multicheckCategories.options[action.name] = action.visibility
      }
      
      updateFiltersLocalStorage(newFiltersObject) 
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: currentFilters,
        mapDrawerTabVisibility: newMapDrawerTabVisibility
      }
    default:
      return currentState
  }
}
