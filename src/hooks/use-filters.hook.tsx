import { useCallback, useReducer,useMemo } from 'react';
import {
    SocialApiFactory
} from 'ermes-backoffice-ts-sdk';
import {
    useAPIConfiguration
} from './api-hooks';

const initialState = {error:false, isLoading: true, hazardNames: [], mapHazardsToIds: {}, mapIdsToHazards: {}, infoNames: [], mapInfosToIds: {}, mapIdsToInfos: {} }

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
                ...action.value,
                error:false
            }
        case 'ERROR':
            return {
                ...initialState,
                isLoading: false,
                error:true
            }
        default:
            throw new Error("Not handled case")
    }
}
const useFilters = () => {
    const [filtersState, dispatch] = useReducer(reducer, initialState)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const socialApiFactory = useMemo(()=> SocialApiFactory(backendAPIConfig),[backendAPIConfig])
    const fetchData = useCallback(() => {
        dispatch({ type: 'FETCH' })
        socialApiFactory.socialGetLabels().then((result) => {
            let mapHazards = {}
            let mapInfos = {}
            let mapHazardIds = {}
            let mapInfoIds = {}
            let hazardData = result.data.labels!.filter(item => item.task === 'hazard_type')
            let infoData = result.data.labels!.filter(item => item.task === 'information_type')
            let hazards = hazardData.map(item => item.name)
            let infos = infoData.map(item => item.name)
            for (let data of hazardData) {
                mapHazards[data['name'] as string] = data['id']
                mapHazardIds[data['id'] as number] = data['name']
            }
            for (let data of infoData) {
                mapInfos[data['name'] as string] = data['id']
                mapInfoIds[data['id'] as number] = data['name']
            }
            dispatch({ type: 'RESULT', value: { hazardNames: hazards as never[], mapHazardsToIds: mapHazards, mapIdsToHazards: mapHazardIds, infoNames: infos as never[], mapInfosToIds: mapInfos, mapIdsToInfos: mapInfoIds } })
        }).catch(() => {
            dispatch({ type: 'ERROR' })
        })
    }, [socialApiFactory])
    return [filtersState,fetchData]
}

export default useFilters;