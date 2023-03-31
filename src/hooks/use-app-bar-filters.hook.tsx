import React, { useCallback, useReducer } from 'react'

import { FiltersType } from '../common/filters/reducer'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { initObjectState } from '../pages/protected/map/map-filters-init.state'
import { getFilterObjFromFilters, _MS_PER_DAY } from '../utils/utils.common'

const appBarInitialState = {
  filtersLocalStorageObject: {},
  filters: {}
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

export const initializer = () => {
  let filtersArgs = {}
  let filtersObj = {}
  const key = 'memstate-map'
  let storedFilters = localStorage.getItem(key)
  if (storedFilters === null){
    localStorage.setItem(key, JSON.stringify(JSON.parse(JSON.stringify(initObjectState))))
  }

  storedFilters = localStorage.getItem(key)

  if (storedFilters !== null) {
    filtersObj = JSON.parse(storedFilters)

    if (filtersObj) {
      filtersObj = initObjectState
    }
    filtersArgs = getDefaultFiltersFromLocalStorageObject(filtersObj)

    return {
      filtersLocalStorageObject: filtersObj as FiltersDescriptorType,
      filters: filtersArgs as FiltersType
    }
  } else {
    
    return appBarInitialState
  }
}

export const appBarFiltersReducer = (currentState, action) => {
  const { filtersLocalStorageObject: currentFiltersObject, filters: currentFilters } = currentState
  switch (action.type) {
    case 'APPLY':
      const newFilters = action.filters
      const updatedFiltersObject = getFilterObjFromFilters(newFilters, {}, {}, false)
      const newFiltersObject = currentFiltersObject
      if (newFiltersObject && newFiltersObject.filters && updatedFiltersObject && updatedFiltersObject.filters) {
        ;(newFiltersObject.filters.datestart as any).selected = (updatedFiltersObject.filters.datestart as any)
          .selected as string
        ;(newFiltersObject.filters.dateend as any).selected = (updatedFiltersObject.filters.dateend as any)
          .selected as string
        localStorage.setItem('memstate-map', JSON.stringify(newFiltersObject))
      }
      return {
        filtersLocalStorageObject: newFiltersObject,
        filters: action.filters
      }
    default:
      return currentState
  }
}