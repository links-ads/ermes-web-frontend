import { useCallback, useReducer, useMemo } from 'react';
import {
  DashboardApiFactory
} from 'ermes-backoffice-ts-sdk';
import {
  useAPIConfiguration
} from './api-hooks';
import useLanguage from './use-language.hook';

const initialState: { isError: boolean, isLoading: boolean, data: any } = { isError: false, isLoading: true, data: {} }

const reducer = (currentState, action: { type: string, data?: any }) => {
  switch (action.type) {
    case 'FETCH':
      return {
        isLoading: true,
        data: [],
        isError: false
      }
    case 'RESULT':
      return {
        isLoading: false,
        data: action.data,
        isError: false
      }
    case 'ERROR':
      return {
        isLoading: false,
        data: [],
        isError: true
      }
  }
  return initialState
}

const useDashboardStats = () => {

  const [statsState, dispatch] = useReducer(reducer, initialState)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const dashboardApiFactory = useMemo(() => DashboardApiFactory(backendAPIConfig), [backendAPIConfig])
  const {dateLocale} = useLanguage()

  const parsePersonsData = useCallback((persons) => {
    const newPersons = [] as any[]
    let dateOptions = { hour12: false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'} as Intl.DateTimeFormatOptions
    let formatter = new Intl.DateTimeFormat(dateLocale, dateOptions)
    persons.forEach(person => {
      const newTimeStamp = formatter.format(new Date(person['timestamp']))
      const newActivity = person['status'] === 'Active' ? person['activityName'] : '-'
      newPersons.push({
        ...person,
        timestamp: newTimeStamp,
        activityName: newActivity,
        tax_code:person['id']
      })
    })
    return newPersons
  }, [dateLocale])

  const fetchStatistics = useCallback((args) => {
    dispatch({ type: 'FETCH' })
    dashboardApiFactory.dashboardGetStatistics(args.startDate, args.endDate).then(result => {
      const resultData = result.data
      dispatch({
        type: 'RESULT', data: {
          ...resultData,
          persons: parsePersonsData(resultData['persons'])
        }
      })
    }).catch(() => {
      dispatch({ type: 'ERROR', data: [] })
    })
  }, [dashboardApiFactory,parsePersonsData])

  return { statsState, fetchStatistics }
}

export default useDashboardStats;