import { GamificationApiFactory } from "ermes-ts-sdk";
import { useCallback, useReducer, useMemo, useContext } from 'react';
import {
    useAPIConfiguration
  } from './api-hooks';
  import useLanguage from './use-language.hook';
import { ErmesAxiosContext } from "../state/ermesaxios.context";

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
  
  const useLeaderboard = () => {

    const [statsState, dispatch] = useReducer(reducer, initialState)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const backendUrl = backendAPIConfig.basePath!
    const {axiosInstance} = useContext(ErmesAxiosContext)    
    const gamificationApiFactory = useMemo(() => GamificationApiFactory(backendAPIConfig, backendUrl, axiosInstance), [backendAPIConfig])
    const {dateLocale} = useLanguage()
    const parseCompetitorsData = useCallback((persons) => {
        const newComp = [] as any[]
        let dateOptions = { hour12: false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'} as Intl.DateTimeFormatOptions
        let formatter = new Intl.DateTimeFormat(dateLocale, dateOptions)
        persons.forEach(person => {
          //const newTimeStamp = formatter.format(new Date(person['timestamp']))
          //const newActivity = person['status'] === 'Active' ? person['activityName'] : '-'
          newComp.push({
            ...person,
            //timestamp: newTimeStamp,
            //activityName: newActivity,
            //tax_code:person['id']
          })
        })
        return newComp
      }, [dateLocale])
  



    const fetchLeaderboard = useCallback((args) => {
        dispatch({ type: 'FETCH' })
        gamificationApiFactory.gamificationGetLeaderboard().then(result => {
          const resultData = result.data
          dispatch({
            type: 'RESULT', data: {
              ...resultData,
              competitors: parseCompetitorsData(resultData['competitors'])
            }
          })
        }).catch(() => {
          dispatch({ type: 'ERROR', data: [] })
        })
      }, [gamificationApiFactory])
      return { statsState, fetchLeaderboard }
  }

  export default useLeaderboard;