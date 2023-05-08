import React, { useRef, useState, useEffect, useCallback, useContext, useMemo } from 'react'

import { useMapPreferences } from '../../../../state/preferences/preferences.hooks'

import { Card, Slide } from '@material-ui/core'
import InteractiveMap, { Layer, Source, NavigationControl } from 'react-map-gl'
import { MapStyleToggle } from '../../map/map-style-toggle.component'
import {
  clearEventMap,
  DEFAULT_MAP_VIEWPORT,
  MapLoadingDiv,
  parseEventDataToGeoJson
} from '../../../../common/map/map-common'
import debounce from 'lodash.debounce'
import MapSlide from '../../../../common/map/map-popup-card'
import EventContent from '../card/event-card-content'
import { mapClickHandler } from './map-click-handler'
import {
  SOURCE_ID,
  CLUSTER_LAYER_ID,
  EVENTS_LAYER_ID,
  unclusteredPointsProps,
  SOURCE_PROPS,
  EVENTS_LAYER_PROPS,
  CLUSTER_LAYER_PROPS,
  updateHazardMarkers
} from './map-init'
import { mapOnLoadHandler } from '../../../../common/map/map-on-load-handler'
import { AppConfig, AppConfigContext } from '../../../../config'
import { MapHeadDrawer } from '../../../../common/map/map-drawer'
import { FilterButton } from '../../../../common/floating-filters-tab/filter-button.component'
import FloatingFilterContainer from '../../../../common/floating-filters-tab/floating-filter-container.component'
import { MapContainer } from '../../map/common.components';
import { getDefaultFilterArgs, getFilterObjFromFilters } from '../../../../utils/utils.common'
import mapboxgl from 'mapbox-gl'

const DEBOUNCE_TIME = 200 //ms

