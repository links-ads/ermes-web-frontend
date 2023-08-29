import { useCallback, useMemo, useReducer } from 'react'
import { useAPIConfiguration } from './api-hooks'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { GroupLayerState, LayerSettingsState } from '../models/layers/LayerState'

const initialState = {
  groupedLayers: [],
  selectedLayers: [],
  toBeRemovedLayer: '',
  layersMetadata: [],
  defaultPosition: { x: 0, y: 0 },
  defaultDimension: { h: 136, w: 1000 },
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
        selectedLayers: action.value.selectedLayers,
        toBeRemovedLayer: action.value.toBeRemovedLayer
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
    case 'DEFAULT_POSITION_AND_DIMENSION':
      return {
        ...currentState,
        defaultPosition: { ...action.value.defaultPosition },
        defaultDimension: { ...action.value.defaultDimension }
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

  const updateDefaultPosAndDim = useCallback(
    (y, w) => {
      dispatch({
        type: 'DEFAULT_POSITION_AND_DIMENSION',
        value: {
          defaultPosition: { x: dataState.defaultPosition.x, y: y },
          defaultDimension: { h: dataState.defaultDimension.h, w: w }
        }
      })
    },
    [dataState]
  )

  const changeOpacity = useCallback(
    (group: string, subGroup: string, dataTypeId: number, newValue: number) => {
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
    },
    [dataState]
  )

  const updateTimestamp = useCallback(
    (group: string, subGroup: string, dataTypeId: number, newValue: number) => {
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
    },
    [dataState]
  )

  const changePlayersPositionAndDimension = useCallback(
    (players) => {
      const cnt = players.length
      let updatedPlayers = [...players]
      const defaultDim = { ...dataState.defaultDimension }
      const defaultPos = { ...dataState.defaultPosition }
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
        first.position = defaultPos
        updatedPlayers[0] = first
        let lastPlayer = { ...updatedPlayers[cnt - 1] }
        lastPlayer.position.x = defaultPos.x
        lastPlayer.position.y = defaultPos.y - defaultDim.h - 5
        lastPlayer.dimension.w = defaultDim.w
        updatedPlayers[cnt - 1] = lastPlayer
      } else if (cnt === 3) {
        // change x and y position of second element
        // change 7 position of third element
        // change dimension of all three elements
        let midWidth = defaultDim.w / 2 - 2
        let first = players[0]
        first.dimension.w = midWidth
        updatedPlayers[0] = first
        let second = players[1]
        second.dimension.w = midWidth
        second.position.x = defaultPos.x + midWidth + 4
        second.position.y = defaultPos.y
        updatedPlayers[1] = second
        let third = players[2]
        third.dimension.w = midWidth
        third.position.y = defaultPos.y - defaultDim.h - 5
        updatedPlayers[2] = third
      } else if (cnt === 4) {
        // change x and y position of forth  element
        // change dimension of forth elements
        let midWidth = defaultDim.w / 2 - 2
        let first = players[0]
        first.dimension.w = midWidth
        updatedPlayers[0] = first
        let second = players[1]
        second.dimension.w = midWidth
        second.position.x = defaultPos.x + midWidth + 4
        second.position.y = defaultPos.y
        updatedPlayers[1] = second
        let third = players[2]
        third.dimension.w = midWidth
        third.position.y = defaultPos.y - defaultDim.h - 5
        updatedPlayers[2] = third
        let forth = players[3]
        forth.dimension.w = midWidth
        forth.position.x = defaultPos.x + midWidth + 4
        forth.position.y = defaultPos.y - defaultDim.h - 5
        updatedPlayers[3] = forth
      }

      return updatedPlayers
    },
    [dataState]
  )

  const updateSelectedLayers = useCallback(
    (group: string, subGroup: string, dataTypeId: number, newValue: number) => {
      const currentLayer = dataState.groupedLayers[group][subGroup][dataTypeId]
      let updatedSettings: GroupLayerState
      let toBeRemovedLayer = ''
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
          if (findToDeselectedLayerIdx >= 0) {
            toBeRemovedLayer = updatedSelectedLayers[findToDeselectedLayerIdx].activeLayer
            updatedSelectedLayers.splice(findToDeselectedLayerIdx, 1)
          }
        }
        let changedSelectedLayers = changePlayersPositionAndDimension(updatedSelectedLayers)
        updatedSettings = { ...dataState.groupedLayers }
        updatedSettings[group][subGroup][dataTypeId] = newSettings
        dispatch({
          type: 'UPDATE_SELECTED_LAYERS',
          value: {
            groupedLayers: updatedSettings,
            selectedLayers: changedSelectedLayers,
            toBeRemovedLayer: toBeRemovedLayer
          }
        })
      }
    },
    [dataState]
  )

  const updateLayerPlayerPosition = useCallback((x, y, group, subGroup, dataTypeId) => {
    let toBeUpdated = dataState.groupedLayers[group][subGroup][dataTypeId]
    toBeUpdated.position = { x, y }
    const updatedSettings = { ...dataState.groupedLayers }
    updatedSettings[group][subGroup][dataTypeId] = toBeUpdated
    // setLayersSettings(updatedSettings)
    dispatch({
      type: 'UPDATE_LAYER_PLAYER_POSITION',
      value: updatedSettings
    })
  }, [])

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
    getMetaData,
    updateDefaultPosAndDim
  ]
}

export default useMapLayers
