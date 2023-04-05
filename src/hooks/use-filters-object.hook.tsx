import { FiltersType } from '../common/filters/reducer'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { initObjectState } from '../pages/protected/map/map-filters-init.state'
import { getFilterObjFromFilters, _MS_PER_DAY } from '../utils/utils.common'
import { ROLE_CITIZEN } from '../App.const'

const filtersInitialState = {
  filtersLocalStorageObject: {},
  filters: {}
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

  return {
    filtersLocalStorageObject: filtersObj as FiltersDescriptorType,
    filters: filtersArgs as FiltersType
  }
}

export const filtersReducer = (currentState, action) => {
  const { filtersLocalStorageObject: currentFiltersObject, filters: currentFilters } = currentState
  let newFiltersObject = currentFiltersObject
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
        filters: action.filters
      }
    case 'APPLY_FILTERS':
      newFiltersObject = action.filtersObject
      updateFiltersLocalStorage(newFiltersObject)
      const updatedFilters = getDefaultFiltersFromLocalStorageObject(newFiltersObject)
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: updatedFilters
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
        filters: currentFilters
      }
    case 'UPDATE_TEAM_LIST':
      const teamList = action.teamList
      newFiltersObject.filters.persons.content[1].options = teamList
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: currentFilters
      }
    case 'UPDATE_MAP_BOUNDS':
      const newMapBounds = action.mapBounds
      newFiltersObject.filters.mapBounds = newMapBounds
      updateFiltersLocalStorage(newFiltersObject)
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: currentFilters
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
        filters: resetFilters
      }
    default:
      return currentState
  }
}
