import {
  AlertsApiFactory,
  CommunicationsApiFactory,
  GetEntityByIdOutputOfAlertDto,
  GetEntityByIdOutputOfCommunicationDto,
  GetEntityByIdOutputOfMapRequestDto,
  GetEntityByIdOutputOfMissionDto,
  GetEntityByIdOutputOfReportDto,
  MapRequestsApiFactory,
  MissionsApiFactory,
  ReportsApiFactory
} from 'ermes-ts-sdk'
import { useCallback, useMemo, useReducer } from 'react'
import { useAPIConfiguration } from './api-hooks'
import { EntityType } from 'ermes-backoffice-ts-sdk'

const initialState = { tabIndex: 0, selectedFeatureId: '', selectedItemsList: [] }

const TabValuesDict = {
  Person: 0,
  Report: 1,
  Mission: 2,
  Communication: 3,
  MapRequest: 4,
  Alert: 5,
  Station: 6
}

const mergeAndRemoveDuplicates = (a, b) => {
  const c = a.concat(b.filter((item) => a.map((e) => e.id).indexOf(item.id) < 0))
  return c
}

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'SELECT_CARD':
      return {
        tabIndex: action.value.tabIndex,
        selectedFeatureId: action.value.featureId,
        selectedItemsList: []
      }
    case 'ADD_TO_SELECTED_LIST':
      return {
        tabIndex: action.value.tabIndex,
        selectedFeatureId: action.value.featureId,
        selectedItemsList:
          currentState.tabIndex === action.value.tabIndex
            ? mergeAndRemoveDuplicates([action.value.item], [...currentState.selectedItemsList])
            : []
      }
    case 'CLEAR_SELECTED_LIST':
      return {
        ...currentState,
        selectedItemsList: []
      }
    case 'SET_TAB_INDEX':
      return {
        ...currentState,
        tabIndex: action.value,
        selectedItemsList: []
      }
    case 'ERROR':
      return {
        ...currentState
      }
  }
  return initialState
}

export default function useMapDrawer() {
  const [dataState, dispatch] = useReducer(reducer, initialState)

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig), [backendAPIConfig])
  const missionsApiFactory = useMemo(() => MissionsApiFactory(backendAPIConfig), [backendAPIConfig])
  const commApiFactory = useMemo(
    () => CommunicationsApiFactory(backendAPIConfig),
    [backendAPIConfig]
  )
  const maprequestApiFactory = useMemo(
    () => MapRequestsApiFactory(backendAPIConfig),
    [backendAPIConfig]
  )
  const alertsApiFactory = useMemo(() => AlertsApiFactory(backendAPIConfig), [backendAPIConfig])

  const fetchReportById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      repApiFactory
        .reportsGetReportById(id, true)
        .then((result) => {
          const newData: GetEntityByIdOutputOfReportDto = transformData(result.data)
          sideEffect(newData)
          const newTabValue = TabValuesDict[EntityType.REPORT]
          const newFeatureId = EntityType.REPORT + '-' + id
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: newTabValue, featureId: newFeatureId }
          })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [repApiFactory]
  )

  const fetchMissionById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      missionsApiFactory
        .missionsGetMissionById(id, true)
        .then((result) => {
          const newData: GetEntityByIdOutputOfMissionDto = transformData(result.data)
          sideEffect(newData)
          const newTabValue = TabValuesDict[EntityType.MISSION]
          const newFeatureId = EntityType.MISSION + '-' + id
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: newTabValue, featureId: newFeatureId }
          })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [missionsApiFactory]
  )

  const getCommunicationById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      commApiFactory
        .communicationsGetCommunicationById(id, true)
        .then((result) => {
          const newData: GetEntityByIdOutputOfCommunicationDto = transformData(result.data)
          sideEffect(newData)
          const newTabValue = TabValuesDict[EntityType.COMMUNICATION]
          const newFeatureId = EntityType.COMMUNICATION + '-' + id
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: newTabValue, featureId: newFeatureId }
          })
        })
        .catch((error) => {
          // displayErrorSnackbar(error)
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [commApiFactory]
  )

  const fetchMapRequestById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      maprequestApiFactory
        .mapRequestsGetMapRequestById(id, true)
        .then((result) => {
          let newData: GetEntityByIdOutputOfMapRequestDto = transformData(result.data)
          sideEffect(newData)
          const newTabValue = TabValuesDict[EntityType.MAP_REQUEST]
          const newFeatureId = EntityType.MAP_REQUEST + '-' + id
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: newTabValue, featureId: newFeatureId }
          })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.message })
        })
    },
    [maprequestApiFactory]
  )

  const fetchAlertById = useCallback(
    (id, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      alertsApiFactory
        .alertsGetAlertById(id, true)
        .then((result) => {
          let newData: GetEntityByIdOutputOfAlertDto = transformData(result.data)
          sideEffect(newData)
          const newTabValue = TabValuesDict[EntityType.ALERT]
          const newFeatureId = EntityType.ALERT + '-' + id
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: newTabValue, featureId: newFeatureId }
          })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [alertsApiFactory]
  )

  const selectTabCard = (featureType, featureId) => {
    switch (featureType) {
      case EntityType.PERSON:
        const newTabValue = TabValuesDict[EntityType.PERSON]
        const newFeatureId = EntityType.PERSON + '-' + featureId
        dispatch({ type: 'SELECT_CARD', value: { tabIndex: newTabValue, featureId: newFeatureId } })
        return
      case EntityType.REPORT:
        fetchReportById(
          featureId,
          (data) => {
            return {
              ...data.feature.properties
            }
          },
          (error) => {
            console.debug(error)
          },
          (data) => {
            return data
          }
        )
        return
      case EntityType.MISSION:
        fetchMissionById(
          featureId,
          (data) => {
            return {
              ...data.feature.properties
            }
          },
          (error) => {
            console.debug(error)
          },
          (data) => {
            return data
          }
        )
        return
      case EntityType.COMMUNICATION:
        getCommunicationById(
          featureId,
          (data) => {
            return {
              ...data.feature.properties
            }
          },
          (error) => {
            console.debug(error)
          },
          (data) => {
            return data
          }
        )
        return
      case EntityType.MAP_REQUEST:
        fetchMapRequestById(
          featureId,
          (data) => {
            return { ...data.feature.properties }
          },
          (error) => {
            console.debug(error)
          },
          (data) => {
            return data
          }
        )
        return
      case EntityType.ALERT:
        fetchAlertById(
          featureId,
          (data) => {
            return {
              ...data.feature.properties
            }
          },
          (error) => {
            console.debug(error)
          },
          (data) => {
            return data
          }
        )
        return
      case EntityType.STATION:
        const stationTabValue = TabValuesDict[EntityType.STATION]
        const stationFeatureId = EntityType.STATION + '-' + featureId
        dispatch({
          type: 'SELECT_CARD',
          value: { tabIndex: stationTabValue, featureId: stationFeatureId }
        })
        return
    }
  }

  const addCardToTabList = (card) => {
    dispatch({ type: 'ADD_TO_SELECTED_LIST', value: card })
  }

  const updateTabIndex = (index) => {
    dispatch({ type: 'SET_TAB_INDEX', value: index })
  }

  return [dataState, updateTabIndex, selectTabCard, addCardToTabList]
}
