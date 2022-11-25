import React, { useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useMapRequestList from '../../../../hooks/use-map-requests-list.hook'
import List from '@material-ui/core/List'
import ItemCounter from './item-counter'
import {
  CommunicationRestrictionType,
  LayerImportStatusType,
  MapRequestDto,
  MissionStatusType
} from 'ermes-ts-sdk'
import useDeleteMapRequest from '../../../../hooks/use-delete-map-request.hook'
import { CoordinatorType, DialogResponseType, useMapDialog } from '../map-dialog.hooks'
import useMapRequestById from '../../../../hooks/use-map-requests-by-id'
import SearchBar from '../../../../common/search-bar.component'
import classes from './map-drawer.module.scss'
import MapRequestCard from './drawer-cards/maprequest-card.component'
import MapRequestState, {
  LayerSettingsState,
  MapRequestLayerState
} from '../../../../models/mapRequest/MapRequestState'
import { LayerDto, LayerGroupDto, LayerSubGroupDto } from 'ermes-backoffice-ts-sdk'
import LayerDefinition from '../../../../models/layers/LayerDefinition'

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
}> = (props) => {
  const { t } = useTranslation(['common', 'maps'])

  const [searchText, setSearchText] = React.useState('')
  const [mapRequestsData, getMapRequestsData, applyFilterByText] = useMapRequestList()
  const {
    mapRequestsSettings,
    updateMapRequestsSettings,
    getMeta,
    getLegend,
    setMapRequestsSettings,
    availableLayers,
    layersDefinition
  } = props
  const [height, setHeight] = React.useState(window.innerHeight)

  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // handle the text changes in the search field
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  const searchInMiss = () => {
    if (searchText !== undefined) {
      applyFilterByText(searchText)
    }
  }

  // Calls the data only the first time is needed
  useEffect(() => {
    getMapRequestsData(
      0,
      (data: MapRequestDto[]) => {
        console.log(availableLayers)
        data.forEach((mr) => {
          var currentMr = mapRequestsSettings[mr.code!]
          let newMrLayerState = new MapRequestLayerState()
          if (!currentMr) {
            mr.mapRequestLayers!.map((layer) => {
              newMrLayerState[layer.layerDataTypeId!] = new LayerSettingsState(
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
        if (availableLayers)
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
                          settings = new LayerSettingsState(LayerImportStatusType.CREATED, [])
                        settings.name = layer.name!
                        settings.metadataId = detail.metadata_Id
                        settings.mapRequestCode = detail.mapRequestCode
                        settings.dataTypeId = layer.dataTypeId!
                        detail.timestamps!.forEach((timestamp) => {
                          settings.timestampsToFiles[timestamp] = detail.name!
                          settings.availableTimestamps.push(timestamp)
                        })
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
      }
    )
  }, [getMapRequestsData])
  const sFilter: string[] = props.filters.content.filter((e) => e.name === 'map_request_status')[0]
    .selected
  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })
  const [deletionState, deleteMapRequest] = useDeleteMapRequest()
  const [fetchingStateById, getMapRequestById] = useMapRequestById()
  const deleteRequest = (partnerName: string, id: string) => {
    let listTodelete: string[] = [partnerName + '.' + id]
    deleteMapRequest(listTodelete)
  }

  const fetchRequest = (id: string) => {
    getMapRequestById(
      id,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }
  const [copyState, setCopystate] = useState<any | null>(null)
  useEffect(() => {
    if (!!fetchingStateById.data.feature) {
      let fetchedArea = JSON.parse(fetchingStateById.data.feature.geometry)

      let ids: string[] = []
      if (fetchingStateById.data.feature.properties.mapRequestLayers.length > 0) {
        for (
          let i = 0;
          i < fetchingStateById.data.feature.properties.mapRequestLayers.length;
          i++
        ) {
          ids.push(
            fetchingStateById.data.feature.properties.mapRequestLayers[i].layerDataTypeId.toString()
          )
        }
      }
      const defaultEditState = {
        title: '',
        coordinatorType: CoordinatorType.NONE,
        orgId: -1,
        teamId: -1,
        userId: -1,
        startDate: !!fetchingStateById.data.feature.properties.duration.lowerBound
          ? new Date(fetchingStateById.data.feature.properties.duration.lowerBound)
          : new Date(),
        endDate: !!fetchingStateById.data.feature.properties.duration.upperBound
          ? new Date(fetchingStateById.data.feature.properties.duration.upperBound)
          : null,
        description: '',
        status: MissionStatusType.CREATED,
        frequency: !!fetchingStateById.data.feature.properties.frequency
          ? fetchingStateById.data.feature.properties.frequency
          : '0',
        dataType: ids.length > 0 ? ids : [],
        resolution: !!fetchingStateById.data.feature.properties.resolution
          ? fetchingStateById.data.feature.properties.resolution
          : '10',
        restrictionType: CommunicationRestrictionType.NONE,
        scope: null
      }
      setCopystate(defaultEditState)
      let areaObject = { type: 'Feature', properties: {}, geometry: fetchedArea }
      showFeaturesDialog('create', 'MapRequest', '', areaObject)
    }
  }, [fetchingStateById])

  const onFeatureDialogClose = useCallback(
    (status: DialogResponseType) => {
      console.debug('onFeatureDialogClose', status)
      // clearFeatureEdit()

      if (status === 'confirm') {
        console.log('onFeatureDialogClose [confirm]')
        props.fetchGeoJson(undefined)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const showFeaturesDialog = useMapDialog(onFeatureDialogClose, copyState)

  useEffect(() => {
    getMapRequestsData(
      0,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, [deletionState])

  return (
    <div className="container">
      <SearchBar
        isLoading={mapRequestsData.isLoading}
        changeTextHandler={handleSearchTextChange}
        clickHandler={searchInMiss}
      />
      {!mapRequestsData.isLoading ? (
        <div
          className={classes.fixHeightcontainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <ItemCounter
            itemCount={mapRequestsData.data.filter((e) => sFilter.includes(e.status)).length}
          />
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getMapRequestsData(
                  mapRequestsData.data.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={mapRequestsData.data.length}
              hasMore={
                mapRequestsData.data.length >=
                mapRequestsData.data.filter((e) => sFilter.includes(e.status)).length
                  ? false
                  : true
              }
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {mapRequestsData.data //sFilter is ['RequestSubmitted', 'ContentAvailable', 'ContentNotAvailable'], so it filters out the other statuses
                .filter((e) => sFilter.includes(e.status)) //use the filters to visualize the maprequests in side panel without having to open and close it
                .map((elem, i) => {
                  return (
                    <MapRequestCard
                      key={'map_request_card_' + i}
                      mapRequestInfo={elem}
                      setGoToCoord={props.setGoToCoord}
                      map={props.map}
                      setMapHoverState={props.setMapHoverState}
                      spiderLayerIds={props.spiderLayerIds}
                      spiderifierRef={props.spiderifierRef}
                      getLegend={getLegend}
                      getMeta={getMeta}
                      deleteRequest={deleteRequest}
                      fetchRequestById={fetchRequest}
                      mapRequestSettings={mapRequestsSettings[elem.code]}
                      updateMapRequestsSettings={updateMapRequestsSettings}
                    />
                  )
                })}
            </InfiniteScroll>
          </List>
        </div>
      ) : null}
    </div>
  )
}

export default MapRequestsPanel
