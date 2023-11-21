import { useCallback, useContext, useMemo, useReducer } from 'react'
import { useAPIConfiguration } from './api-hooks'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { GroupLayerState, LayerSettingsState } from '../models/layers/LayerState'
import { getFeatureInfoUrl, getLegendURL } from '../utils/map.utils'
import { useTranslation } from 'react-i18next'
import {
  FeatureInfo,
  ImpactFeatureInfoValue,
  LayerFeatureInfo,
  LayerFeatureInfoState
} from '../models/layers/LayerFeatureInfo'
import { ErmesAxiosContext } from '../state/ermesaxios.context'

const initialState = {
  rawLayers: {},
  groupedLayers: [],
  selectedLayers: [],
  toBeRemovedLayers: [],
  layersMetadata: [],
  layersLegend: [],
  layerTimeseries: null,
  layerFeatureInfo: null,
  defaultPosition: { x: 0, y: 0 },
  defaultDimension: { h: 116, w: 1000, percW: '100%' },
  isLoading: true,
  error: false
}

const keepPrevSelection = (newGroupedLayers, oldSelectedLayers) => {
  const groupedLayers = { ...newGroupedLayers }
  const selectedLayers = [...oldSelectedLayers]
  if (selectedLayers.length > 0) {
    for (let i = 0; i < selectedLayers.length; i++) {
      const selectedLayer = selectedLayers[i]
      if (
        groupedLayers &&
        groupedLayers[selectedLayer.group] &&
        groupedLayers[selectedLayer.group][selectedLayer.subGroup] &&
        groupedLayers[selectedLayer.group][selectedLayer.subGroup][selectedLayer.dataTypeId]
      ) {
        groupedLayers[selectedLayer.group][selectedLayer.subGroup][
          selectedLayer.dataTypeId
        ].isChecked = true
      }
    }
  }
  return groupedLayers
}

const updateSelection = (newGroupedLayers, oldSelectedLayers) => {
  const groupedLayers = { ...newGroupedLayers }
  const selectedLayers = [...oldSelectedLayers]
  const oldSelectedLayersLength = selectedLayers.length
  if (oldSelectedLayersLength > 0) {
    for (let i = 0; i < oldSelectedLayersLength; i++) {
      const selectedLayer = oldSelectedLayers[i]
      if (
        !groupedLayers ||
        !groupedLayers[selectedLayer.group] ||
        !groupedLayers[selectedLayer.group][selectedLayer.subGroup] ||
        !groupedLayers[selectedLayer.group][selectedLayer.subGroup][selectedLayer.dataTypeId]
      ) {
        const selectedLayerIdx = selectedLayers.findIndex(
          (e) =>
            e.group === selectedLayer.group &&
            e.subGroup === selectedLayer.subGroup &&
            e.dataTypeId === selectedLayer.dataTypeId
        )
        if (selectedLayerIdx > -1) {
          selectedLayers.splice(selectedLayerIdx, 1)
        }
      }
    }
  }
  return selectedLayers
}

