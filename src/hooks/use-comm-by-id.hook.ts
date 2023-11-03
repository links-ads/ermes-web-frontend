import { useCallback, useReducer, useMemo, useContext } from 'react'
import { CommunicationsApiFactory, GetEntityByIdOutputOfCommunicationDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'
import { ErmesAxiosContext } from '../state/ermesaxios.context'

const initialState = { error: false, isLoading: true, data: {}}

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'FETCH':
      return {
        ...currentState,
        isLoading: true,
        data: {},
        error: false
      }
    case 'RESULT':
      return {
        isLoading: false,
        data: action.value,
        error: false
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

const useCommById = () => {
  const [commByIdState, dispatch] = useReducer(reducer, initialState)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const backendUrl = backendAPIConfig.basePath!
  const {axiosInstance} = useContext(ErmesAxiosContext)  
  const commApiFactory = useMemo(() => CommunicationsApiFactory(backendAPIConfig, backendUrl, axiosInstance), [backendAPIConfig])

  const fetchCommById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      commApiFactory
        .communicationsGetCommunicationById(id, true)
        .then((result) => {
          let newData: GetEntityByIdOutputOfCommunicationDto = transformData(result.data)
          sideEffect(newData)
          dispatch({ type: 'RESULT', value: newData })
        })
        .catch(() => {
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [commApiFactory]
  )

  return [commByIdState, fetchCommById]
}

export default useCommById


// import { useCallback, useReducer, useMemo } from 'react'
// import { ReportsApiFactory, GetEntityByIdOutputOfReportDto } from 'faster-ts-sdk'
// import { useAPIConfiguration } from './api-hooks'

// const initialState = { error: false, isLoading: true, data: {} }

// const reducer = (currentState, action) => {
//   switch (action.type) {
//     case 'FETCH':
//       return {
//         ...currentState,
//         isLoading: true,
//         data: {},
//         error: false
//       }
//     case 'RESULT':
//       return {
//         isLoading: false,
//         data: action.value,
//         error: false
//       }
//     case 'ERROR':
//       return {
//         ...currentState,
//         isLoading: false,
//         data: action.value,
//         hasMore: false,
//         error: true
//       }
//   }
//   return initialState
// }

// const useReportById = () => {
//   const [annotationsState, dispatch] = useReducer(reducer, initialState)
//   const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
//   const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig), [backendAPIConfig])

//   const fetchAnnotations = useCallback(
//     (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
//       repApiFactory
//         .reportsGetReportById(id, false)
//         .then((result) => {
//           let newData: GetEntityByIdOutputOfReportDto = transformData(result.data)
//           sideEffect(newData)
//           dispatch({ type: 'RESULT', value: newData })
//         })
//         .catch(() => {
//           dispatch({ type: 'ERROR', value: errorData })
//         })
//     },
//     [repApiFactory]
//   )

//   return [annotationsState, fetchAnnotations]
// }

// export default useReportById
