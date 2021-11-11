import React, { useState, useRef, useContext, useEffect, useCallback } from 'react'
import {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  InteractiveMap,
  PointerEvent
} from 'react-map-gl'
import { useMapPreferences } from '../../../state/preferences/preferences.hooks'
import { useTranslation } from 'react-i18next'
import { ContainerSize, ContainerSizeContext } from '../../../common/size-aware-container.component'

import bbox from '@turf/bbox'
import { BottomDrawerComponent } from './bottom-drawer.component'
import { AppConfig, AppConfigContext } from '../../../config'
import {
  emergencyClusterProperties,
  clusterLayer,
  unclusteredPointPinsPaint,
  unclusteredPointLayerPins,
  updateEmergencyMarkers,
  hoveredPointPin
} from './api-data/emergency.layers'
import debounce from 'lodash.debounce'
import { Spiderifier } from '../../../utils/map-spiderifier.utils'
import { EmergencyHoverPopup, EmergencyDetailsCard } from './api-data/emergency.popups'
import { ContextMenu } from './context-menu.component'
import { DialogResponseType, useMapDialog } from './map-dialog.hooks'
import { MapDraw, MapDrawRefProps } from './map-draw.components'
import { useMapStateContext, ItemWithLatLng, ProvisionalFeatureType } from './map.contest'
import {
  onMapLoadHandler,
  onMouseEnterHandler,
  onMouseLeaveHandler,
  onMapLeftClickHandler,
  onMapRightClickHandler
} from './map-event-handlers'
import { DrawerToggle } from './map-drawer/drawer-toggle.component'
import { FilterButton } from '../../../common/floating-filters-tab/filter-button.component'
import { MapStyleToggle } from './map-style-toggle.component'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import mapboxgl from 'mapbox-gl'
import { EmergencyProps, EmergencyColorMap } from './api-data/emergency.component'
import { MapHeadDrawer } from '../../../common/map/map-drawer'
import { drawPolyToMap, removePolyToMap } from '../../../common/map/map-common'
import { getMapBounds, getMapZoom } from '../../../common/map/map-common'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { makeStyles } from '@material-ui/styles'
import { Box, Collapse, createStyles, Fab, IconButton } from '@material-ui/core'
import SpeedDial from '@material-ui/lab/SpeedDial'
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon'
import InfoIcon from '@material-ui/icons/Info'
import { LayersButton } from './map-layers/layers-button.component'
import { tileJSONIfy } from '../../../utils/map.utils'
import { NO_LAYER_SELECTED } from './map-layers/layers-select.component'
// Style for the geolocation controls
const geolocateStyle: React.CSSProperties = {
  position: 'absolute',
  top: 45,
  left: 0,
  margin: 10
}

// Click Radius (see react-map-gl)
const CLICK_RADIUS = 4

// Zoom level after which clustering is disabled 1 = world, 24 = max detail
const MAX_CLUSTER_ZOOM = 16
//https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/#geojson-clusterRadius
const CLUSTER_RADIUS = 128

const SOURCE_ID = 'emergency-source'
const GEOJSON_LAYER_IDS = ['clusters', 'unclustered-point']

// Debounce time for marker update (avoid recomputation)
// TODO check if memoization is more efficient
const DEBOUNCE_TIME = 200 // ms

const useStyles = makeStyles(() =>
  createStyles({
    fab: { position: 'absolute', bottom: '25px', right: '15px', zIndex: 99 },
    legend_container: {
      zIndex: 98,
      position: 'absolute',
      bottom: 20,
      right: 10
    },
    legend_row: {
      height: 30
    },
    legend_dot: {
      width: 20,
      height: 20,
      display: 'inline-block',
      borderRadius: '50%',
      verticalAlign: 'middle',
      marginTop: '-3px'
    },
    legend_text: {
      display: 'inline-block'
    }
  })
)

