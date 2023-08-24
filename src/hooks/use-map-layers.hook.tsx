import { useCallback, useMemo, useReducer } from 'react'
import { useAPIConfiguration } from './api-hooks'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { GroupLayerState, LayerSettingsState } from '../models/layers/LayerState'

const initialState = {
  groupedLayers: [],
  selectedLayers: [],
  layersMetadata: [],
  isLoading: true,
  error: false
}

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'RESULT':
      return {
        ...currentState,
        isLoading: false,
        groupedLayers: action.value
      }
    case 'OPACITY':
      return {
        ...currentState,
        groupedLayers: action.value.groupedLayers,
        selectedLayers: action.value.selectedLayers
      }
    case 'TIMESTAMP':
      return {
        ...currentState,
        groupedLayers: action.value.groupedLayers,
        selectedLayers: action.value.selectedLayers
      }
    case 'UPDATE_SELECTED_LAYERS':
      return {
        ...currentState,
        groupedLayers: action.value.groupedLayers,
        selectedLayers: action.value.selectedLayers
      }
    case 'UPDATE_LAYER_PLAYER_POSITION':
      return {
        ...currentState,
        groupedLayers: action.value
      }
    case 'UPDATE_LAYERS_METADATA':
      return {
        ...currentState,
        layersMetadata: action.value
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
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])

  const fetchLayers = useCallback(
    (filtersObj, i18n, transformData = () => {}) => {
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
          dispatch({ type: 'RESULT', value: mappedResult })
        })
        .catch((err) => {
          dispatch({ type: 'ERROR', value: err })
        })
    },
    [layersApiFactory]
  )

  const changeOpacity = (group: string, subGroup: string, dataTypeId: number, newValue: number) => {
    const currentLayer = dataState.groupedLayers[group][subGroup][dataTypeId]
    let updatedSettings: GroupLayerState
    if (currentLayer) {
      let newSettings: LayerSettingsState = { ...currentLayer }
      let updatedSelectedLayers = [...dataState.selectedLayers]
      newSettings.opacity = newValue
      // TODO
      updatedSettings = { ...dataState.groupedLayers }
      updatedSettings[group][subGroup][dataTypeId] = newSettings
      // setLayersSettings(updatedSettings)
      dispatch({
        type: 'OPACITY',
        value: { groupedLayers: updatedSettings, selectedLayers: updatedSelectedLayers }
      })
      // TODO
    } else {
    }
  }

  const updateTimestamp = (
    group: string,
    subGroup: string,
    dataTypeId: number,
    newValue: number
  ) => {
    const currentLayer = dataState.groupedLayers[group][subGroup][dataTypeId]
    let updatedSettings: GroupLayerState
    if (currentLayer) {
      let newSettings: LayerSettingsState = { ...currentLayer }
      let updatedSelectedLayers = [...dataState.selectedLayers]
      newSettings.dateIndex = newValue
      if (currentLayer.activeLayer !== '') newSettings.toBeRemovedLayer = currentLayer.activeLayer
      newSettings.activeLayer =
        currentLayer.timestampsToFiles[currentLayer.availableTimestamps[newSettings.dateIndex]]
      const findSelectedLayerIdx = updatedSelectedLayers.findIndex(
        (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
      )
      if (findSelectedLayerIdx < 0) {
        updatedSelectedLayers.push(newSettings)
      } else {
        updatedSelectedLayers[findSelectedLayerIdx] = newSettings
      }
      // setSelectedLayers(updatedSelectedLayers)
      updatedSettings = { ...dataState.groupedLayers }
      updatedSettings[group][subGroup][dataTypeId] = newSettings
      dispatch({
        type: 'TIMESTAMP',
        value: { groupedLayers: updatedSettings, selectedLayers: updatedSelectedLayers }
      })
    }
  }

  const updateSelectedLayers = (
    group: string,
    subGroup: string,
    dataTypeId: number,
    newValue: number
  ) => {
    const currentLayer = dataState.groupedLayers[group][subGroup][dataTypeId]
    let updatedSettings: GroupLayerState
    if (currentLayer) {
      let newSettings: LayerSettingsState = { ...currentLayer }
      let updatedSelectedLayers = [...dataState.selectedLayers]
      newSettings.isChecked = !!newValue
      newSettings.activeLayer = newSettings.isChecked
        ? currentLayer.timestampsToFiles[currentLayer.availableTimestamps[currentLayer.dateIndex]]
        : ''
      if (newSettings.isChecked) {
        updatedSelectedLayers.push(newSettings)
      } else {
        const findToDeselectedLayerIdx = updatedSelectedLayers.findIndex(
          (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
        )
        updatedSelectedLayers = [...updatedSelectedLayers.splice(findToDeselectedLayerIdx, 1)] // TODO
      }
      updatedSettings = { ...dataState.groupedLayers }
      updatedSettings[group][subGroup][dataTypeId] = newSettings
      dispatch({
        type: 'TIMESTAMP',
        value: { groupedLayers: updatedSettings, selectedLayers: updatedSelectedLayers }
      })
    }
  }

  const updateLayerPlayerPosition = (x, y, group, subGroup, dataTypeId) => {
    let toBeUpdated = dataState.groupedLayers[group][subGroup][dataTypeId]
    toBeUpdated.position = { x, y }
    const updatedSettings = { ...dataState.groupedLayers }
    updatedSettings[group][subGroup][dataTypeId] = toBeUpdated
    // setLayersSettings(updatedSettings)
    dispatch({
      type: 'UPDATE_LAYER_PLAYER_POSITION',
      value: { groupedLayers: updatedSettings }
    })
  }

  const getMetaData = useCallback(
    (metaId, group, subGroup, dataTypeId, i18n, transformData = () => {}) => {
      layersApiFactory
        .layersGetMetadata(metaId, {
          headers: {
            'Accept-Language': i18n.language
          }
        })
        .then((result) => {
          const metadataLayer = dataState.groupedLayers[group][subGroup][dataTypeId]
          const formattedres = transformData(result)
          let updatedMetadata = dataState.layersMetadata
          const findMetaIdx = updatedMetadata.findIndex(
            (e) => e.group === group && e.subGroup === subGroup && e.dataTypeId === dataTypeId
          )
          if (findMetaIdx > 0) {
            updatedMetadata[findMetaIdx].metadata = formattedres
          } else {
            updatedMetadata.push({
              group: group,
              subGroup: subGroup,
              dataTypeId: dataTypeId,
              metadata: formattedres
            })
          }
          dispatch({ type: 'UPDATE_LAYERS_METADATA', value: updatedMetadata })
          // setLayerMeta(formattedres)
          // setToggleMeta(true)
        })
    },
    [layersApiFactory]
  )

  return [
    dataState,
    fetchLayers,
    changeOpacity,
    updateTimestamp,
    updateSelectedLayers,
    updateLayerPlayerPosition,
    getMetaData
  ]
}

export default useMapLayers
