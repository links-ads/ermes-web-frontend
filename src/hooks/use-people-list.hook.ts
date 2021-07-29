import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import { ActionsApiFactory, PersonActionDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'

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
  const [filters, setFilters] = useState([])
  const mounted = useRef(false)

  const fetchPeople = useCallback(
    (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      repApiFactory
        .actionsGetActions(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          MAX_RESULT_COUNT,
          tot,
          undefined,
          searchText,
          undefined,
          undefined
        )
        .then((result) => {
          let newData: PersonActionDto[] = transformData(result.data.data) || []

          let totToDown: number = result?.data?.recordsTotal ? result?.data?.recordsTotal : -1
          dispatch({
            type: 'RESULT',
            value: newData,
            tot: totToDown
          })
        })
        .catch((err) => {
          displayErrorSnackbar(err)
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory, displayErrorSnackbar, filters, searchText]
  )
  const applyFilterReloadData = (newFilters) => {
    // dispatch(initialState)
    setFilters(newFilters)
  }
  const applySearchFilterReloadData = (query: string) => {
    dispatch(initialState)
    setSearchText(query)
  }
  useEffect(() => {
    if (mounted.current) {
      fetchPeople(
        0,
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