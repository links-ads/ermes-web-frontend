import React, { useState, useEffect, useReducer, useContext, useMemo, useCallback } from 'react'
import { MapContainer } from './common.components'
import { MapLayout } from './map-layout.component'
import { CulturalProps } from './provisional-data/cultural.component'
import { MapStateContextProvider } from './map.context'
import GetApiGeoJson from '../../../hooks/get-apigeojson.hook'
import useActivitiesList from '../../../hooks/use-activities.hook'
import MapDrawer from './map-drawer/map-drawer.component'
import ViewCompactIcon from '@material-ui/icons/ViewCompact'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import useLanguage from '../../../hooks/use-language.hook'
import { Spiderifier } from '../../../utils/map-spiderifier.utils'
import { AppConfig, AppConfigContext } from '../../../config'
import useAPIHandler from '../../../hooks/use-api-handler'
import { useAPIConfiguration } from '../../../hooks/api-hooks'

import { GetLayersOutput, LayerDto, LayerSubGroupDto } from 'ermes-backoffice-ts-sdk'
import LayersPlayer from './map-player/player.component'
import { PlayerLegend } from './map-popup-legend.component'
import MapTimeSeries from './map-popup-series.component'

import { PlayerMetadata } from './map-popup-meta.component'
import { EntityType, TeamsApiFactory } from 'ermes-ts-sdk'
import MapRequestState, {
  MapRequestLayerSettingsState
} from '../../../models/mapRequest/MapRequestState'
import MapSearchHere from '../../../common/map/map-search-here'
import { FiltersContext } from '../../../state/filters.context'
import { CircularProgress } from '@material-ui/core'
import useInterval from '../../../hooks/use-interval.hook'
import {
  AssociatedLayer,
  GroupLayerState,
  LayerSettingsState,
  LayerState,
  SubGroupLayerState
} from '../../../models/layers/LayerState'
import LayersFloatingPanel from './map-layers/layers-floating-panel.component'
import { PixelPostion } from '../../../models/common/PixelPosition'
import useMapDrawer from '../../../hooks/use-map-drawer.hook'
import useMapLayers from '../../../hooks/use-map-layers.hook'
import { MapFeatureInfo } from './map-popup-feature-info.component'
import { removeLayerFromMap } from '../../../common/map/map-common'
import { CameraDetails } from './map-drawer/camera-details.component'
import { ErmesAxiosContext } from '../../../state/ermesaxios.context'
type MapFeature = CulturalProps

