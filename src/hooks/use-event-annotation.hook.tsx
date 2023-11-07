import { useCallback, useReducer, useMemo, useContext } from 'react';
import {
    SocialApiFactory
} from 'ermes-backoffice-ts-sdk';
import {
    useAPIConfiguration
} from './api-hooks';
import { ErmesAxiosContext } from '../state/ermesaxios.context';

const initialState = { error:false,hasMore: false, isLoading: true, data: [], nextPage: 1 }

const reducer = (currentState, action) => {
    switch (action.type) {
        case 'FETCH':
            return {
                ...currentState,
                isLoading: true,
                data: [],
                error:false
            }
        case 'UPDATE':
            return {
                ...currentState,
                isLoading: true,
                error:false,
            }
        case 'RESULT':
            return {
                isLoading: false,
                data: action.value,
                nextPage: currentState.nextPage + 1,
                hasMore: action.more,
                error:false
            }
        case 'ERROR':
            return {
                ...currentState,
                isLoading: false,
                data: action.value,
                hasMore:false,
                error:true
            }
    }
    return initialState
}

const useEventsAnnotations = () => {

    const [annotationsState, dispatch] = useReducer(reducer, initialState)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const backendUrl = backendAPIConfig.basePath!
    const {axiosInstance} = useContext(ErmesAxiosContext)    
    const socialApiFactory = useMemo(() => SocialApiFactory(backendAPIConfig, backendUrl, axiosInstance), [backendAPIConfig])

    const fetchAnnotations = useCallback((args, page_size, update, transformData = (data) => { }, errorData = {}, sideEffect = (data) => { },annotationsState) => {
        let pageNumber = update ? annotationsState.nextPage : 1
        if (update)
            dispatch({ type: 'UPDATE' })
        else
            dispatch({ type: 'FETCH' })
        socialApiFactory.socialGetEvents(pageNumber, page_size, args.languageSelect, args.datestart,
            args.dateend, args.infoTypeSelect, args.hazardSelect, args.southWest, args.northEast).then(result => {
                let newData = transformData(result.data.items)
                newData = update ? [...annotationsState.data, ...newData || [] as any] : newData || [] as any
                let hasMore = (result.data.total !== undefined) && (newData.length < result.data?.total)
                sideEffect(newData)
                dispatch({ type: 'RESULT', value: newData, more: hasMore })
            }).catch(() => {
                sideEffect(errorData)
                dispatch({ type: 'ERROR', value: errorData })
            })
    }, [socialApiFactory])

    return [annotationsState, fetchAnnotations]
}

export default useEventsAnnotations;