const EventMap = (props) => {
  const clusterMarkersRef = useRef<[object, object]>([{}, {}])

  const { mapTheme, apiKey, transformRequest, mapServerURL } = useMapPreferences()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const mapConfig = appConfig.mapboxgl
  const [mapViewport, setMapViewport] = useState(mapConfig?.mapViewport || DEFAULT_MAP_VIEWPORT)
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  })

  // Parse props
  const {mapRef,leftClickState,setLeftClickState,data} = props

  const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState(false)

  const filtersObj = useMemo(() => {
    return getFilterObjFromFilters(props.eventFilters, props.filtersState.mapIdsToHazards, props.filtersState.mapIdsToInfos, false)
  }, [props.eventFilters, props.filtersState])

  const initObj = useMemo(() => {
    return getFilterObjFromFilters(getDefaultFilterArgs(mapConfig), props.filtersState.mapIdsToHazards, props.filtersState.mapIdsToInfos, false)
  }, [props.filtersState,mapConfig])


  const updateMarkers = useCallback((map) => {
    if (map) {
      clusterMarkersRef.current = updateHazardMarkers(SOURCE_ID, clusterMarkersRef, map, true)
    }
  }, [])

  const updateMarkersDebounced = useCallback(
    debounce((map: mapboxgl.Map | undefined) => {
      updateMarkers(map)
    }, DEBOUNCE_TIME),
    []
  )

  const [floatingFilterContainerPosition, setFloatingFilterContainerPosition] = useState<{ x: number; y: number }| undefined>({x:50, y:55})
  const applyFilters = (filtersObj) => {
    props.filterObjApplyHandler(filtersObj)
    setToggleActiveFilterTab(false)
  }

  // update markers as soon as the hover state changes
  useEffect(() => {
    let map = mapRef?.current?.getMap()
    if (!map) return
    updateMarkers(map)
  }, [props.mapHoverState,mapRef, updateMarkers])

  useEffect(() => {
    let map = mapRef?.current?.getMap()
    if (map) {
      if(leftClickState.showPoint)
        clearEventMap(map, setLeftClickState, leftClickState)
    }
  }, [data, mapRef])


  useEffect(() => {
    setGeoJsonData(parseEventDataToGeoJson(data))
  }, [data])

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        minHeight: 400,
        position: 'relative'
      }}
    >
      <MapHeadDrawer
        mapRef={props.mapRef}
        filterApplyHandler={() => props.filterObjApplyHandler(filtersObj)}
        mapViewport={mapViewport}
        isLoading={props.isLoading}
      />
      <FloatingFilterContainer
        setToggleActiveFilterTab={setToggleActiveFilterTab}
        toggleActiveFilterTab={toggleActiveFilterTab}
        filtersObj={filtersObj}
        applyFiltersObj={applyFilters}
        initObj={initObj}
        onPositionChange={setFloatingFilterContainerPosition}
        position={floatingFilterContainerPosition}
      ></FloatingFilterContainer>
      <MapContainer>
        <MapLoadingDiv isLoading={props.isLoading} />
        <InteractiveMap
          {...mapViewport}
          width="100%"
          height="100%"
          mapStyle={mapTheme?.style}
          mapboxApiUrl={mapServerURL}
          mapboxApiAccessToken={apiKey}
          transformRequest={transformRequest}
          onViewportChange={(nextViewport) => setMapViewport(nextViewport)}
          ref={props.mapRef}
          interactiveLayerIds={[EVENTS_LAYER_ID, CLUSTER_LAYER_ID, ...props.spiderLayerIds]}
          onClick={(evt) =>
            mapClickHandler(evt, mapRef, leftClickState, setLeftClickState, props.spiderifierRef)
          }
          onLoad={() => {
            if (props.mapRef.current) {
              try {
                let map = props.mapRef?.current?.getMap()
                mapOnLoadHandler(
                  map,
                  props.spiderifierRef,
                  props.setSpiderLayerIds,
                  setMapViewport,
                  SOURCE_ID,
                  EVENTS_LAYER_ID,
                  unclusteredPointsProps,
                  EVENTS_LAYER_PROPS.type,
                  updateMarkersDebounced,
                  unclusteredPointsProps
                )
                // update map markers as soon as source data is loaded
                map.on('data', (e) => {
                  if (e.source?.type === 'geojson' && e.isSourceLoaded) {
                    updateMarkers(map)
                  }
                })
                map.fitBounds(
                  new mapboxgl.LngLatBounds(
                    props.eventFilters['southWest'],
                    props.eventFilters['northEast']
                  ),
                  {},
                  { how: 'fly' }
                )
              } catch (err) {
                console.error('Map Load Error', err)
              }
            }
          }}
        >
          <Source id={SOURCE_ID} data={geoJsonData} type="geojson" {...SOURCE_PROPS}>
            <Layer {...EVENTS_LAYER_PROPS} />
            <Layer {...CLUSTER_LAYER_PROPS} />
          </Source>
          <div className="controls-contaniner" style={{ top: '15%' }}>
            <NavigationControl />
          </div>
          <Slide
            direction="left"
            in={leftClickState.showPoint}
            mountOnEnter={true}
            unmountOnExit={true}
            timeout={800}
          >
            <MapSlide>
              <Card raised={false} style={{ width: '30%', float: 'right', minWidth: 300 }}>
                <EventContent
                  mapIdsToHazards={props.filtersState.mapIdsToHazards}
                  item={leftClickState.pointFeatures}
                  chipSize={'small'}
                  textSizes={{ title: 'body1', body: 'subtitle2' }}
                />
              </Card>
            </MapSlide>
          </Slide>
        </InteractiveMap>
        <FilterButton
          setToggleActiveFilterTab={setToggleActiveFilterTab}
          toggleActiveFilterTab={toggleActiveFilterTab}
        ></FilterButton>
      </MapContainer>
      {mapRef.current?.getMap() && (
        <MapStyleToggle
          mapViewRef={mapRef}
          spiderifierRef={props.spiderifierRef}
          onMapStyleChange={null}
          mapChangeSource={2}
          direction="right"
        ></MapStyleToggle>
      )}
    </div>
  )
}

export default EventMap