export function Map({
  dashboardMode = false,
  height = '100%',
  top
}: {
  dashboardMode?: boolean
  height?: string
  top?: string
}) {
  // translate library
  // const { t } = useTranslation(['common', 'labels'])
  const [fakeKey, forceUpdate] = useReducer((x) => x + 1, 0)
  // toggle variable for te type filter tab
  const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState<boolean>(false)
  const [dataState, updateTabIndex, selectTabCard, addCardToTabList, updateCardId] = useMapDrawer()

  const [isLayersPanelVisible, setIsLayersPanelVisible] = useState<boolean>(false)

  const [mapRequestsSettings, setMapRequestsSettings] = useState<MapRequestState>({})

  const updateMapRequestsSettings = (
    mrCode: string,
    dataTypeId: number,
    newValue: number,
    actionType: string
  ) => {
    if (!mapRequestsSettings) return
    const currentMr = mapRequestsSettings[mrCode]
    let updatedSettings: MapRequestState
    if (currentMr) {
      const currentLayer = currentMr[dataTypeId]
      let newSettings: MapRequestLayerSettingsState = { ...currentLayer }
      if (currentLayer) {
        switch (actionType) {
          case 'OPACITY':
            newSettings.opacity = newValue
            updateSelectedLayersFromMapRequest(newSettings)
            break
          case 'TIMESTAMP':
            updateSelectedLayersFromMapRequest(newSettings, newValue)
            newSettings.dateIndex = newValue
            if (currentLayer.activeLayer !== '')
              newSettings.toBeRemovedLayer = currentLayer.activeLayer
            newSettings.activeLayer =
              currentLayer.timestampsToFiles[
                currentLayer.availableTimestamps[newSettings.dateIndex]
              ]
            break
          case 'ISCHECKED':
            newSettings.isChecked = !!newValue
            newSettings.toBeRemovedLayer = currentLayer.activeLayer
            newSettings.activeLayer = newSettings.isChecked
              ? currentLayer.timestampsToFiles[
                  currentLayer.availableTimestamps[currentLayer.dateIndex]
                ]
              : ''
            updateSelectedLayersFromMapRequest(newSettings)
            break
          default:
            break
        }
        updatedSettings = { ...mapRequestsSettings }
        updatedSettings[mrCode][dataTypeId] = newSettings
        setMapRequestsSettings(updatedSettings)
      }
    }
  }

  const getFilterList = (obj) => {
    let newFilterList: Array<string> = []
    Object.keys((obj?.filters?.multicheckCategories as any).options).forEach((key) => {
      if ((obj?.filters?.multicheckCategories as any).options[key]) {
        newFilterList.push(key)
      }
    })
    Object.keys((obj?.filters?.multicheckPersons as any).options).forEach((key) => {
      if ((obj?.filters?.multicheckPersons as any).options[key]) {
        newFilterList.push(key)
      }
    })

    if (obj?.filters?.multicheckActivities) {
      Object.keys((obj?.filters?.multicheckActivities as any)?.options).forEach((key) => {
        if (obj?.filters?.multicheckActivities) {
          if ((obj?.filters?.multicheckActivities as any).options[key]) {
            newFilterList.push(key)
          }
        }
      })
    }
    return newFilterList
  }

  const filtersCtx = useContext(FiltersContext)
  const {
    localStorageFilters: filtersObj,
    filters,
    applyDate,
    applyFilters,
    updateActivities,
    updateMapBounds,
    updateTeamList,
    resetFilters
  } = filtersCtx

  const appConfig = useContext<AppConfig>(AppConfigContext)

  // set list of wanted type of emergencies (for filter)
  const [filterList, setFilterList] = useState<String[]>(getFilterList(filtersObj))

  // Toggle for the side drawer
  const [toggleSideDrawer, setToggleSideDrawer] = useState<boolean>(false)

  const [map, setMap] = useState(undefined)
  const [mapHoverState, setMapHoverState] = useState({ set: false })
  const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
  const [spiderifierRef, setSpiderifierRef] = useState<Spiderifier | null>(null)

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')

  const [
    layersState,
    fetchLayers,
    changeOpacity,
    updateTimestamp,
    updateSelectedLayers,
    updateLayerPlayerPosition,
    getMetaData,
    updateLayerMetadataPosition,
    updateLayerMetadataVisibility,
    getLayerLegend,
    updateLayerLegendPosition,
    updateLayerLegendVisibility,
    updateDefaultPosAndDim,
    addLayerTimeseries,
    closeLayerTimeseries,
    addLayerFeatureInfo,
    updateLayerFeatureInfoPosition,
    updateLayerFeatureInfoVisibility,
    updateSelectedLayersFromMapRequest
  ] = useMapLayers()
  const {
    rawLayers,
    groupedLayers,
    layersMetadata,
    layersLegend,
    selectedLayers,
    toBeRemovedLayers,
    defaultDimension,
    defaultPosition,
    layerTimeseries,
    layerFeatureInfo,
    isLoading
  } = layersState

  const { innerHeight, innerWidth } = window

  const { data: activitiesList } = useActivitiesList()
  // Retrieve json data, and the function to make the call to filter by date
  const [prepGeoData, fetchGeoJson, downloadGeoJson] = GetApiGeoJson()
  const backendUrl = backendAPIConfig.basePath!
  const {axiosInstance} = useContext(ErmesAxiosContext) 
  const teamsApiFactory = useMemo(() => TeamsApiFactory(backendAPIConfig, backendUrl, axiosInstance), [backendAPIConfig])
  const [teamsApiHandlerState, handleTeamsAPICall] = useAPIHandler(false)

  const [teamList, setTeamList] = useState<any>([])

  useEffect(() => {
    handleTeamsAPICall(() => {
      return teamsApiFactory.teamsGetTeams(1000)
    })
  }, [teamsApiFactory, handleTeamsAPICall])

  /**
   * when map loads, once the teams list is available check if there were already teams filters selected, if
   * so then use that to get proper features
   */
  useEffect(() => {
    let f: any = filtersObj?.filters?.persons
    //once the team list is available (ids are available)
    if (Object.keys(teamList).length > 0) {
      let selected = f.content[1].selected
      var arrayOfTeams: number[] = []
      if (!!selected && selected.length > 0) {
        for (let i = 0; i < selected.length; i++) {
          //if teams selected in filters have corresponcence with ids available
          let idFromContent = Number(
            !!getKeyByValue(teamList, selected[i]) ? getKeyByValue(teamList, selected[i]) : -1
          )
          //add them to array to use for new call
          if (idFromContent >= 0) arrayOfTeams.push(idFromContent)
        }
      }
      //if there are conditions for filtering, then call getfeatures again with the filter
      if (arrayOfTeams.length > 0) fetchGeoJson(arrayOfTeams)
    }
  }, [teamList])

  useEffect(() => {
    if (
      !teamsApiHandlerState.loading &&
      !!teamsApiHandlerState.result &&
      teamsApiHandlerState.result.data
    ) {
      //update team list
      let i = Object.fromEntries(
        teamsApiHandlerState.result.data.data.map((obj) => [obj['id'], obj['name']])
      )
      setTeamList(i)
      //update starting filter object with actual team names from http
      // const teamNamesList = Object.values(i)
      // updateTeamList(teamNamesList)
    }
  }, [teamsApiHandlerState])

  useEffect(() => {
    if (
      !filtersObj?.filters?.hasOwnProperty('multicheckActivities') &&
      filtersObj?.filters !== undefined &&
      filtersObj?.filters !== null &&
      activitiesList.length > 0
    ) {
      const activitiesObj = {}
      activitiesList.forEach((elem) => {
        activitiesObj[elem!.name!] = true
      })
      updateActivities(activitiesObj)
    }
  }, [activitiesList, filtersObj, updateActivities])

  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value)
  }

  /**
   * when filters are updated then update the map features to show
   */
  const updateMapFeatures = useCallback(() => {
    //when filters are applied use the ids[] of the selected teams in the fetchGeoJson call
    let f: any = filtersObj?.filters?.persons
    var arrayOfTeams: number[] | undefined = undefined
    if (Object.keys(teamList).length > 0) {
      let selected = f.content[1].selected
      arrayOfTeams = []
      //if selected exists and has some keys inside check if there are correspondences with the stored ids:keys values
      if (!!selected && selected.length > 0) {
        for (let i = 0; i < selected.length; i++) {
          let idFromContent = Number(
            !!getKeyByValue(teamList, selected[i]) ? getKeyByValue(teamList, selected[i]) : -1
          )
          if (idFromContent >= 0) arrayOfTeams.push(idFromContent)
        }
      }
      //if teams selections is empty reset arrayofteams to the default state (undefined)
      if (arrayOfTeams.length === 0) arrayOfTeams = undefined
    }
    fetchGeoJson(arrayOfTeams)
    const newFilterList = getFilterList(filtersObj)
    setFilterList(newFilterList)
    if (!toggleSideDrawer) {
      setToggleActiveFilterTab(false)
    }
    forceUpdate()
  }, [fetchGeoJson])

  useEffect(() => {
    fetchLayers(filtersObj, (result) => {
      const layerData: GetLayersOutput = result.data
      let groupLayersState = new GroupLayerState()
      layerData?.layerGroups?.forEach((group) => {
        let subGroupLayerState = new SubGroupLayerState()
        group?.subGroups?.forEach((subGroup: LayerSubGroupDto) => {
          let layerState = new LayerState()
          subGroup?.layers
            ?.filter((a) => a.frequency !== 'OnDemand')
            .forEach((layer: LayerDto) => {
              let layerSettingState = new LayerSettingsState(
                group.group!,
                subGroup.subGroup!,
                layer.dataTypeId!,
                layer.name!,
                layer.format!,
                layer.frequency!,
                layer.type!,
                layer.unitOfMeasure!,
                layersPlayerDefaultCoord.y,
                window.innerWidth
              )
              layer.details!.forEach((detail) => {
                let metadataId = detail.metadata_Id
                let timestamps: string[] = [...layerSettingState.availableTimestamps]
                detail.timestamps!.forEach((timestamp) => {
                  layerSettingState.timestampsToFiles[timestamp] = detail.name!
                  timestamps.push(timestamp)
                  layerSettingState.metadataIds[timestamp] = metadataId
                })
                //keep availableTimestamp sorted
                //use Set to ensure timestamps are unique inside the final array
                layerSettingState.availableTimestamps = Array.from(
                  new Set(
                    timestamps
                      .map((item) => {
                        return { dateString: item, dateValue: new Date(item) }
                      })
                      .sort((a, b) => (a.dateValue > b.dateValue ? 1 : -1))
                      .map((item) => item.dateString)
                  )
                )
              })
              layerState[layer.dataTypeId!] = layerSettingState
            })
          if (Object.keys(layerState).length > 0)
            subGroupLayerState[subGroup.subGroup!] = layerState
        })
        if (Object.keys(subGroupLayerState).length > 0)
          groupLayersState[group.group!] = subGroupLayerState
      })

      if (layerData.associatedLayers) {
        layerData.associatedLayers.forEach((assLayer) => {
          let parent =
            groupLayersState[assLayer.group!][assLayer.subGroup!][assLayer.parentDataTypeId!]
          let associatedLayer = new AssociatedLayer(
            assLayer.dataTypeId!,
            assLayer.name!,
            parent.dataTypeId,
            parent.name,
            assLayer.format!,
            assLayer.frequency!,
            assLayer.group!,
            assLayer.subGroup!,
            assLayer.order!,
            assLayer.type!
          )
          assLayer.details!.forEach((detail) => {
            let metadataId = detail.metadata_Id
            let timestamps: string[] = [...associatedLayer.availableTimestamps]
            detail.timestamps!.forEach((timestamp) => {
              associatedLayer.timestampsToFiles[timestamp] = detail.name!
              timestamps.push(timestamp)
              associatedLayer.metadataIds[timestamp] = metadataId
            })
            //keep availableTimestamp sorted
            //use Set to ensure timestamps are unique inside the final array
            associatedLayer.availableTimestamps = Array.from(
              new Set(
                timestamps
                  .map((item) => {
                    return { dateString: item, dateValue: new Date(item) }
                  })
                  .sort((a, b) => (a.dateValue > b.dateValue ? 1 : -1))
                  .map((item) => item.dateString)
              )
            )
          })
          parent.associatedLayers.push(associatedLayer)
        })
      }
      return groupLayersState
    })
    updateMapFeatures()
  }, [filtersObj, fetchGeoJson, fetchLayers])

  useEffect(() => {
    if (toBeRemovedLayers.length > 0) {
      for (let i = 0; i < toBeRemovedLayers.length; i++) {
        removeLayerFromMap(map, toBeRemovedLayers[i])
      }
    }
  }, [toBeRemovedLayers])

  useEffect(() => {
    if (defaultDimension.w !== innerWidth) {
      updateDefaultPosAndDim(innerHeight, innerWidth)
    }
  }, [innerHeight, innerWidth])

  const [layersSelectContainerPosition, setLayersSelectContainerPosition] = useState<
    PixelPostion | undefined
  >(undefined)
  const [floatingFilterContainerPosition, setFloatingFilterContainerPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined)

  const floatingFilterContainerDefaultCoord = useMemo<{ x: number; y: number }>(() => {
    return { x: 60, y: 60 }
  }, [])
  const layersPlayerDefaultCoord = useMemo<{ x: number; y: number }>(() => {
    return { x: 60, y: Math.max(90, window.innerHeight - 219) }
  }, [])
  const layersSelectContainerDefaultCoord = useMemo<{ x: number; y: number }>(() => {
    return { x: 60, y: 60 }
  }, [])

  const mapTimeSeriesContainerDefaultCoord = useMemo<{ x: number; y: number }>(() => {
    return { x: Math.max(400, window.innerWidth - 1420), y: 10 }
  }, [])

  const [mapTimeSeriesContainerPosition, setMapTimeSeriesContainerPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined)

  useEffect(() => {
    if (toggleSideDrawer) {
      if (isLayersPanelVisible) {
        //layers container is visible, move it
        //opening drawer
        if (!layersSelectContainerPosition)
          setLayersSelectContainerPosition(
            new PixelPostion(470, layersSelectContainerDefaultCoord.y)
          )
        else if (layersSelectContainerPosition!.x < 450)
          setLayersSelectContainerPosition(new PixelPostion(470, layersSelectContainerPosition!.y))
      }

      if (toggleActiveFilterTab) {
        if (floatingFilterContainerPosition == undefined)
          setFloatingFilterContainerPosition({ x: 470, y: floatingFilterContainerDefaultCoord.y })
        else if (floatingFilterContainerPosition!.x < 450)
          setFloatingFilterContainerPosition({ x: 470, y: floatingFilterContainerPosition!.y })
      }
    }
  }, [toggleSideDrawer, toggleActiveFilterTab])

  function formatMeta(result) {
    let res: [any, any] = ['', '']
    let data = result.data
    Object.keys(data).forEach(function (key) {
      if (data[key] == '' || data[key] == null) {
        return
      }
      if (data[key] !== undefined && data[key] !== null && typeof data[key] === 'object') {
        let innerres = ''
        Object.keys(data[key]).forEach(function (innerkey) {
          if (data[key][innerkey] == '' || data[key][innerkey] == null) {
            return
          }
          if (
            data[key][innerkey] !== undefined &&
            data[key][innerkey] !== null &&
            typeof data[key][innerkey] === 'object'
          ) {
            let innerinnerres = ''
            Object.keys(data[key][innerkey]).forEach(function (innerinnerkey) {
              if (
                data[key][innerkey][innerinnerkey] == '' ||
                data[key][innerkey][innerinnerkey] == null
              ) {
                return
              }
              innerinnerres += innerinnerkey + `: ` + data[key][innerkey][innerinnerkey] + `, \n`
            })
            innerres += innerinnerres
          } else innerres += innerkey + `: ` + data[key][innerkey] + `, \n`
        })
        res.push([key, innerres])
      } else res.push([key, '' + data[key]])
    })
    res.splice(0, 2)
    return res
  }

  const manageLayerLegend = (activeLayerName, group, subGroup, dataTypeId, layerName) => {
    getLayerLegend(
      appConfig.geoServer,
      activeLayerName,
      group,
      subGroup,
      dataTypeId,
      layerName,
      innerWidth
    )
  }

  const getLayerMeta = (
    metaId: string,
    group: string,
    subGroup: string,
    dataTypeId: number,
    layerName: string
  ) => {
    getMetaData(metaId, group, subGroup, dataTypeId, layerName, formatMeta, innerWidth)
  }

  const [communicationCounter, setCommunicationCounter] = useState(0)
  const [missionCounter, setMissionCounter] = useState(0)
  const [mapRequestCounter, setMapRequestCounter] = useState(0)
  const refreshList = (entityType: EntityType) => {
    let counter = 0
    switch (entityType) {
      case EntityType.COMMUNICATION:
        counter = communicationCounter + 1
        setCommunicationCounter(counter)
        break
      case EntityType.MISSION:
        counter = missionCounter + 1
        setMissionCounter(counter)
        break
      case EntityType.MAP_REQUEST:
        counter = mapRequestCounter + 1
        setMapRequestCounter(counter)
        break
      default:
        break
    }
  }

  const resetListCounter = (entityType: EntityType) => {
    switch (entityType) {
      case EntityType.COMMUNICATION:
        setCommunicationCounter(0)
        break
      case EntityType.MISSION:
        setMissionCounter(0)
        break
      case EntityType.MAP_REQUEST:
        setMapRequestCounter(0)
        break
      default:
        break
    }
  }

  // Download geojson
  const { downloadUrl } = prepGeoData.data

  useEffect(() => {
    if (downloadUrl && downloadUrl.length > 0) {
      // download geojson file
      window.location.href = downloadUrl
    }
  }, [downloadUrl])

  const downloadGeojsonFeatureCollectionHandler = () => {
    // teams - get team ids selected
    let selectedTeamIds: number[] = []
    let selectedTeams = (filtersObj?.filters?.persons as any).content[1].selected
    if (teamList && Object.keys(teamList).length > 0 && selectedTeams.length > 0) {
      selectedTeams.forEach((selectedTeam) => {
        let teamId = getKeyByValue(teamList, selectedTeam)
        if (teamId) {
          selectedTeamIds.push(Number(teamId))
        }
      })
    }
    // filters map
    // entities - get entity types selected (Communication, MapRequest, Mission, Report) except for 'ReportRequest'
    let selectedEntityTypes: string[] = []
    let entityOptions = (filtersObj?.filters?.multicheckCategories as any).options
    Object.keys(entityOptions).forEach((key) => {
      if (entityOptions[key] && key !== EntityType.REPORT_REQUEST) {
        selectedEntityTypes.push(key)
      }
    })
    // entity person - if any type of person status has been selected, add 'Person' to entity types
    let entityPersonOptions = (filtersObj?.filters?.multicheckPersons as any).options
    for (const key of Object.keys(entityPersonOptions)) {
      if (entityPersonOptions[key]) {
        selectedEntityTypes.push(EntityType.PERSON)
        break
      }
    }
    // activities - get ids if any activity has been selected
    let selectedActivityIds: number[] = []
    let entityActiviyOptions = (filtersObj?.filters?.multicheckActivities as any).options
    if (activitiesList.length > 0) {
      Object.keys(entityActiviyOptions).forEach((key) => {
        if (entityActiviyOptions[key]) {
          let selectedActivity = activitiesList.find((activity) => activity.name === key)
          if (selectedActivity && selectedActivity.id) {
            selectedActivityIds.push(selectedActivity.id)
          }
        }
      })
    }
    downloadGeoJson(selectedTeamIds, selectedEntityTypes, selectedActivityIds)
  }

  // Polling
  useInterval(() => {
    updateMapFeatures()
  }, appConfig.mapPollingInterval)

  const { isLoading: isGeoDataloading } = prepGeoData
  const loader = (
    <div className="full-screen centered">
      <CircularProgress size={120} />
    </div>
  )
  ///////
  return (
    <>
      <MapStateContextProvider<MapFeature>>
        <MapDrawer
          toggleSideDrawer={toggleSideDrawer}
          map={map}
          setMapHoverState={setMapHoverState}
          spiderLayerIds={spiderLayerIds}
          spiderifierRef={spiderifierRef}
          setToggleDrawerTab={setToggleSideDrawer}
          filtersObj={filtersObj}
          rerenderKey={fakeKey}
          getLegend={manageLayerLegend}
          getMeta={getLayerMeta}
          forceUpdate={forceUpdate}
          teamList={teamList}
          fetchGeoJson={fetchGeoJson}
          mapRequestsSettings={mapRequestsSettings}
          updateMapRequestsSettings={updateMapRequestsSettings}
          setMapRequestsSettings={setMapRequestsSettings}
          availableLayers={rawLayers}
          communicationCounter={communicationCounter}
          missionCounter={missionCounter}
          mapRequestCounter={mapRequestCounter}
          resetListCounter={resetListCounter}
          dataState={dataState}
          updateTabIndex={updateTabIndex}
          selectTabCard={selectTabCard}
          updateCardId={updateCardId}
        />
        <MapContainer initialHeight={window.innerHeight - 112} style={{ height, top }}>
          <div
            style={{
              width: toggleSideDrawer ? 'calc(100% - 450px)' : '100%',
              position: 'absolute',
              bottom: 0,
              left: toggleSideDrawer ? '450px' : '1px'
            }}
          >
            {selectedLayers &&
              selectedLayers.length > 0 &&
              selectedLayers
                .filter((e) => e.group !== 'Map Request Layer')
                .map((layer, idx) => (
                  <LayersPlayer
                    key={'layer-player-' + idx}
                    idx={idx}
                    cnt={selectedLayers.length}
                    updateLayerSelection={updateSelectedLayers}
                    onPositionChange={updateLayerPlayerPosition}
                    getLegend={manageLayerLegend}
                    getMeta={getLayerMeta}
                    map={map}
                    selectedLayer={layer}
                    toBeRemovedLayers={toBeRemovedLayers}
                    changeLayerOpacity={changeOpacity}
                    updateLayerTimestamp={updateTimestamp}
                    isDrawerOpen={toggleSideDrawer}
                  />
                ))}
          </div>

          {layersLegend &&
            layersLegend.length > 0 &&
            layersLegend.map((layerLegend, idx) => (
              <PlayerLegend
                key={'layer-legend-' + idx}
                legendData={layerLegend}
                defaultPosition={{ x: window.innerWidth - 200, y: 60 }}
                onPositionChange={updateLayerLegendPosition}
                updateVisibility={updateLayerLegendVisibility}
              />
            ))}

          {layersMetadata &&
            layersMetadata.length > 0 &&
            layersMetadata.map((layerMeta, idx) => (
              <PlayerMetadata
                key={'layer-metadata-' + idx}
                defaultPosition={{ x: window.innerWidth - 850, y: 60 }}
                onPositionChange={updateLayerMetadataPosition}
                updateVisibility={updateLayerMetadataVisibility}
                layerData={layerMeta}
              />
            ))}

          {layerTimeseries && layerTimeseries.showCard && (
            <MapTimeSeries
              layerTimeseries={layerTimeseries}
              closeLayerTimeseries={closeLayerTimeseries}
              defaultPosition={mapTimeSeriesContainerDefaultCoord}
              position={mapTimeSeriesContainerPosition}
              onPositionChange={setMapTimeSeriesContainerPosition}
              selectedFilters={filtersObj?.filters}
            />
          )}

          {layerFeatureInfo && (
            <MapFeatureInfo
              layerFeatureInfo={layerFeatureInfo}
              onPositionChange={updateLayerFeatureInfoPosition}
              updateVisibility={updateLayerFeatureInfoVisibility}
            />
          )}

          <LayersFloatingPanel
            layerGroups={groupedLayers}
            isVisible={isLayersPanelVisible}
            setIsVisible={setIsLayersPanelVisible}
            isLoading={isLoading}
            updateLayerSelection={updateSelectedLayers}
            map={map}
            selectedLayers={selectedLayers}
            position={layersSelectContainerPosition}
            setPosition={setLayersSelectContainerPosition}
            toBeRemovedLayers={toBeRemovedLayers}        
          />

          <MapLayout
            toggleActiveFilterTab={toggleActiveFilterTab}
            setToggleActiveFilterTab={setToggleActiveFilterTab}
            layersSelectVisibility={isLayersPanelVisible}
            setLayersSelectVisibility={setIsLayersPanelVisible}
            toggleDrawerTab={toggleSideDrawer}
            setToggleDrawerTab={setToggleSideDrawer}
            filterList={filterList}
            prepGeoJson={prepGeoData.data}
            isGeoJsonPrepared={!prepGeoData.isLoading}
            setMap={setMap}
            mapHoverState={mapHoverState}
            setMapHoverState={setMapHoverState}
            spiderLayerIds={spiderLayerIds}
            setSpiderLayerIds={setSpiderLayerIds}
            setSpiderifierRef={setSpiderifierRef}
            updateMapBounds={updateMapBounds}
            forceUpdate={forceUpdate}
            fetchGeoJson={fetchGeoJson}
            addLayerTimeseries={addLayerTimeseries}
            addLayerFeatureInfo={addLayerFeatureInfo}
            refreshList={refreshList}
            downloadGeojsonFeatureCollection={downloadGeojsonFeatureCollectionHandler}
            selectedLayers={selectedLayers}
            mapRequestsSettings={mapRequestsSettings}
            mapDrawerDataState={dataState}
            dashboardMode={dashboardMode}
          />

          {isGeoDataloading ? loader : undefined}
        </MapContainer>
      </MapStateContextProvider>
      {/* <MapSearchHere /> */}
      <CameraDetails />
    </>
  )
}
