import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import { ActionsApiFactory, PersonActionDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'
import { useTranslation } from 'react-i18next'

const MAX_RESULT_COUNT = 9
const initialState = { error: false, isLoading: true, data: [], tot: 0 }

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'FETCH':
      return {
        ...currentState,
        isLoading: true,
        data: [],
        error: false,
        tot: action.tot
      }
    case 'RESULT':
      return {
        ...currentState,
        isLoading: false,
        data: [...currentState.data, ...action.value],
        error: false,
        tot: action.tot
      }
    case 'ERROR':
      return {
        ...currentState,
        isLoading: false,
        data: action.value,
        hasMore: false,
        error: true
      }
  }
  return initialState
}

export default function usePeopleList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { displayErrorSnackbar } = useSnackbars()
  const [searchText, setSearchText] = useState<string | undefined>(undefined)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => ActionsApiFactory(backendAPIConfig), [backendAPIConfig])
  const { i18n } = useTranslation()
  
  const [storedFilters, , ] = useMemoryState(
    'memstate-map',
    null,
    false
  )
  const mounted = useRef(false)

  const fetchPeople = useCallback(
    (tot, personId, teamList?, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
      repApiFactory
        .actionsGetActions(
          (filters?.datestart as any)?.selected,
          (filters?.dateend as any)?.selected,
          (filters?.persons as any).content[0].selected,
          undefined,
          teamList,
          (filters?.mapBounds as any).northEast[1],
          (filters?.mapBounds as any).northEast[0],
          (filters?.mapBounds as any).southWest[1],
          (filters?.mapBounds as any).southWest[0],
          MAX_RESULT_COUNT,
          tot,
          undefined,
          searchText,
          undefined,
          undefined,
          {
            headers: {
              'Accept-Language': i18n.language
            }
          }
        )
        .then((result) => {
          //console.log('httpresult', result)
          let newData: PersonActionDto[] = result.data.data || []
          let totToDown: number = result?.data?.recordsTotal ? result?.data?.recordsTotal : -1
          if(!!personId){
            dispatch({
            type: 'RESULT',
            value: newData.filter(e=> e.id === personId),
            tot: totToDown
          })}
          else {
            dispatch({
            type: 'RESULT',
            value: newData,
            tot: totToDown
          })}
        })
        .catch((err) => {
          console.log('httperror', err, err.code, errorData)
          displayErrorSnackbar(err)
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory, displayErrorSnackbar, searchText]
  )
  const applyFilterReloadData = (newFilters) => {
    // dispatch(initialState)
    // setFilters(newFilters)
  }
  const applySearchFilterReloadData = (query: string) => {
    dispatch(initialState)
    setSearchText(query)
  }
  useEffect(() => {
    if (mounted.current) {
      fetchPeople(
        0,
        undefined, 
        undefined,
        (data) => {
          return data
        },
        {},
        (data) => {
          return data
        }
      )
    } else {
      mounted.current = true
    }
  }, [searchText])
  return [dataState, fetchPeople, applyFilterReloadData, applySearchFilterReloadData]
}
