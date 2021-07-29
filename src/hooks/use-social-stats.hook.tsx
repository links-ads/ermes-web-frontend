import { useCallback, useReducer,useMemo } from 'react';
import {
    SocialApiFactory
} from 'ermes-backoffice-ts-sdk';
import {
    useAPIConfiguration
} from './api-hooks';
import { parseStats } from '../common/stats-cards.components';

const initialState = {error:false, isLoading: true, stats: {} }

const reducer = (currentState, action) => {
    switch (action.type) {
        case 'FETCH':
            return {
                ...currentState,
                isLoading: true,
                error:false
            }
        case 'RESULT':
            return {
                isLoading: false,
                stats:action.value,
                error:false
            }
        case 'ERROR':
            return {
                ...initialState,
                isLoading: false,
                error:true
            }
    }
    return initialState
}

const useSocialStat = (type : 'TWEETS' | "EVENTS") => {

    const [socialStatState, dispatch] = useReducer(reducer, initialState)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const socialApiFactory = useMemo(()=> SocialApiFactory(backendAPIConfig),[backendAPIConfig])
    const fetchEventStats = useCallback((args) => {
        dispatch({ type: 'FETCH' })
        socialApiFactory.socialGetEventStatistics(args.languageSelect, args.datestart,
            args.dateend, args.infoTypeSelect, args.hazardSelect, args.southWest, args.northEast).then(result => {
                dispatch({type:'RESULT',value:{
                    events_count:result.data['events_count'] || 0,
                    hazard_count:result.data['hazards_count'],
                    info_count:result.data['infotypes_count'],
                    languages_count:result.data['languages_count'] ? parseStats(result.data['languages_count']) : 0 
                }})
            }).catch(()=>{
                dispatch({type:'ERROR'})
            })
    }, [socialApiFactory])
    const fetchTweetStats = useCallback( (args) => {
        dispatch({type:'FETCH'})
        socialApiFactory.socialGetTweetStatistics(args.informativeSelect, args.languageSelect, args.datestart,
            args.dateend, args.infoTypeSelect, args.hazardSelect, args.southWest, args.northEast).then(result => {
                dispatch({type:'RESULT',value:{
                    tweets_count:result.data['tweets_count'] || 0,
                    hazard_count:result.data['hazards_count'],
                    info_count:result.data['infotypes_count'],
                    languages_count:result.data['languages_count'] ? parseStats(result.data['languages_count']) : 0 ,
                    informativeness_ratio:result.data['informativeness_ratio'] || null
                }})
            }).catch(() => {
                dispatch({type:'ERROR'})
            })
    },[socialApiFactory])
    if (type === 'TWEETS')
        return [socialStatState,fetchTweetStats]
    else
        return [socialStatState,fetchEventStats]
}

export default useSocialStat;