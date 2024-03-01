import { FiltersType } from '../common/filters/reducer'
import {
  FiltersDescriptorType,
  MapBounds,
  Select
} from '../common/floating-filters-tab/floating-filter.interface'
import { initObjectState } from '../pages/protected/map/map-filters-init.state'
import { _MS_PER_DAY } from '../utils/utils.common'
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

export const citizenAlertRestricition = {
  name: 'restriction',
  options: [CommunicationRestrictionType.CITIZEN],
  type: 'multipleselect',
  selected: [CommunicationRestrictionType.CITIZEN]
}

export const citizenReportHazardVisibility: Select = {
  name: 'hazard_visibility',
  options: ['Public'],
  type: 'select',
  selected: 'Public'
}

export const citizenCommunicationRestricition = {
  name: 'restriction',
  options: [CommunicationRestrictionType.CITIZEN],
  type: 'conditional_multipleselect',
  selected: [CommunicationRestrictionType.CITIZEN]
}

export const notCitizenAlertRestricition = {
  name: 'restriction',
  options: [CommunicationRestrictionType.CITIZEN, CommunicationRestrictionType.PROFESSIONAL],
  type: 'multipleselect',
  selected: []
}

export const notCitizenReportHazardVisibility = {
  name: 'hazard_visibility',
  options: ['Private', 'Public', 'All'],
  type: 'select',
  selected: 'Private'
}

export const notCitizenCommunicationRestricition = {
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

export const initializer = (configuration): any => {
  let filtersArgs = {}
  let filtersObj = {} as any
  const appConfig = configuration?.appConfig
  const userProfile = configuration?.userProfile
  let storedFilters = localStorage.getItem(localStorageKey)
  if (storedFilters === null || storedFilters === 'null') {
    filtersObj = { ...initObjectState }
    filtersObj.filters.mapBounds.northEast =
      appConfig?.mapboxgl?.mapBounds?.northEast ??
      (initObjectState?.filters?.mapBounds as MapBounds).northEast
    filtersObj.filters.mapBounds.southWest =
      appConfig?.mapboxgl?.mapBounds?.southWest ??
      (initObjectState?.filters?.mapBounds as MapBounds).southWest
    filtersObj.filters.mapBounds.zoom =
      appConfig?.mapboxgl?.mapViewport?.zoom ??
      (initObjectState?.filters?.mapBounds as MapBounds).zoom
    filtersObj.filters.report.content[1] =
      userProfile && userProfile.role && userProfile.role !== ROLE_CITIZEN
        ? { ...notCitizenReportHazardVisibility }
        : { ...citizenReportHazardVisibility }
    filtersObj.filters.communication.content[1] =
      userProfile && userProfile.role && userProfile.role !== ROLE_CITIZEN
        ? { ...notCitizenCommunicationRestricition }
        : { ...citizenCommunicationRestricition }
    filtersObj.filters.alert.content[0] =
      userProfile && userProfile.role && userProfile.role !== ROLE_CITIZEN
        ? { ...notCitizenAlertRestricition }
        : { ...citizenAlertRestricition }
  } else {
    filtersObj = JSON.parse(storedFilters)

    if (userProfile && userProfile.role && userProfile.role !== ROLE_CITIZEN) {
      const selectedReportHazardVisibility = filtersObj.filters.report.content[1].selected
      filtersObj.filters.report.content[1] = {
        ...notCitizenReportHazardVisibility,
        selected: selectedReportHazardVisibility
      }
      const selectedCommunicationRestriction = filtersObj.filters.communication.content[1].selected
      filtersObj.filters.communication.content[1] = {
        ...notCitizenCommunicationRestricition,
        selected: selectedCommunicationRestriction
      }
      const selectedAlertRestriction = filtersObj.filters.alert.content[0].selected
      filtersObj.filters.alert.content[0] = {
        ...notCitizenAlertRestricition,
        selected: selectedAlertRestriction
      }
    } else {
      filtersObj.filters.report.content[1] = { ...citizenReportHazardVisibility }
      filtersObj.filters.communication.content[1] = { ...citizenCommunicationRestricition }
      filtersObj.filters.alert.content[0] = { ...citizenAlertRestricition }
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
