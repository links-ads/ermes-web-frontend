import React, { useState, useEffect, useReducer, useContext, useMemo, useCallback } from 'react'
import { MapContainer } from './common.components'
import { MapLayout } from './map-layout.component'
import { CulturalProps } from './provisional-data/cultural.component'
import { MapStateContextProvider } from './map.context'
import GetApiGeoJson from '../../../hooks/get-apigeojson.hook'
import useActivitiesList from '../../../hooks/use-activities.hook'
import MapDrawer from './map-drawer/map-drawer.component'
import { Spiderifier } from '../../../utils/map-spiderifier.utils'
import { AppConfig, AppConfigContext } from '../../../config'
import useAPIHandler from '../../../hooks/use-api-handler'
import { useAPIConfiguration } from '../../../hooks/api-hooks'

import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import LayersPlayer from './map-player/player.component'
import { PlayerLegend } from './map-popup-legend.component'
import { useTranslation } from 'react-i18next'
import MapTimeSeries from './map-popup-series.component'

import { getLegendURL } from '../../../utils/map.utils'
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
type MapFeature = CulturalProps

const NO_LAYER_SELECTED = '-1'

export function Map() {
  // translate library
  // const { t } = useTranslation(['common', 'labels'])
  const [fakeKey, forceUpdate] = useReducer((x) => x + 1, 0)
  // toggle variable for te type filter tab
  const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState<boolean>(false)
  const [layersSelectVisibility, setLayersSelectVisibility] = useState<boolean>(false)
  const [togglePlayer, setTogglePlayer] = useState<boolean>(false)

  const [isLayersPanelVisible, setIsLayersPanelVisible] = useState<boolean>(false)

  const [toggleLegend, setToggleLegend] = useState<boolean>(false)
  const [toggleMeta, setToggleMeta] = useState<boolean>(false)
  const [dateIndex, setDateIndex] = useState<number>(0)
  const { i18n } = useTranslation()
  const [layerName, setLayerName] = useState<string>('')

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
            break
          case 'TIMESTAMP':
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
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])

  const [layerSelection, setLayerSelection] = React.useState({
    isMapRequest: NO_LAYER_SELECTED,
    mapRequestCode: NO_LAYER_SELECTED,
    dataTypeId: NO_LAYER_SELECTED,
    multipleLayersAllowed: false,
    layerClicked: null
  })

  const [selectedLayer, setSelectedLayer] = useState<LayerSettingsState>()
  const [layersSettings, setLayersSettings] = useState<GroupLayerState>({})
  const updateLayersSetting = (
    group: string,
    subGroup: string,
    dataTypeId: number,
    newValue: number,
    actionType: string
  ) => {
    if (!layersSettings) return
    const currentLayer = layersSettings[group][subGroup][dataTypeId]
    let updatedSettings: GroupLayerState
    if (currentLayer) {
      let newSettings: LayerSettingsState = { ...currentLayer }
      if (currentLayer) {
        switch (actionType) {
          case 'OPACITY':
            newSettings.opacity = newValue
            break
          case 'TIMESTAMP':
            newSettings.dateIndex = newValue
            if (currentLayer.activeLayer !== '')
              newSettings.toBeRemovedLayer = currentLayer.activeLayer
            newSettings.activeLayer =
              currentLayer.timestampsToFiles[
                currentLayer.availableTimestamps[newSettings.dateIndex]
              ]
            break
          case 'ISCHECKED':
            Object.keys(layersSettings).forEach((group) => {
              Object.keys(layersSettings[group]).forEach((subGroup) => {
                Object.keys(layersSettings[group][subGroup]).forEach((dataTypeId) => {
                  layersSettings[group][subGroup][dataTypeId].isChecked = false
                })
              })
            })
            newSettings.isChecked = !!newValue
            newSettings.toBeRemovedLayer = selectedLayer ? selectedLayer.activeLayer : ''
            newSettings.activeLayer = newSettings.isChecked
              ? currentLayer.timestampsToFiles[
                  currentLayer.availableTimestamps[currentLayer.dateIndex]
                ]
              : ''

            break
          default:
            break
        }

        setSelectedLayer(newSettings)
        updatedSettings = { ...layersSettings }
        updatedSettings[group][subGroup][dataTypeId] = newSettings
        setLayersSettings(updatedSettings)
      }
    }
  }

  const [getLayersState, handleGetLayersCall] = useAPIHandler(false)
  const [dblClickFeatures, setDblClickFeatures] = useState<any | null>(null)

  const [legendSrc, setLegendSrc] = useState<string | undefined>(undefined)
  const [legendLayer, setLegendLayer] = useState('')
  const [metaLayer, setMetaLayer] = useState('')

  useEffect(() => {
    let groupLayersState = new GroupLayerState()
    if (Object.keys(getLayersState.result).length === 0) return
    if (!getLayersState.result.data['layerGroups']) return

    getLayersState.result.data['layerGroups'].forEach((group) => {
      let subGroupLayerState = new SubGroupLayerState()
      group['subGroups'].forEach((subGroup) => {
        let layerState = new LayerState()
        subGroup['layers']
          .filter((a) => a['frequency'] !== 'OnDemand')
          .forEach((layer) => {
            let layerSettingState = new LayerSettingsState(
              group.group,
              subGroup.subGroup,
              layer.dataTypeId,
              layer.name,
              layer.format,
              layer.frequency,
              layer.type,
              layer.unitOfMeasure
            )
            layer.details!.forEach((detail) => {
              layerSettingState.metadataId = detail.metadata_Id
              let timestamps: string[] = [...layerSettingState.availableTimestamps]
              detail.timestamps!.forEach((timestamp) => {
                layerSettingState.timestampsToFiles[timestamp] = detail.name!
                timestamps.push(timestamp)
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
            layerState[layer.dataTypeId] = layerSettingState
          })
        if (Object.keys(layerState).length > 0)
          subGroupLayerState[subGroup['subGroup']] = layerState
      })
      if (Object.keys(subGroupLayerState).length > 0)
        groupLayersState[group['group']] = subGroupLayerState
    })

    if (getLayersState.result.data['associatedLayers']) {
      getLayersState.result.data['associatedLayers'].forEach((assLayer) => {
        let parent = groupLayersState[assLayer.group][assLayer.subGroup][assLayer.parentDataTypeId]
        parent.associatedLayers.push(
          new AssociatedLayer(assLayer.dataTypeId, assLayer.name, parent.dataTypeId, parent.name)
        )
      })
    }

    setLayersSettings(groupLayersState)
  }, [getLayersState])

  const { data: activitiesList } = useActivitiesList()
  // Retrieve json data, and the function to make the call to filter by date
  const [prepGeoData, fetchGeoJson, downloadGeoJson] = GetApiGeoJson()

  const teamsApiFactory = useMemo(() => TeamsApiFactory(backendAPIConfig), [backendAPIConfig])
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
  }, [fetchGeoJson, handleGetLayersCall, layersApiFactory])

  useEffect(() => {
    setLayerSelection({
      isMapRequest: NO_LAYER_SELECTED,
      mapRequestCode: NO_LAYER_SELECTED,
      dataTypeId: NO_LAYER_SELECTED,
      multipleLayersAllowed: false,
      layerClicked: null
    })
    handleGetLayersCall(() => {
      return layersApiFactory.layersGetLayers(
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
    })
    updateMapFeatures()
    forceUpdate()
  }, [filtersObj, fetchGeoJson, handleGetLayersCall, layersApiFactory])

  useEffect(() => {
    setDateIndex(0)
    if (layerSelection.multipleLayersAllowed) return
    if (layerSelection.isMapRequest !== NO_LAYER_SELECTED) {
      setTogglePlayer(true)
    } else {
      setTogglePlayer(false)
    }
  }, [layerSelection])

  const [layersSelectContainerPosition, setLayersSelectContainerPosition] = useState<
    PixelPostion | undefined
  >(undefined)
  const [layersPlayerPosition, setLayersPlayerPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined)
  const [floatingFilterContainerPosition, setFloatingFilterContainerPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined)
  const [layersLegendPosition, setLayersLegendPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined)

  const floatingFilterContainerDefaultCoord = useMemo<{ x: number; y: number }>(() => {
    return { x: 60, y: 60 }
  }, [])
  const layersPlayerDefaultCoord = useMemo<{ x: number; y: number }>(() => {
    return { x: 60, y: Math.max(90, window.innerHeight - 350) }
  }, [])
  const layersSelectContainerDefaultCoord = useMemo<{ x: number; y: number }>(() => {
    return { x: 60, y: Math.max(120, window.innerHeight - 300 - 450) }
  }, [])

  const mapTimeSeriesContainerDefaultCoord = useMemo<{ x: number; y: number }>(() => {
    return { x: Math.max(400, window.innerWidth - 600), y: 60 }
  }, [])

  const [mapTimeSeriesContainerPosition, setMapTimeSeriesContainerPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined)
  const [layersMetaPosition, setLayersMetaPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined)
  const [layerMeta, setLayerMeta] = useState<any[] | undefined>([])

  const [singleLayerOpacityStatus, handleOpacityChange] = useState<[number, string]>([100, ''])

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

      if (togglePlayer) {
        if (layersPlayerPosition == undefined)
          setLayersPlayerPosition({ x: 470, y: layersPlayerDefaultCoord.y })
        else if (layersPlayerPosition!.x < 450)
          setLayersPlayerPosition({ x: 470, y: layersPlayerPosition!.y })
      }

      if (toggleActiveFilterTab) {
        if (floatingFilterContainerPosition == undefined)
          setFloatingFilterContainerPosition({ x: 470, y: floatingFilterContainerDefaultCoord.y })
        else if (floatingFilterContainerPosition!.x < 450)
          setFloatingFilterContainerPosition({ x: 470, y: floatingFilterContainerPosition!.y })
      }
    } else {
      //setPlayersDefaultCoord({x:90, y:layersPlayerDefaultCoord.y})
    }
  }, [toggleSideDrawer])

  useMemo(() => {
    if (toggleSideDrawer) {
      if (layersSelectVisibility) {
        //layers container is visible, move it
        //opening drawer
        if (layersSelectContainerPosition == undefined)
          setLayersSelectContainerPosition({ x: 470, y: layersSelectContainerDefaultCoord.y })
        else if (layersSelectContainerPosition!.x < 450)
          setLayersSelectContainerPosition({ x: 470, y: layersSelectContainerPosition!.y })
      }

      if (togglePlayer) {
        if (layersPlayerPosition == undefined)
          setLayersPlayerPosition({ x: 470, y: layersPlayerDefaultCoord.y })
        else if (layersPlayerPosition!.x < 450)
          setLayersPlayerPosition({ x: 470, y: layersPlayerPosition!.y })
      }

      if (toggleActiveFilterTab) {
        if (floatingFilterContainerPosition == undefined)
          setFloatingFilterContainerPosition({ x: 470, y: floatingFilterContainerDefaultCoord.y })
        else if (floatingFilterContainerPosition!.x < 450)
          setFloatingFilterContainerPosition({ x: 470, y: floatingFilterContainerPosition!.y })
      }
    } else {
      //setPlayersDefaultCoord({x:90, y:layersPlayerDefaultCoord.y})
    }
  }, [toggleSideDrawer])

  /**
   *
   * @param value
   * @param metadataId
   * @param layerName
   */
  function changePlayer(value, metadataId, layerName) {
    setLayerName(layerName)
    if (toggleLegend) {
      setLegendLayer(value)
    }
    if (toggleMeta) {
      setMetaLayer(metadataId)
    }
  }

  /**
   * close the mappopupseries component when we change layer
   */
  useMemo(() => {
    setDblClickFeatures(null)
  }, [layerName])

  useMemo(() => {
    if (legendLayer) {
      getLegend(legendLayer)
    }
  }, [legendLayer])

  useMemo(() => {
    if (metaLayer) {
      getMeta(metaLayer)
    }
  }, [metaLayer])

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

  function showImage(responseAsBlob) {
    const imgUrl = URL.createObjectURL(responseAsBlob)
    setLegendSrc(imgUrl)
    setToggleLegend(true)
  }
  async function getLegend(layerName: string) {
    const geoServerConfig = appConfig.geoServer
    const res = await fetch(getLegendURL(geoServerConfig, '40', '40', layerName))
    showImage(await res.blob())
  }

  /**
   * called when metadata button is clicked
   * @param metaId the metadataid of the layer to display data of
   */
  function getMeta(metaId: string) {
    layersApiFactory
      .layersGetMetadata(metaId, {
        headers: {
          'Accept-Language': i18n.language
        }
      })
      .then((result) => {
        const formattedres = formatMeta(result)
        setLayerMeta(formattedres)
        setToggleMeta(true)
      })
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
          setDateIndex={setDateIndex}
          dateIndex={dateIndex}
          getLegend={getLegend}
          getMeta={getMeta}
          forceUpdate={forceUpdate}
          teamList={teamList}
          onPlayerChange={changePlayer}
          handleOpacityChange={handleOpacityChange}
          fetchGeoJson={fetchGeoJson}
          mapRequestsSettings={mapRequestsSettings}
          updateMapRequestsSettings={updateMapRequestsSettings}
          setMapRequestsSettings={setMapRequestsSettings}
          availableLayers={getLayersState?.result.data}
          communicationCounter={communicationCounter}
          missionCounter={missionCounter}
          mapRequestCounter={mapRequestCounter}
          resetListCounter={resetListCounter}
        />
        <MapContainer initialHeight={window.innerHeight - 112} style={{ height: '110%' }}>
          <LayersPlayer
            visibility={togglePlayer}
            setVisibility={setTogglePlayer}
            position={layersPlayerPosition}
            onPositionChange={setLayersPlayerPosition}
            getLegend={getLegend}
            getMeta={getMeta}
            map={map}
            selectedLayer={selectedLayer}
            updateLayersSetting={updateLayersSetting}
          />

          <PlayerLegend
            visibility={toggleLegend}
            defaultPosition={{ x: window.innerWidth - 200, y: 60 }}
            position={layersLegendPosition}
            onPositionChange={setLayersLegendPosition}
            setVisibility={setToggleLegend}
            imgSrc={legendSrc}
          />

          <PlayerMetadata
            visibility={toggleMeta}
            defaultPosition={{ x: window.innerWidth - 850, y: 60 }}
            position={layersMetaPosition}
            onPositionChange={setLayersMetaPosition}
            setVisibility={setToggleMeta}
            layerData={layerMeta}
          />

          {dblClickFeatures && dblClickFeatures.showCard && (
            <MapTimeSeries
              dblClickFeatures={dblClickFeatures}
              setDblClickFeatures={setDblClickFeatures}
              defaultPosition={mapTimeSeriesContainerDefaultCoord}
              position={mapTimeSeriesContainerPosition}
              onPositionChange={setMapTimeSeriesContainerPosition}
              selectedFilters={filtersObj?.filters}
              selectedLayer={selectedLayer}
            />
          )}

          <LayersFloatingPanel
            layerGroups={layersSettings}
            isVisible={isLayersPanelVisible}
            setIsVisible={setIsLayersPanelVisible}
            isLoading={getLayersState.loading}
            setLayerSelection={setLayerSelection}
            updateLayersSetting={updateLayersSetting}
            map={map}
            selectedLayer={selectedLayer}
            position={layersSelectContainerPosition}
            setPosition={setLayersSelectContainerPosition}
          />

          <MapLayout
            toggleActiveFilterTab={toggleActiveFilterTab}
            setToggleActiveFilterTab={setToggleActiveFilterTab}
            layersSelectVisibility={layersSelectVisibility}
            setLayersSelectVisibility={setIsLayersPanelVisible}
            togglePlayer={togglePlayer}
            setTogglePlayer={setTogglePlayer}
            toggleDrawerTab={toggleSideDrawer}
            setToggleDrawerTab={setToggleSideDrawer}
            filterList={filterList}
            prepGeoJson={prepGeoData.data}
            isGeoJsonPrepared={!prepGeoData.isLoading}
            setMap={setMap}
            mapHoverState={mapHoverState}
            spiderLayerIds={spiderLayerIds}
            setSpiderLayerIds={setSpiderLayerIds}
            setSpiderifierRef={setSpiderifierRef}
            updateMapBounds={updateMapBounds}
            forceUpdate={forceUpdate}
            fetchGeoJson={fetchGeoJson}
            setDblClickFeatures={setDblClickFeatures}
            refreshList={refreshList}
            downloadGeojsonFeatureCollection={downloadGeojsonFeatureCollectionHandler}
            selectedLayer={selectedLayer}
            mapRequestsSettings={mapRequestsSettings}
          />

          {isGeoDataloading ? loader : undefined}
        </MapContainer>
      </MapStateContextProvider>
      {/* <MapSearchHere /> */}
    </>
  )
}
