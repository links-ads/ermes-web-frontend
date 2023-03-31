import React, { createContext, useCallback, useEffect, useReducer } from 'react'
import { appBarFiltersReducer, initializer } from '../hooks/use-app-bar-filters.hook'
//import { FiltersDescriptorType } from './floating-filters-tab/floating-filter.interface'

export const FiltersContext = createContext({
  filters: {},
  apply: (filters) => {}
})

const FiltersContextProvider = (props) => {
  const [appBarFilters, dispatch] = useReducer(appBarFiltersReducer, initializer())

  const applyFilters = useCallback(
    (filters) => {
      dispatch({
        type: 'APPLY',
        filters: { datestart: filters.datestart, dateend: filters.dateend }
      })
    },
    []
  )

  return (
    <FiltersContext.Provider
      value={{
        filters: appBarFilters.filters,
        apply: applyFilters
      }}
    >
      {props.children}
    </FiltersContext.Provider>
  )
}

export default FiltersContextProvider