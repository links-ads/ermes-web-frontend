import { useCallback, useReducer, useMemo, useState, useEffect, useRef } from 'react'
import { MapRequestsApiFactory, MapRequestDto } from 'ermes-ts-sdk' // MapRequestDto
import { useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useMemoryState } from './use-memory-state.hook'
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface'

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
                data: action.value, //was data: [...currentState.data, ...action.value],  but then results keep adding each call
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

export default function useMapRequestList() {
    const [dataState, dispatch] = useReducer(reducer, initialState)
    const { displayErrorSnackbar } = useSnackbars()
    //   const mounted = useRef(false)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const maprequestApiFactory = useMemo(() => MapRequestsApiFactory(backendAPIConfig), [backendAPIConfig])
    const [textQuery, setSearchQuery] = useState<string | undefined>(undefined)
    const mounted = useRef(false)
    const [storedFilters, , ] = useMemoryState(
        'memstate-map',
        null,
        false
    )
    const fetchMapRequests = useCallback(
        (tot, transformData = (data) => { }, errorData = {}, sideEffect = (data) => { }) => {
            const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
            maprequestApiFactory.mapRequestsGetMapRequests(
                (filters?.datestart as any)?.selected,
                (filters?.dateend as any)?.selected,
                (filters?.mapRequests as any).content[0].selected,
                (filters?.mapRequests as any).content[1].selected,
                (filters?.mapRequests as any).content[2].selected,
                (filters?.mapBounds as any).northEast[1],
                (filters?.mapBounds as any).northEast[0],
                (filters?.mapBounds as any).southWest[1],
                (filters?.mapBounds as any).southWest[0],
                MAX_RESULT_COUNT,
                tot,
                undefined,
                textQuery,
                undefined,
                undefined)
                .then((result) => {
                    let newData: MapRequestDto[] = transformData(result.data.data) || [] // Where is MapRequestsDto
                    console.log('NEW DATA MAP REQUEST', newData)
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
        [maprequestApiFactory, displayErrorSnackbar, textQuery,storedFilters]
    )
    const applySearchQueryReloadData = (searchQuery: string) => {
        dispatch(initialState)
        setSearchQuery(searchQuery)
    }
    useEffect(() => {
        if (mounted.current) {
            fetchMapRequests(
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
    }, [textQuery,fetchMapRequests])
    return [dataState, fetchMapRequests, applySearchQueryReloadData]
}
