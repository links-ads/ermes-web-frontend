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

const getCardId = (type, id) => {
  return type + '-' + id
}

const getFeatureTypeAndIdFromCardId = (cardId) => {
  const cardDetails = cardId.split('-')
  const featureType = cardDetails[0]
  const featureId = featureType === EntityType.STATION ? cardDetails[1] : Number(cardDetails[1])
  return [featureType, featureId]
}

export const findFeatureByTypeAndId = (featureList, cardId) => {
  const [type, id] = getFeatureTypeAndIdFromCardId(cardId)
  if (type === EntityType.STATION) {
    const stationFeature = featureList.find(
      (e) => e?.properties?.details === id && e?.properties?.type === type
    )
    return stationFeature
  } else {
    const feature = featureList.find(
      (e) => e?.properties?.id === id && e?.properties?.type === type
    )
    return feature
  }
}

export const areClickedPointAndSelectedCardEqual = (clickedPoint, selectedCardId) => {
  if (selectedCardId === '' || !clickedPoint || clickedPoint === null) return false
  let areEqual = false
  const [type, id] = getFeatureTypeAndIdFromCardId(selectedCardId)
  const pointType = clickedPoint.item?.type
  let pointId = clickedPoint.item?.id
  if (type === EntityType.STATION) {
    pointId = clickedPoint.item?.details
  }
  if (pointId === id && pointType === type) {
    areEqual = true
  }
  return areEqual
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
    case 'SET_TAB_INDEX':
      return {
        ...currentState,
        tabIndex: action.value,
        selectedItemsList: []
      }
    case 'SET_SELECTED_FEATURE_ID':
      return {
        ...currentState,
        selectedFeatureId: action.value
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
    (
      id,
      tabValue,
      cardId,
      transformData = (data) => {},
      errorData = {},
      sideEffect = (data) => {}
    ) => {
      repApiFactory
        .reportsGetReportById(id, true)
        .then((result) => {
          const newData: GetEntityByIdOutputOfReportDto = transformData(result.data)
          sideEffect(newData)
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: tabValue, featureId: cardId }
          })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [repApiFactory]
  )

  const fetchMissionById = useCallback(
    (
      id,
      tabValue,
      cardId,
      transformData = (data) => {},
      errorData = {},
      sideEffect = (data) => {}
    ) => {
      missionsApiFactory
        .missionsGetMissionById(id, true)
        .then((result) => {
          const newData: GetEntityByIdOutputOfMissionDto = transformData(result.data)
          sideEffect(newData)
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: tabValue, featureId: cardId }
          })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [missionsApiFactory]
  )

  const getCommunicationById = useCallback(
    (
      id,
      tabValue,
      cardId,
      transformData = (data) => {},
      errorData = {},
      sideEffect = (data) => {}
    ) => {
      commApiFactory
        .communicationsGetCommunicationById(id, true)
        .then((result) => {
          const newData: GetEntityByIdOutputOfCommunicationDto = transformData(result.data)
          sideEffect(newData)
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: tabValue, featureId: cardId }
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
    (
      id,
      tabValue,
      cardId,
      transformData = (data) => {},
      errorData = {},
      sideEffect = (data) => {}
    ) => {
      maprequestApiFactory
        .mapRequestsGetMapRequestById(id, true)
        .then((result) => {
          let newData: GetEntityByIdOutputOfMapRequestDto = transformData(result.data)
          sideEffect(newData)
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: tabValue, featureId: cardId }
          })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.message })
        })
    },
    [maprequestApiFactory]
  )

  const fetchAlertById = useCallback(
    (
      id,
      tabValue,
      cardId,
      transformData = (data) => {},
      errorData = {},
      sideEffect = (data) => {}
    ) => {
      alertsApiFactory
        .alertsGetAlertById(id, true)
        .then((result) => {
          let newData: GetEntityByIdOutputOfAlertDto = transformData(result.data)
          sideEffect(newData)
          dispatch({
            type: 'ADD_TO_SELECTED_LIST',
            value: { item: newData, tabIndex: tabValue, featureId: cardId }
          })
        })
        .catch((error) => {
          dispatch({ type: 'ERROR', value: error.response.data.error.message })
        })
    },
    [alertsApiFactory]
  )

  const selectTabCard = (feature) => {
    const featureType = feature.type
    const featureId = feature.id
    const newTabValue = TabValuesDict[featureType]
    const featureCardId = getCardId(featureType, featureId)
    switch (featureType) {
      case EntityType.PERSON:
        dispatch({
          type: 'SELECT_CARD',
          value: { tabIndex: newTabValue, featureId: featureCardId }
        })
        return
      case EntityType.REPORT:
        fetchReportById(
          featureId,
          newTabValue,
          featureCardId,
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
          newTabValue,
          featureCardId,
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
          newTabValue,
          featureCardId,
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
          newTabValue,
          featureCardId,
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
          newTabValue,
          featureCardId,
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
        const stationFeatureId = feature.details
        const stationCardId = getCardId(featureType, stationFeatureId)
        dispatch({
          type: 'SELECT_CARD',
          value: { tabIndex: newTabValue, featureId: stationCardId }
        })
        return
    }
  }

  const updateCardId = (cardId) => {
    dispatch({ type: 'SET_SELECTED_FEATURE_ID', value: cardId })
  }

  const addCardToTabList = (card) => {
    dispatch({ type: 'ADD_TO_SELECTED_LIST', value: card })
  }

  const updateTabIndex = (index) => {
    dispatch({ type: 'SET_TAB_INDEX', value: index })
  }

  return [dataState, updateTabIndex, selectTabCard, addCardToTabList, updateCardId]
}
