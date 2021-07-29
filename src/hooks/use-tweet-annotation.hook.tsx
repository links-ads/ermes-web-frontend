import { useCallback, useReducer, useMemo } from 'react';
import {
    SocialApiFactory
} from 'ermes-backoffice-ts-sdk';
import {
    useAPIConfiguration
} from './api-hooks';

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
                error:false
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

const useTweetsAnnotations = () => {

    const [annotationsState, dispatch] = useReducer(reducer, initialState)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const socialApiFactory = useMemo(() => SocialApiFactory(backendAPIConfig), [backendAPIConfig])

    const fetchAnnotations = useCallback((args, page_size, update, transformData = (data) => { }, errorData = {}, sideEffect = (data) => { }) => {
        let pageNumber = update ? annotationsState.nextPage : 1
        if (update)
            dispatch({ type: 'UPDATE' })
        else
            dispatch({ type: 'FETCH' })
        socialApiFactory.socialGetAnnotations(pageNumber, page_size, args.informativeSelect, args.languageSelect, args.datestart,
            args.dateend, args.infoTypeSelect, args.hazardSelect, args.southWest,
            args.northEast).then(result => {
                let newData = transformData(result.data.items)
                newData = update ? [...annotationsState.data, ...newData || [] as any] : newData || [] as any
                sideEffect(newData)
                let hasMore = (result.data.total !== undefined) && (newData.length < result.data?.total)
                dispatch({ type: 'RESULT', value: newData, more: hasMore })
            }).catch(() => {
                dispatch({ type: 'ERROR', value: errorData })
            })
    }, [socialApiFactory, annotationsState])

    return [annotationsState, fetchAnnotations]
}

export default useTweetsAnnotations;