export function MapLayout(props) {
  const classes = useStyles()
  const [jsonData, setJsonData] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  })
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const geoServerConfig = appConfig.geoServer
  // const convData FeatureCollection<geometry,
  // Container size
  const containerSize = useContext<ContainerSize>(ContainerSizeContext)
  // Used to hide-show functionalities
  const { isMobileDevice } = useContext(AppConfigContext)
  // Translation
  const { t } = useTranslation(['maps', 'labels'])
  // Preferences
  const { mapTheme, transformRequest } = useMapPreferences()
  // Map view ref
  const mapViewRef = useRef<InteractiveMap>(null)
  // uncomment the following only if we want to get position automatically
  // however this is against most ux guidelines and may be blocked by some browser
  // const geolocationControlsRef = useRef(null)

  // GeoJSON source Ref
  const geoJSONPointsSourceRef = useRef(null)

  // Cluster markers
  const clusterMarkersRef = useRef<[object, object]>([{}, {}])
  // Spiderifier
  const spiderifierRef = useRef<Spiderifier | null>(null)

  // MapDraw
  const mapDrawRef = useRef<MapDrawRefProps>(null)

  // Snackbars
  const { displayMessage, displayWarningSnackbar } = useSnackbars()

  // Legend toggle
  const [legendToggle, setLegendToggle] = useState(false)

  // Map state
  const [
    {
      mapMode,
      viewport,
      clickedPoint,
      hoveredPoint,
      rightClickedPoint,
      editingFeatureArea,
      editingFeatureType,
      editingFeatureId
    },
    {
      setMapMode,
      setViewport,
      setClickedPoint,
      setHoveredPoint,
      setRightClickedPoint,
      startFeatureEdit,
      clearFeatureEdit
    }
  ] = useMapStateContext<EmergencyProps>()

  // Guided procedure dialog
  const onFeatureDialogClose = useCallback(
    (status: DialogResponseType) => {
      console.debug('onFeatureDialogClose', status)
      clearFeatureEdit()
      mapDrawRef.current?.deleteFeatures(0) // remove polygon if any
      if (status == 'confirm') {
        props.fetchGeoJson()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Display wizard or confirm dialog for features
  const showFeaturesDialog = useMapDialog(onFeatureDialogClose)

  // Variable checked to draw polygons to the map
  const [polyToMap, setPolyToMap] = useState<undefined | { feature }>(undefined)

  const [mapTileId,setMapTileId] = useState<string|null>(null)

  useEffect(() => {
    const map = mapViewRef.current?.getMap()!
    if (props.selectedLayerId !== NO_LAYER_SELECTED) {
      const debugIndex = 0
      const layerProps = props.layerId2Tiles[props.selectedLayerId]
      const layerName = layerProps['names'][debugIndex]
      const source = tileJSONIfy(map,layerName,layerProps['timestamps'][debugIndex],geoServerConfig,map.getBounds())
      if(mapTileId !== null)
      {
        map.removeLayer(mapTileId)
        map.removeSource(mapTileId)
      }
      map.addSource(layerName,source as mapboxgl.RasterSource )
      map.addLayer(
        {
          id: layerName,
          type: 'raster',
          source: layerName
        },
        'clusters'
      );
      setMapTileId(layerName)
    }
    else
    {
      if(mapTileId !== null)
      {
        map.removeLayer(mapTileId)
        map.removeSource(mapTileId)
        setMapTileId(null)
      }
    }
  }, [props.selectedLayerId])

  useEffect(
    () => {
      if (editingFeatureType !== null) {
        const operation = editingFeatureId === null ? 'create' : 'update'
        if (editingFeatureType === 'Report') {
          showFeaturesDialog(
            operation,
            editingFeatureType,
            editingFeatureId ? editingFeatureId + '' : ''
          )
        } else {
          if (editingFeatureArea) {
            showFeaturesDialog(
              operation,
              editingFeatureType,
              editingFeatureId ? editingFeatureId + '' : '',
              editingFeatureArea
            )
          } else {
            // TODO change cursor
            // const map = mapViewRef.current?.getMap()
            // if (map) {
            //   // possible values https://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
            //   map.getCanvas().style.cursor = 'cell'
            // }
            displayMessage(t('maps:draw_polygon_msg'))
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingFeatureType, editingFeatureId, editingFeatureArea]
  )

  const updateMarkers = (map) => {
    if (map) {
      clusterMarkersRef.current = updateEmergencyMarkers(SOURCE_ID, clusterMarkersRef, map, true)
    }
  }

  // Update markers on map
  const updateMarkersDebounced = useCallback(
    debounce((map: mapboxgl.Map | undefined) => {
      // TODO change this when final types defined
      if (map !== undefined) {
        updateMarkers(map)
      }
    }, DEBOUNCE_TIME),
    []
  )

  useEffect(() => {
    const map = mapViewRef.current?.getMap()
    if (!map) return
    updateMarkers(map)
  }, [props.mapHoverState])

  const onMapLoad = useCallback(
    () => {
      onMapLoadHandler(
        mapViewRef,
        spiderifierRef,
        props.setSpiderLayerIds,
        updateMarkersDebounced,
        unclusteredPointPinsPaint,
        EmergencyColorMap,
        viewport,
        containerSize,
        setViewport,
        SOURCE_ID,
        { paint: hoveredPointPin.paint as mapboxgl.SymbolPaint, layout: hoveredPointPin.layout }
      )
      // const map = evt.target
      // const geolocate = geolocationControlsRef.current
      // if (geolocate) {
      //   // Workaround for https://docs.mapbox.com/mapbox-gl-js/api/#geolocatecontrol#trigger
      //   const trigger = geolocate['_onClickGeolocate'] as () => void
      //   trigger()
      // }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Used when clicking on a menu item of the context menu
  const onMenuItemClick = useCallback(
    (
      evt: any,
      operation?: 'create' | 'update' | 'delete',
      type?: ProvisionalFeatureType,
      itemId?: string
    ) => {
      // Open modal with creation/update/delete wizards
      if (operation && type) {
        console.debug(operation, type)
      }
      setRightClickedPoint(null)
      if (!operation) return
      if (operation === 'delete') {
        showFeaturesDialog(operation, type, itemId)
      } else {
        if (type && ['Report', 'ReportRequest', 'Mission', 'Communication'].includes(type)) {
          startFeatureEdit(type as ProvisionalFeatureType, null)
        } else {
          displayWarningSnackbar('Cannot create feature of type ' + type)
          // TODO retrieve feature area by id (if not report) - by API?
          // add to startFeatureEdit(type as ProvisionalFeatureType, itemId, area)
          // when area is set, or as a callback, add it to the editor
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Used when entering on an iteractive layer with the mouse
  const onMouseEnter = useCallback(
    (evt: PointerEvent) => {
      onMouseEnterHandler<EmergencyProps>(
        mapViewRef,
        spiderifierRef,
        mapMode,
        isMobileDevice,
        setHoveredPoint,
        [...GEOJSON_LAYER_IDS, ...props.spiderLayerIds],
        evt
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapMode, props.spiderLayerIds.length]
  )
  // Empty array ensures that effect is only run on mount and unmount

  // Used when leaving on an iteractive layer with the mouse
  const onMouseLeave = useCallback((evt: PointerEvent) => {
    onMouseLeaveHandler<EmergencyProps>(
      mapViewRef,
      spiderifierRef,
      isMobileDevice,
      setHoveredPoint
      // GEOJSON_LAYER_IDS,
      // evt
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Empty array ensures that effect is only run on mount and unmount

  // Called on left click
  const onMapClick = useCallback(
    (evt: PointerEvent) => {
      evt.preventDefault()
      evt.stopPropagation()
      onMapLeftClickHandler(
        mapViewRef,
        mapMode,
        setClickedPoint,
        setRightClickedPoint,
        setHoveredPoint,
        spiderifierRef,
        evt
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewport.zoom, mapMode] // TODO check if needed
  )

  // Called on right click
  const onContextMenu = useCallback(
    (evt: PointerEvent) => {
      evt.preventDefault()
      evt.stopPropagation()
      onMapRightClickHandler(
        mapViewRef,
        mapMode,
        isMobileDevice,
        GEOJSON_LAYER_IDS,
        setRightClickedPoint,
        evt
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapMode]
  )

  const filterApplyBoundsHandler = () => {
    const newFilterObj = JSON.parse(JSON.stringify(props.filtersObj))
    const bounds = getMapBounds(mapViewRef)
    // Keep the current filter if it is already a bounding box
    // This is to prevent a backend bug which returned null
    if (bounds!.northEast && bounds!.northEast[0] > 86.77324846555354) {
      bounds!.northEast[0] = 86.77324846555354
    }
    if (bounds!.northEast && bounds!.northEast[1] > 65.33058858672266) {
      bounds!.northEast[1] = 65.33058858672266
    }
    if (bounds!.southWest && bounds!.southWest[0] < -76.77652791830207) {
      bounds!.southWest[0] = -76.77652791830207
    }
    if (bounds!.southWest && bounds!.southWest[1] < -29.94539308554898) {
      bounds!.southWest[1] = -29.94539308554898
    }
    newFilterObj.filters.mapBounds = { ...bounds, zoom: getMapZoom(mapViewRef) }
    props.changeItem(JSON.stringify(newFilterObj))
    props.setFiltersObj(newFilterObj)
    props.forceUpdate()
  }
  // Update viewport state
  useEffect(
    () => setViewport({ ...viewport, ...containerSize }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerSize, props.prepGeoJson.features, props.prepGeoJson.features.length]
  )
  // Empty array ensures that effect is only run on mount and unmount
  useEffect(() => {
    if (props.isGeoJsonPrepared) {
      console.log('FILTERED LIST', props.prepGeoJson.features)
      console.log('FILTER LIST', props.filterList)
      let filteredList = props.prepGeoJson.features.filter(
        (a) =>
          props.filterList.includes(a?.properties?.type) ||
          props.filterList.includes(a?.properties?.status) ||
          props.filterList.includes(a?.properties?.activityFilter)
      )
      setJsonData({
        type: 'FeatureCollection',
        features: filteredList
      })
      const map = mapViewRef.current?.getMap()
      updateMarkersDebounced(map)
    }
  }, [
    props.isGeoJsonPrepared,
    props.filterList,
    props.prepGeoJson.features,
    props.prepGeoJson.features.length,
    updateMarkersDebounced
  ])

  useEffect(() => {
    if (props.goToCoord !== undefined) {
      mapViewRef.current?.getMap().flyTo(
        {
          center: new mapboxgl.LngLat(props.goToCoord.longitude, props.goToCoord.latitude),
          zoom: 15
        },
        {
          how: 'fly',
          longitude: props.goToCoord.longitude,
          latitude: props.goToCoord.latitude,
          zoom: 15
        }
      )
      props.setGoToCoord(undefined)
    }
  }, [props.goToCoord, props.setGoToCoord])

  // Draw communication polygon to map when pin is clicked, if not remove it
  useEffect(() => {
    const map = mapViewRef.current?.getMap()
    setPolyToMap(undefined)
    if (clickedPoint) {
      if (polyToMap) {
        drawPolyToMap(
          map,
          polyToMap?.feature.properties.centroid,
          {
            type: 'MultiPolygon',

            coordinates: [JSON.parse(polyToMap?.feature?.geometry).coordinates]
          } as GeoJSON.MultiPolygon,
          {},
          EmergencyColorMap['Communication']
        )
      }
    } else {
      removePolyToMap(map)
    }
  }, [polyToMap, clickedPoint])

  // pass the map for popup over
  useEffect(() => {
    props.setMap(mapViewRef.current?.getMap())
    props.setSpiderifierRef(spiderifierRef)
  }, [])

  return (
    <>
      <MapHeadDrawer
        mapRef={mapViewRef}
        filterApplyHandler={() => filterApplyBoundsHandler()} //props.filterApplyHandler
        mapViewport={viewport}
        customStyle={{ barHeight: '48px' }}
        isLoading={false}
      />
      <InteractiveMap
        {...viewport}
        mapStyle={mapTheme?.style}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        transformRequest={transformRequest}
        clickRadius={CLICK_RADIUS}
        onLoad={onMapLoad}
        interactiveLayerIds={[...GEOJSON_LAYER_IDS, ...props.spiderLayerIds]}
        // onHover={(evt) => console.debug('Map: mouse Hover', evt)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onMapClick}
        // onDblClick={onDoubleClick}
        onContextMenu={onContextMenu}
        ref={mapViewRef}
        width="100%"
        height="calc(100% + 30px)"
      >
        <MapDraw
          ref={mapDrawRef}
          onFeatureAdd={(data: GeoJSON.Feature[]) => {
            console.debug('Feature drawn!', data)
            if (mapDrawRef.current && mapViewRef.current && data.length > 0) {
              const map = mapViewRef.current.getMap()
              if (mapMode === 'select') {
                // min Longitude , min Latitude , max Longitude , max Latitude
                // south Latitude, north Latitude, west Longitude, east Longitude
                const [minX, minY, maxX, maxY] = bbox(data[0] as GeoJSON.Feature<GeoJSON.Polygon>)
                const mapFeaturesInTheBox = mapViewRef.current.queryRenderedFeatures(
                  [map.project([minX, minY]), map.project([maxX, maxY])],
                  {
                    layers: GEOJSON_LAYER_IDS
                  }
                )
                const clustersCount = mapFeaturesInTheBox.reduce((count, f) => {
                  if (f?.properties?.cluster === true) {
                    count++
                  }
                  return count
                }, 0)
                // console.debug('Feature selection', mapFeaturesInTheBox, 'bbox', [
                //   minX,
                //   minY,
                //   maxX,
                //   maxY
                // ])
                displayMessage(
                  `${mapFeaturesInTheBox.length} features selected, of which ${clustersCount} clusters`
                )
                mapDrawRef.current?.deleteFeatures(0) // remove square
                setTimeout(() => {
                  // change mode back - timeout needed because of mjolnir.js
                  // that will otherwise intercept the last click
                  setMapMode('browse')
                }, 500)
              } else if (mapMode === 'edit') {
                const featurePolygon = data[0] as GeoJSON.Feature<GeoJSON.Polygon>
                // shall we also handle multi polygon?
                if (editingFeatureType !== null) {
                  startFeatureEdit(editingFeatureType, editingFeatureId, featurePolygon)
                }
                // map.getCanvas().style.cursor = ''
              }
            }
          }}
        />
        {/** PUT ONLY EDITOR HERE AND SELECT OUTSIDE */}
        {/* GeoJSON Features (points) */}
        <Source
          id={SOURCE_ID}
          type="geojson"
          data={jsonData}
          cluster={true}
          clusterMaxZoom={MAX_CLUSTER_ZOOM}
          clusterRadius={CLUSTER_RADIUS}
          clusterProperties={emergencyClusterProperties}
          ref={geoJSONPointsSourceRef}
        >
          {/* Layers here */}
          <Layer {...clusterLayer} />
          <Layer {...unclusteredPointLayerPins} />
          <Layer {...hoveredPointPin} />
        </Source>
        {/* Map controls */}
        <GeolocateControl
          // ref={geolocationControlsRef}
          label={t('maps:show_my_location')}
          style={geolocateStyle}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
        />
        <div className="controls-contaniner" style={{ top: '45px' }}>
          <NavigationControl />
        </div>
        <div className="controls-contaniner" style={{ bottom: 16 }}>
          <ScaleControl />
        </div>
        {/* Hover Popup */}
        {!isMobileDevice && (
          <EmergencyHoverPopup point={rightClickedPoint === null ? hoveredPoint : null} />
        )}
        {/* Right Clicked item */}
        {!isMobileDevice && (
          <ContextMenu
            item={rightClickedPoint?.item}
            latitude={rightClickedPoint?.latitude}
            longitude={rightClickedPoint?.longitude}
            onListItemClick={onMenuItemClick}
          ></ContextMenu>
        )}
      </InteractiveMap>
      {/* {!isMobileDevice && <SelectionToggle></SelectionToggle>} */}
      {!isMobileDevice && (
        <DrawerToggle
          toggleDrawerTab={props.toggleDrawerTab}
          setToggleDrawerTab={props.setToggleDrawerTab}
        ></DrawerToggle>
      )}
      {!isMobileDevice && (
        <FilterButton
          setToggleActiveFilterTab={props.setToggleActiveFilterTab}
          toggleActiveFilterTab={props.toggleActiveFilterTab}
        ></FilterButton>
      )}
      {!isMobileDevice && (
        <LayersButton
          visibility={props.layersSelectVisibility}
          setVisibility={props.setLayersSelectVisibility}
        />
      )}
      <MapStyleToggle mapViewRef={mapViewRef} spiderifierRef={spiderifierRef}></MapStyleToggle>
      <Collapse in={legendToggle}>
        <Card className={classes.legend_container}>
          <CardContent style={{ padding: 12 }}>
            {Object.keys(EmergencyColorMap).map((key) => {
              return (
                <div className={classes.legend_row}>
                  <div
                    style={{
                      backgroundColor: EmergencyColorMap[key]
                    }}
                    className={classes.legend_dot}
                  ></div>
                  <div className={classes.legend_text}>&nbsp; {t('maps:' + key)} </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </Collapse>
      <Fab
        size="small"
        color="primary"
        aria-label="add"
        className={classes.fab}
        onMouseEnter={() => {
          setLegendToggle(true)
        }}
        onMouseLeave={() => {
          setLegendToggle(false)
        }}
      >
        <InfoIcon />
      </Fab>

      {/* Bottom drawer - outside map */}
      <BottomDrawerComponent
        open={clickedPoint !== null}
        title={clickedPoint ? (clickedPoint.item as EmergencyProps).descrizione : ''}
        onCloseButtonClick={() => setClickedPoint(null)}
      >
        {/* TODO a smart details component that can differentiate between content types */}
        {clickedPoint && (
          <EmergencyDetailsCard
            {...(clickedPoint as ItemWithLatLng<EmergencyProps>)}
            setPolyToMap={setPolyToMap}
            setGoToCoord={props.setGoToCoord}
          />
        )}
      </BottomDrawerComponent>
    </>
  )
}
