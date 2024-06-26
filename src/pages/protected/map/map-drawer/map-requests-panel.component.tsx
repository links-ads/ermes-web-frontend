import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useMapRequestList from '../../../../hooks/use-map-requests-list.hook'
import List from '@material-ui/core/List'
import {
  CommunicationRestrictionType,
  EntityType,
  LayerImportStatusType,
  MapRequestDto,
  MapRequestStatusType,
  MapRequestType
} from 'ermes-ts-sdk'
import { CoordinatorType } from '../map-dialog.hooks'
import classes from './map-drawer.module.scss'
import MapRequestCard from './drawer-cards/maprequest-card.component'
import MapRequestState, {
  MapRequestLayerSettingsState,
  MapRequestLayerState
} from '../../../../models/mapRequest/MapRequestState'
import { LayerDto, LayerGroupDto, LayerSubGroupDto } from 'ermes-backoffice-ts-sdk'
import LayerDefinition from '../../../../models/layers/LayerDefinition'
import { wktToGeoJSON } from '@terraformer/wkt'
import { getFeatureTypeAndIdFromCardId } from '../../../../hooks/use-map-drawer.hook'

const MapRequestsPanel: React.FC<{
  filters
  setGoToCoord
  map
  setMapHoverState
  spiderLayerIds
  spiderifierRef
  getLegend
  getMeta
  fetchGeoJson
  mapRequestsSettings: MapRequestState
  updateMapRequestsSettings
  setMapRequestsSettings
  availableLayers
  layersDefinition: LayerDefinition
  mapRequestCounter: number
  resetListCounter
  selectedCard
  setSelectedCard
  showFeaturesDialog
  selectedItemsList
  updateIsLoadingStatus
  searchText: string
  triggerSearch: boolean
  updateTriggerSearch
  updateItemsCounter
}> = (props) => {
  const {
    mapRequestsSettings,
    updateMapRequestsSettings,
    getMeta,
    getLegend,
    setMapRequestsSettings,
    availableLayers,
    layersDefinition,
    selectedCard,
    setSelectedCard,
    showFeaturesDialog,
    selectedItemsList,
    updateIsLoadingStatus,
    searchText,
    triggerSearch,
    updateTriggerSearch,
    updateItemsCounter
  } = props

  const { t } = useTranslation(['common', 'maps'])
  const [
    mapRequestsData,
    getMapRequestsData,
    applyFilterByText,
    deleteMapRequest,
    fetchMapRequestById,
    appendSelectedItems
  ] = useMapRequestList()
  const { isLoading, tot } = mapRequestsData

  const [height, setHeight] = React.useState(window.innerHeight)

  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  const fetchData = (initialize: boolean = false) => {
    getMapRequestsData(
      initialize ? 0 : mapRequestsData.data.length - mapRequestsData.selectedItems.length,
      (data: MapRequestDto[]) => {
        data.forEach((mr) => {
          var currentMr = mapRequestsSettings[mr.code!]
          let newMrLayerState = new MapRequestLayerState()
          if (!currentMr) {
            mr.mapRequestLayers!.map((layer) => {
              newMrLayerState[layer.layerDataTypeId!] = new MapRequestLayerSettingsState(
                layer.status!,
                layer.errorMessages!
              )
              newMrLayerState[layer.layerDataTypeId!].mapRequestCode = mr.code!
              newMrLayerState[layer.layerDataTypeId!].dataTypeId = layer.layerDataTypeId!
              if (layersDefinition)
                newMrLayerState[layer.layerDataTypeId!].name =
                  layersDefinition[layer.layerDataTypeId!]
            })
            mapRequestsSettings[mr.code!] = newMrLayerState
          }
        })

        //Merge the info from getLayers into map request
        if (availableLayers && availableLayers.layerGroups)
          availableLayers.layerGroups.forEach((group: LayerGroupDto) => {
            group.subGroups!.forEach((subGroup: LayerSubGroupDto) => {
              subGroup.layers!.forEach((layer: LayerDto) => {
                if (layer.frequency === 'OnDemand') {
                  layer.details!.forEach((detail) => {
                    if (detail.mapRequestCode) {
                      let currentLayer = mapRequestsSettings[detail.mapRequestCode]
                      if (currentLayer) {
                        let settings = currentLayer[layer.dataTypeId!]
                        if (!settings)
                          settings = new MapRequestLayerSettingsState(
                            LayerImportStatusType.CREATED,
                            []
                          )
                        settings.name = layer.name!
                        let metadataId = detail.metadata_Id
                        settings.mapRequestCode = detail.mapRequestCode
                        settings.dataTypeId = layer.dataTypeId!
                        let timestamps: string[] = [...settings.availableTimestamps]
                        detail.timestamps!.forEach((timestamp) => {
                          settings.timestampsToFiles[timestamp] = detail.name!
                          timestamps.push(timestamp)
                          settings.metadataIds[timestamp] = metadataId
                        })
                        //keep availableTimestamp sorted
                        //use Set to ensure timestamps are unique inside the final array
                        settings.availableTimestamps = Array.from(
                          new Set(
                            timestamps
                              .map((item) => {
                                return { dateString: item, dateValue: new Date(item) }
                              })
                              .sort((a, b) => (a.dateValue > b.dateValue ? 1 : -1))
                              .map((item) => item.dateString)
                          )
                        )
                      }
                    }
                  })
                }
              })
            })
          })
        setMapRequestsSettings(mapRequestsSettings)

        return data
      },
      {},
      (data) => {
        return data
      },
      initialize
    )
  }

  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  const deleteMR = (code: string, id: string) => {
    deleteMapRequest([code])
    // close popup card if the deleted map request is the one currently opened
    const [type, selectedId] = getFeatureTypeAndIdFromCardId(selectedCard)
    if (type === EntityType.MAP_REQUEST && selectedId === id) {
      setSelectedCard('')
    }
  }

  const fetchRequest = (id: string) => {
    fetchMapRequestById(
      id,
      (data) => {
        return data
      },
      (error) => {
        console.debug(error)
      },
      (data) => {
        return data
      }
    )
  }

  useEffect(() => {
    if (mapRequestsData.selectedMr && mapRequestsData.selectedMr.feature) {
      const mr = mapRequestsData.selectedMr
      let fetchedArea = JSON.parse(mr.feature.geometry)

      let ids: string[] = []
      if (mr.feature.properties.mapRequestLayers.length > 0) {
        for (let i = 0; i < mr.feature.properties.mapRequestLayers.length; i++) {
          ids.push(mr.feature.properties.mapRequestLayers[i].layerDataTypeId.toString())
        }
      }
      const defaultEditState = {
        title: '',
        coordinatorType: CoordinatorType.NONE,
        orgId: -1,
        teamId: -1,
        userId: -1,
        startDate: !!mr.feature.properties.duration.lowerBound
          ? new Date(mr.feature.properties.duration.lowerBound)
          : new Date(),
        endDate: !!mr.feature.properties.duration.upperBound
          ? new Date(mr.feature.properties.duration.upperBound)
          : null,
        description: '',
        status: MapRequestStatusType.REQUEST_SUBMITTED,
        frequency: !!mr.feature.properties.frequency ? mr.feature.properties.frequency : '0',
        dataType: ids.length > 0 ? ids : [],
        resolution: !!mr.feature.properties.resolution ? mr.feature.properties.resolution : '10',
        restrictionType: CommunicationRestrictionType.NONE,
        scope: null,
        type: !!mr.feature.properties.mapRequestType ? mr.feature.properties.mapRequestType : '',
        boundaryConditions:
          !!mr.feature.properties.mapRequestType &&
          mr.feature.properties.mapRequestType === MapRequestType.WILDFIRE_SIMULATION
            ? mr.feature.properties.boundaryConditions.map((e) => {
                const mappedFirebreak = e.fireBreak
                  ? {
                      [Object.keys(e.fireBreak)[0]]: e.fireBreakFullFeature
                        ? JSON.parse(Object.values(e.fireBreakFullFeature)[0] as string)
                        : (Object.values(e.fireBreak)[0] as string).startsWith('L')
                        ? wktToGeoJSON(Object.values(e.fireBreak)[0])
                        : JSON.parse(Object.values(e.fireBreak)[0] as string)
                    }
                  : null
                return {
                  ...e,
                  timeOffset: e.time,
                  fuelMoistureContent: e.moisture,
                  fireBreakType: mappedFirebreak
                }
              })
            : [],
        hoursOfProjection:
          !!mr.feature.properties.mapRequestType &&
          mr.feature.properties.mapRequestType === MapRequestType.WILDFIRE_SIMULATION
            ? mr.feature.properties.timeLimit
            : 1,
        simulationFireSpotting:
          !!mr.feature.properties.mapRequestType &&
          mr.feature.properties.mapRequestType === MapRequestType.WILDFIRE_SIMULATION
            ? mr.feature.properties.doSpotting
            : false,
        probabilityRange:
          !!mr.feature.properties.mapRequestType &&
          mr.feature.properties.mapRequestType === MapRequestType.WILDFIRE_SIMULATION
            ? mr.feature.properties.probabilityRange
            : 0.75,
        mapArea: !!mr.feature.properties.mapRequestType
          ? { type: 'Feature', properties: {}, geometry: fetchedArea }
          : null,
        mapSelectionCompleted: true
      }
      let areaObject = { type: 'Feature', properties: {}, geometry: fetchedArea }
      showFeaturesDialog('create', 'MapRequest', '', areaObject, defaultEditState)
    }
  }, [mapRequestsData.selectedMr])

  useEffect(() => {
    if (selectedItemsList.length > 0) {
      appendSelectedItems(selectedItemsList)
    }
  }, [selectedItemsList])

  // Calls the data only the first time is needed
  useEffect(() => {
    fetchData()
  }, [])

  //reload data when a new communication is created from the map
  useEffect(() => {
    if (props.mapRequestCounter > 0) {
      fetchData(true)
      props.resetListCounter(EntityType.MAP_REQUEST)
    }
  }, [props.mapRequestCounter])

  useEffect(() => {
    updateIsLoadingStatus(isLoading)
    if (!isLoading) {
      const counter = tot >= 0 ? tot : 0
      updateItemsCounter(counter)
    }
  }, [isLoading])

  useEffect(() => {
    if (triggerSearch) {
      applyFilterByText(searchText)
      updateTriggerSearch(false)
    }
  }, [triggerSearch])

  if (mapRequestsData.error) return <div></div>

  return (
    <div>
      {!isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 180 }}
        >
          <List component="span" aria-label="main mailbox folders">
            <InfiniteScroll
              next={fetchData}
              dataLength={mapRequestsData.data.length}
              hasMore={mapRequestsData.data.length < tot}
              loader={<h4 className={classes.textCenter}>{t('common:loading')}</h4>}
              endMessage={
                <div className={classes.textCenter}>
                  <b>{tot > 0 ? t('common:end_of_list') : t('common:no_items_found')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {mapRequestsData.data.map((elem, i) => (
                <MapRequestCard
                  key={elem.code}
                  mapRequestInfo={elem}
                  setGoToCoord={props.setGoToCoord}
                  map={props.map}
                  setMapHoverState={props.setMapHoverState}
                  spiderLayerIds={props.spiderLayerIds}
                  spiderifierRef={props.spiderifierRef}
                  getLegend={getLegend}
                  getMeta={getMeta}
                  deleteMR={deleteMR}
                  fetchRequestById={fetchRequest}
                  mapRequestSettings={mapRequestsSettings[elem.code]}
                  updateMapRequestsSettings={updateMapRequestsSettings}
                  selectedCard={selectedCard}
                  setSelectedCard={setSelectedCard}
                />
              ))}
            </InfiniteScroll>
          </List>
        </div>
      ) : (
        <h4 className={classes.textCenter}>{t('common:loading')}</h4>
      )}
    </div>
  )
}

export default MapRequestsPanel
