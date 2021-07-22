import React, { useRef, useState, useEffect, useCallback, useContext, useMemo } from 'react'

import { useMapPreferences } from '../../../../state/preferences/preferences.hooks'

import { Card, CircularProgress, Grid, Slide } from '@material-ui/core'
import InteractiveMap, { Layer, Source } from 'react-map-gl'
import { MapStyleToggle } from '../../map/map-style-toggle.component'
import {
  clearEventMap,
  DEFAULT_MAP_VIEWPORT,
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
import { FiltersDescriptorType } from '../../../../common/floating-filters-tab/floating-filter.interface'

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

  /********* EDITING MAP FILTER TAB ***/
  const initObjectState = {
    tabs: 1,
    xystart: [60, 60],
    filters: {
      datestart: {
        selected: '2021-10-12',
        type: 'date',
        tab: 1
      },
      dateend: {
        selected: '2021-10-12',
        type: 'date',
        tab: 1,
        range: 4
      },
      hazard: {
        name: 'hazard', 
        options: ['fire', 'Alluvione'],
        type: 'multipleselect',
        selected: []
      },
      languages: {
        name: 'language', 
        options: ['italian', 'english'],
        type: 'multipleselect',
        selected: []
      },
      information: {
        name: 'Informatio bello ciao ', 
        options: ['tutto', 'Vero', 'Falso'],
        type: 'select',
        selected: ''
      }

    }
  } as FiltersDescriptorType

  const [filtersObj, setFiltersObj] = useState<FiltersDescriptorType | undefined>(initObjectState)
  const resetFiltersObj = () => {
    console.log(filtersObj)
    setFiltersObj({
      tabs: 1,
      xystart: [60, 60],
      filters: null
    })
    // setFiltersObj(initObjectState)
  }

  const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState(false)
  useEffect(() => {
    console.log('FILTER OBJECT', filtersObj)
  }, [filtersObj])
  /********* END EDITING MAP FILTER TAB ***/

  // update markers as soon as the hover state changes
  useEffect(() => {
    let map = props.mapRef?.current?.getMap()
    if (!map) return
    updateMarkers(map)
  }, [props.mapHoverState, updateMarkers])

  useEffect(() => {
    let map = props.mapRef?.current?.getMap()
    if (map) {
      clearEventMap(map, props.setLeftClickState, props.leftClickState)
      setGeoJsonData(parseEventDataToGeoJson(props.data))
    }
  }, [props.data, props.mapRef])

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '70vh',
        minHeight: 400,
        position: 'relative'
      }}
    >
      {props.isLoading && (
        <Grid
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            height: '90%',
            top: '10%',
            backgroundColor: 'black',
            opacity: 0.65
          }}
          container
          justify="center"
          alignItems="center"
        >
          <Grid item style={{ top: '40%', left: '40%' }}>
            <CircularProgress size={100} thickness={4} />
          </Grid>
        </Grid>
      )}
      <MapHeadDrawer
        mapRef={props.mapRef}
        filterApplyHandler={props.filterApplyHandler}
        mapViewport={mapViewport}
        isLoading={props.isLoading}
      />
      <FloatingFilterContainer
        toggleActiveFilterTab={toggleActiveFilterTab}
        filtersObj={filtersObj}
        setFiltersObj={setFiltersObj}
        resetFiltersObj={resetFiltersObj}
      ></FloatingFilterContainer>
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
          mapClickHandler(
            evt,
            props.mapRef,
            props.leftClickState,
            props.setLeftClickState,
            mapViewport
          )
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
        <Slide
          direction="left"
          in={props.leftClickState.showPoint}
          mountOnEnter={true}
          unmountOnExit={true}
          timeout={800}
        >
          <MapSlide>
            <Card raised={false}>
              <EventContent
                mapIdsToHazards={props.mapIdsToHazards}
                item={props.leftClickState.pointFeatures}
                chipSize={'small'}
                textSizes={{ title: 'body1', body: 'caption' }}
              />
            </Card>
          </MapSlide>
        </Slide>
      </InteractiveMap>
      <FilterButton
        setToggleActiveFilterTab={setToggleActiveFilterTab}
        toggleActiveFilterTab={toggleActiveFilterTab}
      ></FilterButton>
      {props.mapRef.current?.getMap() && (
        <MapStyleToggle
          mapViewRef={props.mapRef}
          spiderifierRef={props.spiderifierRef}
          direction="right"
        ></MapStyleToggle>
      )}
    </div>
  )
}

export default EventMap