const updateToRemove = (newGroupedLayers, oldSelectedLayers, oldToBeRemovedLayers) => {
  const groupedLayers = { ...newGroupedLayers }
  const selectedLayers = [...oldSelectedLayers]
  const toBeRemovedLayers = [...oldToBeRemovedLayers]
  if (selectedLayers.length > 0) {
    for (let i = 0; i < selectedLayers.length; i++) {
      const selectedLayer = selectedLayers[i]
      if (
        !groupedLayers ||
        !groupedLayers[selectedLayer.group] ||
        !groupedLayers[selectedLayer.group][selectedLayer.subGroup] ||
        !groupedLayers[selectedLayer.group][selectedLayer.subGroup][selectedLayer.dataTypeId]
      ) {
        const activeLayer = {
          layerName: selectedLayer.activeLayer,
          layerDateIndex: selectedLayer.dateIndex
        }
        toBeRemovedLayers.push(activeLayer)
      }
    }
  }
  return toBeRemovedLayers
}

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'RESULT':
      return {
        ...currentState,
        isLoading: false,
        groupedLayers: keepPrevSelection(action.value.groupedLayers, [
          ...currentState.selectedLayers
        ]),
        rawLayers: action.value.rawLayers,
        selectedLayers: [
          ...updateSelection(action.value.groupedLayers, [...currentState.selectedLayers])
        ],
        toBeRemovedLayers: updateToRemove(
          action.value.groupedLayers,
          [...currentState.selectedLayers],
          [...currentState.toBeRemovedLayers]
        ),
        layersMetadata: updateSelection(action.value.groupedLayers, [
          ...currentState.layersMetadata
        ]),
        layersLegend: updateSelection(action.value.groupedLayers, [...currentState.layersLegend]),
        layerTimeseries: null,
        layerFeatureInfo: null
      }
    case 'OPACITY':
      return {
        ...currentState,
        selectedLayers: action.value.selectedLayers
      }
    case 'TIMESTAMP':
      return {
        ...currentState,
        selectedLayers: action.value.selectedLayers,
        toBeRemovedLayers: action.value.toBeRemovedLayers
      }
    case 'UPDATE_SELECTED_LAYERS':
      return {
        ...currentState,
        groupedLayers: action.value.groupedLayers,
        selectedLayers: action.value.selectedLayers,
        toBeRemovedLayers: action.value.toBeRemovedLayers,
        layersLegend: action.value.layersLegend,
        layersMetadata: action.value.layersMetadata,
        layerTimeseries: action.value.layerTimeseries,
        layerFeatureInfo: action.value.layerFeatureInfo
      }
    case 'UPDATE_SELECTED_LAYERS_FROM_MAP_REQUEST':
      return {
        ...currentState,
        selectedLayers: action.value.selectedLayers,
        toBeRemovedLayers: action.value.toBeRemovedLayers,
        layersLegend: action.value.layersLegend,
        layersMetadata: action.value.layersMetadata,
        layerTimeseries: action.value.layerTimeseries,
        layerFeatureInfo: action.value.layerFeatureInfo
      }
    case 'UPDATE_LAYER_PLAYER':
      return {
        ...currentState,
        selectedLayers: action.value
      }
    case 'UPDATE_LAYERS_METADATA':
      return {
        ...currentState,
        layersMetadata: action.value
      }
    case 'DEFAULT_POSITION_AND_DIMENSION':
      return {
        ...currentState,
        defaultPosition: { ...action.value.defaultPosition },
        defaultDimension: { ...action.value.defaultDimension }
      }
    case 'UPDATE_LAYERS_LEGEND':
      return {
        ...currentState,
        layersLegend: action.value
      }
    case 'UPDATE_LAYER_TIMESERIES':
      return {
        ...currentState,
        layerTimeseries: action.value
      }
    case 'UPDATE_LAYER_FEATURE_INFO':
      return {
        ...currentState,
        layerFeatureInfo: action.value
      }
    case 'ERROR':
      return {
        ...currentState,
        isLoading: false,
        error: true
      }
  }
  return initialState
}

