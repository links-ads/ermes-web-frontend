import { FiltersType } from '../common/filters/reducer'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { initObjectState } from '../pages/protected/map/map-filters-init.state'
import { getFilterObjFromFilters, _MS_PER_DAY } from '../utils/utils.common'
import { ROLE_CITIZEN } from '../App.const'
import { CommunicationRestrictionType, EntityType } from 'ermes-ts-sdk'

export interface MapDrawerTabVisibility {
  Person: boolean
  Report: boolean
  Mission: boolean
  Station: boolean
  Alert: boolean
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
    Station: true,
    Alert: true,
    Communication: true,
    MapRequest: true
  } as MapDrawerTabVisibility,
  lastUpdate: new Date().toISOString()
}

const citizenAlertRestricition = {
  name: 'restriction',
  options: [CommunicationRestrictionType.CITIZEN],
  type: 'multipleselect',
  selected: [CommunicationRestrictionType.CITIZEN]
}

const citizenReportHazardVisibility = {
  name: 'hazard_visibility',
  options: ['Public'],
  type: 'select',
  selected: 'Public'
}

const citizenCommunicationRestricition = {
  name: 'restriction',
  options: [CommunicationRestrictionType.CITIZEN],
  type: 'conditional_multipleselect',
  selected: [CommunicationRestrictionType.CITIZEN]
}

const notCitizenAlertRestricition = {
  name: 'restriction',
  options: [CommunicationRestrictionType.CITIZEN, CommunicationRestrictionType.PROFESSIONAL],
  type: 'multipleselect',
  selected: []
}

const notCitizenReportHazardVisibility = {
  name: 'hazard_visibility',
  options: ['Private', 'Public', 'All'],
  type: 'select',
  selected: 'Private'
}

const notCitizenCommunicationRestricition = {
  name: 'restriction',
  options: [
    CommunicationRestrictionType.CITIZEN,
    CommunicationRestrictionType.ORGANIZATION,
    CommunicationRestrictionType.PROFESSIONAL
  ],
  type: 'conditional_multipleselect',
  selected: []
}

const localStorageKey = 'memstate-map'

export const updateFiltersLocalStorage = (filtersObj) => {
  localStorage.setItem(localStorageKey, JSON.stringify(JSON.parse(JSON.stringify(filtersObj))))
}

export const getDefaultFiltersFromLocalStorageObject = (filtersObj, isReset: boolean = false) => {
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
    datestart:
      defaultStartDate && !isReset
        ? new Date(Date.parse(defaultStartDate))
        : new Date(new Date().valueOf() - _MS_PER_DAY * 3),
    dateend:
      defaultEndDate && !isReset
        ? new Date(Date.parse(defaultEndDate))
        : new Date(new Date().valueOf() + _MS_PER_DAY * 45)
  }
  return filtersArgs
}

export const changeFeatureStatus = (filtersObj, mapDrawerTabVisibility, featureName, newStatus) => {
  mapDrawerTabVisibility[featureName] = newStatus
  if (featureName === EntityType.PERSON) {
    for (let key in filtersObj.filters.multicheckPersons.options) {
      filtersObj.filters.multicheckPersons.options[key] = newStatus
    }

    for (let key in filtersObj.filters.multicheckActivities.options) {
      filtersObj.filters.multicheckActivities.options[key] = newStatus
    }
  } else {
    filtersObj.filters.multicheckCategories.options[featureName] = newStatus
  }
}

export const getMapDrawerTabVisibility = (filtersObj) => {
  const tabVisibility: MapDrawerTabVisibility = {
    Person: filtersObj.filters.multicheckPersons.options.Active,
    Report: filtersObj.filters.multicheckCategories.options.Report,
    Mission: filtersObj.filters.multicheckCategories.options.Mission,
    Station: filtersObj.filters.multicheckCategories.options.Station,
    Alert: filtersObj.filters.multicheckCategories.options.Alert,
    Communication: filtersObj.filters.multicheckCategories.options.Communication,
    MapRequest: filtersObj.filters.multicheckCategories.options.MapRequest
  }
  return tabVisibility
}

export const initializer = (userProfile, appConfig) => {
  let filtersArgs = {}
  let filtersObj = {} as any
  let storedFilters = localStorage.getItem(localStorageKey)
  if (storedFilters === null || storedFilters === 'null') {
    filtersObj = { ...initObjectState }
    filtersObj.filters.mapBounds.northEast = appConfig?.mapboxgl?.mapBounds?.northEast
    filtersObj.filters.mapBounds.southWest = appConfig?.mapboxgl?.mapBounds?.southWest
    filtersObj.filters.mapBounds.zoom = appConfig?.mapboxgl?.mapViewport?.zoom
    filtersObj.filters.report.content[2] =
      userProfile?.role === ROLE_CITIZEN
        ? { ...citizenReportHazardVisibility }
        : { ...notCitizenReportHazardVisibility }
    filtersObj.filters.communication.content[1] =
      userProfile?.role === ROLE_CITIZEN
        ? { ...citizenCommunicationRestricition }
        : { ...notCitizenCommunicationRestricition }
    filtersObj.filters.alert.content[0] =
      userProfile?.role === ROLE_CITIZEN
        ? { ...citizenAlertRestricition }
        : { ...notCitizenAlertRestricition }
  } else {
    filtersObj = JSON.parse(storedFilters)

    if (userProfile?.role === ROLE_CITIZEN) {
      filtersObj.filters.report.content[2] = { ...citizenReportHazardVisibility }
      filtersObj.filters.communication.content[1] = { ...citizenCommunicationRestricition }
      filtersObj.filters.alert.content[0] = { ...citizenAlertRestricition }
    } else {
      filtersObj.filters.report.content[2] = { ...notCitizenReportHazardVisibility }
      filtersObj.filters.communication.content[1] = { ...notCitizenCommunicationRestricition }
      filtersObj.filters.alert.content[0] = { ...notCitizenAlertRestricition }
    }
  }

  filtersArgs = getDefaultFiltersFromLocalStorageObject(filtersObj)
  updateFiltersLocalStorage(filtersObj)

  return {
    filtersLocalStorageObject: filtersObj as FiltersDescriptorType,
    filters: filtersArgs as FiltersType,
    mapDrawerTabVisibility: filtersInitialState.mapDrawerTabVisibility as MapDrawerTabVisibility,
    lastUpdate: filtersInitialState.lastUpdate as string
  }
}

export const filtersReducer = (currentState, action) => {
  switch (action.type) {
    case 'APPLY_DATE':
      return {
        filtersLocalStorageObject: action.filtersObj,
        filters: action.filters,
        ...currentState
      }
    case 'APPLY_FILTERS':
      return {
        filtersLocalStorageObject: action.filtersObj,
        filters: action.filters,
        mapDrawerTabVisibility: action.mapDrawerTabVisibility,
        ...currentState
      }
    case 'UPDATE_FILTERS_OBJECT':
      return {
        filtersLocalStorageObject: action.filtersObj,
        ...currentState
      }
    case 'UPDATE_MAP_DRAWER_TAB_VISIBILITY':
      return {
        filtersLocalStorageObject: action.filtersObj,
        mapDrawerTabVisibility: action.mapDrawerTabVisibility,
        ...currentState
      }
    case 'SET_LAST_UPDATE':
      return {
        lastUpdate: action.lastUpdate,
        ...currentState
      }
    default:
      return currentState
  }
}
