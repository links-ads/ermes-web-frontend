import { useCallback, useReducer, useMemo } from 'react';
import {
    ImportApiFactory
} from 'ermes-backoffice-ts-sdk';
import {
    useAPIConfiguration
} from './api-hooks';
import { useSnackbars } from './use-snackbars.hook';

export enum ImportEnum {
    ACTIVITIES = "activities",
    USERS = "users",
    CATEGORIES = "categories"
}

const initialState = { isError: false, errorMsg: '', isLoading: false, data: {} }

const reducer = (currentState, action) => {
    switch (action.type) {
        case 'SEND':
            return {
                isLoading: true,
                data: {},
                isError: false,
                errorMsg: ''
            }
        case 'RESULT':
            return {
                isLoading: false,
                data: action.data,
                isError: false,
                errorMsg: ''
            }
        case 'ERROR':
            return {
                isLoading: false,
                data: {},
                errorMsg: action.error,
                isError: true
            }
        default:
            return initialState
    }
}


const useImports = () => {

    const [importState, dispatch] = useReducer(reducer, initialState)
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const importApiFactory = useMemo(() => ImportApiFactory(backendAPIConfig), [backendAPIConfig])
    const {displayErrorSnackbar} = useSnackbars()

    const handleSuccess = useCallback((response) => {
        dispatch({
            type:'RESULT',
            data:response.data,
        })
    }, [])
    
    const handleFailure = useCallback((response) => {
        dispatch({
            type:'ERROR',
        })
        displayErrorSnackbar(response['response'].statusText)
    }, [displayErrorSnackbar])

    const sendFile = useCallback((selection: string, file) => {
        dispatch({ type: 'SEND' })
        switch (selection) {
            case ImportEnum.ACTIVITIES:
                importApiFactory.importImportActivities(file).then((response) => handleSuccess(response)).catch(err => handleFailure(err))
                break;
            case ImportEnum.USERS:
                importApiFactory.importImportUsers(file).then((response) => handleSuccess(response)).catch(err => handleFailure(err))
                break;
            case ImportEnum.CATEGORIES:
                importApiFactory.importImportActivities(file).then((response) => handleSuccess(response)).catch(err => handleFailure(err))
                break;
            default:
                console.error('ERROR')
        }
    }, [importApiFactory,handleSuccess,handleFailure])

    return { importState, sendFile }
}

export default useImports;