const useMapLayers = () => {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { i18n } = useTranslation()
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const backendUrl = backendAPIConfig.basePath!
  const {axiosInstance} = useContext(ErmesAxiosContext)    
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig, backendUrl, axiosInstance), [backendAPIConfig])

  const fetchLayers = useCallback(
    (filtersObj, transformData = () => {}) => {
      layersApiFactory
        .layersGetLayers(
          undefined,
          undefined,
          filtersObj!.filters!.datestart['selected'],
          filtersObj!.filters!.dateend['selected'],
          undefined, //TODO: add MapRequestCode management
          true,
          {
            headers: {
              'Accept-Language': i18n.language
            }
          }
        )
        .then((result) => {
          const mappedResult = transformData(result)
          dispatch({
            type: 'RESULT',
            value: {
              groupedLayers: mappedResult,
              rawLayers: result.data
            }
          })
        })
        .catch((err) => {
          dispatch({ type: 'ERROR', value: err })
        })
    },
    [layersApiFactory]
  )

  const updateDefaultPosAndDim = useCallback(
    (windowInnerHeight: number, windowInnerWidth: number) => {
      let updatedDefaultPosition = { ...dataState.defaultPosition }
      updatedDefaultPosition = {
        x: 0,
        y: Math.max(90, windowInnerHeight - 219)
      }
      let updatedDefaultDimension = { ...dataState.defaultDimension }
      updatedDefaultDimension.w = windowInnerWidth
      dispatch({
        type: 'DEFAULT_POSITION_AND_DIMENSION',
        value: {
          defaultPosition: updatedDefaultPosition,
          defaultDimension: updatedDefaultDimension
        }
      })
    },
    [dataState]
  )

  const changeOpacity = useCallback(
    (group: string, subGroup: string, dataTypeId: number, newValue: number) => {
      let updatedSelectedLayers = [...dataState.selectedLayers]
      const findToChangeSelectedLayerIdx = updatedSelectedLayers.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      updatedSelectedLayers[findToChangeSelectedLayerIdx].opacity = newValue
      dispatch({
        type: 'OPACITY',
        value: { selectedLayers: updatedSelectedLayers }
      })
    },
    [dataState]
  )

  const clearToBeRemovedLayers = (layers, selectedLayers) => {
    const activeLayers = selectedLayers.map((e) => {
      return {
        layerName: e.activeLayer,
        layerDateIndex: e.dateIndex
      }
    })
    const cleanLayers = layers.filter((e) => {
      if (
        activeLayers.findIndex(
          (d) => d.layerName === e.layerName && d.layerDateIndex === e.layerDateIndex
        ) >= 0
      ) {
        return false
      } else {
        return true
      }
    })
    const uniqueLayers = [...new Set(cleanLayers)]
    return uniqueLayers
  }

  const updateTimestamp = useCallback(
    (group: string, subGroup: string, dataTypeId: number, newValue: number) => {
      let updatedSelectedLayers = [...dataState.selectedLayers]
      const findCurrentSelectedLayerIdx = updatedSelectedLayers.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      let toBeRemovedLayers = [...dataState.toBeRemovedLayers]
      if (findCurrentSelectedLayerIdx >= 0) {
        const newSettings: LayerSettingsState = {
          ...updatedSelectedLayers[findCurrentSelectedLayerIdx]
        }
        toBeRemovedLayers.push({
          layerName: newSettings.activeLayer,
          layerDateIndex: newSettings.dateIndex
        })
        newSettings.dateIndex = newValue
        newSettings.activeLayer =
          newSettings.timestampsToFiles[newSettings.availableTimestamps[newSettings.dateIndex]]
        updatedSelectedLayers[findCurrentSelectedLayerIdx] = newSettings
        dispatch({
          type: 'TIMESTAMP',
          value: {
            selectedLayers: updatedSelectedLayers,
            toBeRemovedLayers: clearToBeRemovedLayers(toBeRemovedLayers, updatedSelectedLayers)
          }
        })
      }
    },
    [dataState]
  )

  const changePlayersPositionAndDimension = useCallback((players, defaultPos, defaultDim) => {
    const cnt = players.length
    let updatedPlayers = [...players]
    if (cnt === 1) {
      // set default position and width
      let onlyPlayer = { ...updatedPlayers[0] }
      onlyPlayer.position = defaultPos
      onlyPlayer.dimension = defaultDim
      updatedPlayers[0] = onlyPlayer
    } else if (cnt === 2) {
      // change y position of second element
      let first = players[0]
      first.dimension.w = defaultDim.w
      first.dimension.percW = defaultDim.percW
      first.position = defaultPos
      updatedPlayers[0] = first
      let lastPlayer = { ...updatedPlayers[cnt - 1] }
      lastPlayer.position.x = defaultPos.x
      lastPlayer.dimension.percW = defaultDim.percW
      lastPlayer.position.y = defaultPos.y - defaultDim.h - 2
      lastPlayer.dimension.w = defaultDim.w
      updatedPlayers[cnt - 1] = lastPlayer
    } else if (cnt === 3) {
      // change x and y position of second element
      // change 7 position of third element
      // change dimension of all three elements
      let percWidth = 'calc(50% - 3px)'
      let midWidth = defaultDim.w / 2 - 2
      let first = players[0]
      first.dimension.w = midWidth
      first.dimension.percW = percWidth
      first.position = defaultPos
      updatedPlayers[0] = first
      let second = players[1]
      second.dimension.w = midWidth
      second.dimension.percW = percWidth
      second.position.x = defaultPos.x + midWidth + 4
      second.position.y = defaultPos.y
      updatedPlayers[1] = second
      let third = players[2]
      third.dimension.w = midWidth
      third.dimension.percW = percWidth
      third.position.x = defaultPos.x
      third.position.y = defaultPos.y - defaultDim.h - 2
      updatedPlayers[2] = third
    } else if (cnt === 4) {
      // change x and y position of forth  element
      // change dimension of forth elements
      let percWidth = 'calc(50% - 3px)'
      let midWidth = defaultDim.w / 2 - 2
      let first = players[0]
      first.dimension.w = midWidth
      first.dimension.percW = percWidth
      first.position = defaultPos
      updatedPlayers[0] = first
      let second = players[1]
      second.dimension.w = midWidth
      second.dimension.percW = percWidth
      second.position.x = defaultPos.x + midWidth + 4
      second.position.y = defaultPos.y
      updatedPlayers[1] = second
      let third = players[2]
      third.dimension.w = midWidth
      third.dimension.percW = percWidth
      third.position.x = defaultPos.x
      third.position.y = defaultPos.y - defaultDim.h - 2
      updatedPlayers[2] = third
      let forth = players[3]
      forth.dimension.w = midWidth
      forth.dimension.percW = percWidth
      forth.position.x = defaultPos.x + midWidth + 4
      forth.position.y = defaultPos.y - defaultDim.h - 2
      updatedPlayers[3] = forth
    }

    return updatedPlayers
  }, [])

  const updateSelectedLayers = useCallback(
    (group: string, subGroup: string, dataTypeId: number, newValue: number) => {
      const currentLayer = dataState.groupedLayers[group][subGroup][dataTypeId]
      let updatedSettings: GroupLayerState
      let toBeRemovedLayers: any[] = []
      let updateLegends = [...dataState.layersLegend]
      let updateMetadata = [...dataState.layersMetadata]
      let updateTimeseries = { ...dataState.layerTimeseries }
      let updateFeatureInfo = { ...dataState.layerFeatureInfo }
      if (currentLayer) {
        let newSettings: LayerSettingsState = { ...currentLayer }
        let updatedSelectedLayers = [...dataState.selectedLayers]
        newSettings.isChecked = !!newValue
        newSettings.activeLayer = newSettings.isChecked
          ? currentLayer.timestampsToFiles[currentLayer.availableTimestamps[currentLayer.dateIndex]]
          : ''
        if (newSettings.isChecked) {
          newSettings.activeLayer =
            currentLayer.timestampsToFiles[currentLayer.availableTimestamps[currentLayer.dateIndex]]
          updatedSelectedLayers.push(newSettings)
        } else {
          const findToDeselectedLayerIdx = updatedSelectedLayers.findIndex(
            (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
          )
          if (findToDeselectedLayerIdx >= 0) {
            const activeLayerToRemove = updatedSelectedLayers[findToDeselectedLayerIdx]
            toBeRemovedLayers.push({
              layerName: activeLayerToRemove.activeLayer,
              layerDateIndex: activeLayerToRemove.dateIndex
            })
            if (findToDeselectedLayerIdx === updatedSelectedLayers.length - 1) {
              // if layer removed is last one, make sure to remove timeseries as well
              updateTimeseries = null
            }
            updatedSelectedLayers.splice(findToDeselectedLayerIdx, 1)
          }
          // remove legend
          const findLegendIdx = updateLegends.findIndex(
            (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
          )
          if (findLegendIdx >= 0) {
            updateLegends.splice(findLegendIdx, 1)
          }
          // remove metadata
          const findMetadataIdx = updateMetadata.findIndex(
            (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
          )
          if (findMetadataIdx >= 0) {
            updateMetadata.splice(findMetadataIdx, 1)
          }
          // remove feature info if no layers are selected
          if (updatedSelectedLayers.length < 1) {
            updateFeatureInfo = null
          }
        }
        const defaultPos = { ...dataState.defaultPosition }
        const defaultDim = { ...dataState.defaultDimension }
        let changedSelectedLayers = changePlayersPositionAndDimension(
          updatedSelectedLayers,
          defaultPos,
          defaultDim
        )
        updatedSettings = { ...dataState.groupedLayers }
        updatedSettings[group][subGroup][dataTypeId] = newSettings
        dispatch({
          type: 'UPDATE_SELECTED_LAYERS',
          value: {
            groupedLayers: updatedSettings,
            selectedLayers: changedSelectedLayers,
            toBeRemovedLayers: clearToBeRemovedLayers(toBeRemovedLayers, changedSelectedLayers),
            layersLegend: updateLegends,
            layersMetadata: updateMetadata,
            layerTimeseries: updateTimeseries,
            layerFeatureInfo: updateFeatureInfo
          }
        })
      }
    },
    [dataState]
  )

  const updateSelectedLayersFromMapRequest = useCallback(
    (newMRSettings, newDateIndex?: number) => {
      let updatedSelectedLayers = [...dataState.selectedLayers]
      let updateLegends = [...dataState.layersLegend]
      let updateMetadata = [...dataState.layersMetadata]
      let updateTimeseries = { ...dataState.layerTimeseries }
      let updateFeatureInfo = { ...dataState.layerFeatureInfo }
      let toBeRemovedLayers: any[] = [...dataState.toBeRemovedLayers]
      let newSettings: LayerSettingsState = { ...newMRSettings }
      newSettings.group = 'Map Request Layer'
      newSettings.subGroup = newMRSettings.mapRequestCode
      newSettings.dimension = { ...dataState.defaultDimension }
      const group = newSettings.group
      const subGroup = newSettings.subGroup
      const dataTypeId = newSettings.dataTypeId
      if (newSettings.isChecked) {
        if (newSettings.activeLayer != '') {
          toBeRemovedLayers.push({
            layerName: newSettings.activeLayer,
            layerDateIndex: newSettings.dateIndex
          })
        }
        if (newDateIndex) {
          newSettings.dateIndex = newDateIndex
        }
        newSettings.activeLayer =
          newSettings.timestampsToFiles[newSettings.availableTimestamps[newSettings.dateIndex]]
        const findSelectedLayerIdx = updatedSelectedLayers.findIndex(
          (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
        )
        if (findSelectedLayerIdx >= 0) {
          updatedSelectedLayers[findSelectedLayerIdx] = newSettings
        } else {
          updatedSelectedLayers.push(newSettings)
        }
      } else {
        const findToDeselectedLayerIdx = updatedSelectedLayers.findIndex(
          (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
        )
        if (findToDeselectedLayerIdx >= 0) {
          const activeLayerToRemove = updatedSelectedLayers[findToDeselectedLayerIdx]
          toBeRemovedLayers.push({
            layerName: activeLayerToRemove.activeLayer,
            layerDateIndex: activeLayerToRemove.dateIndex
          })
          if (findToDeselectedLayerIdx === updatedSelectedLayers.length - 1) {
            // if layer removed is last one, make sure to remove timeseries as well
            updateTimeseries = null
          }
          updatedSelectedLayers.splice(findToDeselectedLayerIdx, 1)
          // remove legend
          const findLegendIdx = updateLegends.findIndex(
            (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
          )
          if (findLegendIdx >= 0) {
            updateLegends.splice(findLegendIdx, 1)
          }
          // remove metadata
          const findMetadataIdx = updateMetadata.findIndex(
            (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
          )
          if (findMetadataIdx >= 0) {
            updateMetadata.splice(findMetadataIdx, 1)
          }
          // remove feature info if no layers are selected
          if (updatedSelectedLayers.length < 1) {
            updateFeatureInfo = null
          }
        }
      }
      dispatch({
        type: 'UPDATE_SELECTED_LAYERS_FROM_MAP_REQUEST',
        value: {
          selectedLayers: updatedSelectedLayers,
          toBeRemovedLayers: toBeRemovedLayers,
          layersLegend: updateLegends,
          layersMetadata: updateMetadata,
          layerTimeseries: updateTimeseries,
          layerFeatureInfo: updateFeatureInfo
        }
      })
    },
    [dataState]
  )

  const updateLayerPlayerPosition = useCallback(
    (x, y, group, subGroup, dataTypeId) => {
      let updatedSelectedLayers = [...dataState.selectedLayers]
      const findToDeselectedLayerIdx = updatedSelectedLayers.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      let toBeUpdated = { ...updatedSelectedLayers[findToDeselectedLayerIdx] }
      toBeUpdated.position = { x, y }
      updatedSelectedLayers[findToDeselectedLayerIdx] = toBeUpdated
      const defaultPos = { ...dataState.defaultPosition }
      const defaultDim = { ...dataState.defaultDimension }
      let changedSelectedLayers = changePlayersPositionAndDimension(
        updatedSelectedLayers,
        defaultPos,
        defaultDim
      )
      dispatch({
        type: 'UPDATE_LAYER_PLAYER',
        value: changedSelectedLayers
      })
    },
    [dataState]
  )

  const getMetaData = useCallback(
    (
      metaId,
      group,
      subGroup,
      dataTypeId,
      layerName,
      transformData = () => {},
      windowInnerWidth
    ) => {
      let updatedMetadata = dataState.layersMetadata
      const findMetaIdx = updatedMetadata.findIndex(
        (e) =>
          e.group === group &&
          e.subGroup === subGroup &&
          e.dataTypeId === dataTypeId &&
          e.metadataId === metaId
      )
      if (findMetaIdx >= 0) {
        updatedMetadata[findMetaIdx].visibility = true
        dispatch({ type: 'UPDATE_LAYERS_METADATA', value: updatedMetadata })
      } else {
        layersApiFactory
          .layersGetMetadata(metaId, {
            headers: {
              'Accept-Language': i18n.language
            }
          })
          .then((result) => {
            const formattedres = transformData(result)
            let updatedMetadata = dataState.layersMetadata
            const findMetaIdx = updatedMetadata.findIndex(
              (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
            )
            if (findMetaIdx >= 0) {
              updatedMetadata[findMetaIdx].metadataId = metaId
              updatedMetadata[findMetaIdx].metadata = formattedres
            } else {
              updatedMetadata.push({
                group: group,
                subGroup: subGroup,
                dataTypeId: dataTypeId,
                layerName: layerName,
                metadataId: metaId,
                metadata: formattedres,
                visibility: true,
                position: { x: windowInnerWidth - 500 - 230, y: 60 }
              })
            }
            dispatch({ type: 'UPDATE_LAYERS_METADATA', value: updatedMetadata })
          })
      }
    },
    [layersApiFactory, dataState]
  )

  const updateLayerMetadataVisibility = useCallback(
    (visibility, group, subGroup, dataTypeId) => {
      let updatedMetadata = dataState.layersMetadata
      const findMetaIdx = updatedMetadata.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      updatedMetadata[findMetaIdx].visibility = visibility
      dispatch({ type: 'UPDATE_LAYERS_METADATA', value: updatedMetadata })
    },
    [dataState]
  )

  const updateLayerMetadataPosition = useCallback(
    (x, y, group, subGroup, dataTypeId) => {
      let updatedMetadata = dataState.layersMetadata
      const findMetaIdx = updatedMetadata.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      updatedMetadata[findMetaIdx].position = { x: x, y: y }
      dispatch({ type: 'UPDATE_LAYERS_METADATA', value: updatedMetadata })
    },
    [dataState]
  )

  const getLegend = useCallback(
    (
      geoServerConfig,
      activeLayerName,
      group,
      subGroup,
      dataTypeId,
      layerName,
      windowInnerWidth
    ) => {
      let updatedLegends = dataState.layersLegend
      const findLegendIdx = updatedLegends.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      if (findLegendIdx >= 0) {
        updatedLegends[findLegendIdx].visibility = true
        dispatch({ type: 'UPDATE_LAYERS_LEGEND', value: updatedLegends })
      } else {
        fetch(getLegendURL(geoServerConfig, '40', '40', activeLayerName)).then((result) => {
          result.blob().then((blobRes) => {
            const imgUrl = URL.createObjectURL(blobRes)
            updatedLegends.push({
              group: group,
              subGroup: subGroup,
              dataTypeId: dataTypeId,
              layerName: layerName,
              legend: imgUrl,
              visibility: true,
              position: { x: windowInnerWidth - 109 - 741, y: 60 }
            })
            dispatch({ type: 'UPDATE_LAYERS_LEGEND', value: updatedLegends })
          })
        })
      }
    },
    [dataState]
  )

  const updateLayerLegendPosition = useCallback(
    (x, y, group, subGroup, dataTypeId) => {
      let updatedLegends = dataState.layersLegend
      const findLegendIdx = updatedLegends.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      updatedLegends[findLegendIdx].position = { x: x, y: y }
      dispatch({ type: 'UPDATE_LAYERS_LEGEND', value: updatedLegends })
    },
    [dataState]
  )

  const updateLayerLegendVisibility = useCallback(
    (visibility, group, subGroup, dataTypeId) => {
      let updatedLegends = dataState.layersLegend
      const findLegendIdx = updatedLegends.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      updatedLegends[findLegendIdx].visibility = visibility
      dispatch({ type: 'UPDATE_LAYERS_LEGEND', value: updatedLegends })
    },
    [dataState]
  )

  const addLayerTimeseries = useCallback(
    (coordinates: [number, number], clickedLayer) => {
      dispatch({
        type: 'UPDATE_LAYER_TIMESERIES',
        value: {
          showCard: true,
          coord: coordinates,
          selectedLayer: clickedLayer
        }
      })
    },
    [dataState]
  )

  const closeLayerTimeseries = useCallback(() => {
    dispatch({
      type: 'UPDATE_LAYER_TIMESERIES',
      value: null
    })
  }, [dataState])

  const addLayerFeatureInfo = useCallback(
    (geoServerConfig, w, h, mapBounds, windowInnerWidth) => {
      const selectedLayers = [...dataState.selectedLayers]
      const layerNames = selectedLayers.map((e) => e.name + ' | ' + e.subGroup)
      let unitOfMeasures: string[] = []
      let requestPromises: any[] = []
      for (let i = 0; i < selectedLayers.length; i++) {
        const currentLayer = selectedLayers[i]
        const activeLayer = currentLayer.activeLayer
        const currentTimestamp = currentLayer.availableTimestamps[currentLayer.dateIndex]
        const featInfoPromise = new Promise((resolve, reject) => {
          resolve(
            fetch(
              getFeatureInfoUrl(geoServerConfig, w, h, activeLayer, currentTimestamp, mapBounds)
            )
          )
        })
        requestPromises.push(featInfoPromise)
        unitOfMeasures.push(currentLayer.unitOfMeasure)

        // associated layers
        if (currentLayer.associatedLayers && currentLayer.associatedLayers.length > 0) {
          for (let associatedLayer of currentLayer.associatedLayers) {
            const assActiveLayer =
              associatedLayer.timestampsToFiles[
                associatedLayer.availableTimestamps[currentLayer.dateIndex]
              ]
            const assCurrentTimestamp = associatedLayer.availableTimestamps[currentLayer.dateIndex]
            const childLayerPromise = new Promise((resolve, reject) => {
              resolve(
                fetch(
                  getFeatureInfoUrl(
                    geoServerConfig,
                    w,
                    h,
                    assActiveLayer,
                    assCurrentTimestamp,
                    mapBounds
                  )
                )
              )
            })
            requestPromises.push(childLayerPromise)
            unitOfMeasures.push(currentLayer.unitOfMeasure)
          }
        }
      }

      Promise.all(requestPromises)
        .then((response) => Promise.all(response.map((r) => r.json())))
        .then((result) => {
          const mappedFeatureInfo: LayerFeatureInfoState[] = []
          for (let i = 0; i < result.length; i++) {
            const res = result[i]
            const featInfo = new LayerFeatureInfo(
              res.features,
              res.totalFeatures,
              res.numberReturned,
              res.timestatmp,
              res.crs
            )

            let allFeat: any[] = []
            for (let j = 0; j < featInfo.features.length; j++) {
              const feat = featInfo.features[j]
              const property = feat.properties
              const parseJSON = (feat.id!! as string).includes('36004') ? true : false
              const featureInfo = Object.keys(property!!).map((e) => {
                if (parseJSON) {
                  const impact = new ImpactFeatureInfoValue(property!![e])
                  return new FeatureInfo(e, impact.strAllImpacts)
                } else {
                  const rounded =
                    property!![e] !== 0 && property!![e] % 1 > 0
                      ? property!![e].toFixed(2)
                      : property!![e]
                  const roundedWithUnitOfMeasure = unitOfMeasures[i]
                    ? rounded + unitOfMeasures[i]
                    : rounded
                  return new FeatureInfo(e, roundedWithUnitOfMeasure)
                }
              })
              allFeat.push(featureInfo)
            }

            const layerFeatureInfo = new LayerFeatureInfoState(layerNames[i], allFeat)
            mappedFeatureInfo.push(layerFeatureInfo)
          }
          dispatch({
            type: 'UPDATE_LAYER_FEATURE_INFO',
            value: {
              featureInfo: mappedFeatureInfo,
              layers: selectedLayers,
              visibility: true,
              position: { x: windowInnerWidth - 109 - 741, y: 60 },
              error: false
            }
          })
        })
        .catch((err) => {
          console.debug(err)
          dispatch({
            type: 'UPDATE_LAYER_FEATURE_INFO',
            value: {
              featureInfo: null,
              layers: selectedLayers,
              visibility: true,
              position: { x: windowInnerWidth - 109 - 741, y: 60 },
              error: true
            }
          })
        })
    },
    [dataState]
  )

  const updateLayerFeatureInfoPosition = useCallback(
    (x, y) => {
      let updatedFeatureInfo = dataState.layerFeatureInfo
      updatedFeatureInfo.position = { x: x, y: y }
      dispatch({ type: 'UPDATE_LAYER_FEATURE_INFO', value: updatedFeatureInfo })
    },
    [dataState]
  )

  const updateLayerFeatureInfoVisibility = useCallback(
    (visibility) => {
      let updatedFeatureInfo = dataState.layerFeatureInfo
      updatedFeatureInfo.visibility = visibility
      dispatch({ type: 'UPDATE_LAYER_FEATURE_INFO', value: updatedFeatureInfo })
    },
    [dataState]
  )

  return [
    dataState,
    fetchLayers,
    changeOpacity,
    updateTimestamp,
    updateSelectedLayers,
    updateLayerPlayerPosition,
    getMetaData,
    updateLayerMetadataPosition,
    updateLayerMetadataVisibility,
    getLegend,
    updateLayerLegendPosition,
    updateLayerLegendVisibility,
    updateDefaultPosAndDim,
    addLayerTimeseries,
    closeLayerTimeseries,
    addLayerFeatureInfo,
    updateLayerFeatureInfoPosition,
    updateLayerFeatureInfoVisibility,
    updateSelectedLayersFromMapRequest
  ]
}

export default useMapLayers
