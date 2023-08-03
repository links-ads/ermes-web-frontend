import React, { useState, useRef, useContext, useEffect, useCallback, useMemo } from 'react'
import {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  InteractiveMap,
  PointerEvent,
  ExtraState
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
import {
  useMapStateContext,
  ItemWithLatLng,
  ProvisionalFeatureType,
  ProvisionalOperationType
} from './map.contest'
import {
  onMapLoadHandler,
  onMouseEnterHandler,
  onMouseLeaveHandler,
  onMapLeftClickHandler,
  onMapDoubleClickHandler,
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
import { makeStyles, Theme } from '@material-ui/core/styles'
import { Button, Chip, Collapse, createStyles, Fab } from '@material-ui/core'
import InfoIcon from '@material-ui/icons/Info'
import { LayersButton } from './map-layers/layers-button.component'
import { tileJSONIfy } from '../../../utils/map.utils'
import { EntityType } from 'ermes-ts-sdk'
import { geometryCollection, multiPolygon, polygon } from '@turf/helpers'

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      position: 'absolute',
      bottom: '150px',
      right: '10px',
      zIndex: 99,
      backgroundColor: theme.palette.secondary.main,
      [theme.breakpoints.up('sm')]: {
        bottom: 390
      },
      [theme.breakpoints.up('md')]: {
        bottom: 280
      },
      [theme.breakpoints.up('lg')]: {
        bottom: 150
      }
    },
    legend_container: {
      zIndex: 98,
      position: 'absolute',
      bottom: 150,
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
    },
    mapCoorZoom: {
      zIndex: 97,
      top: 10, 
      left: 56, 
      position: 'absolute'
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

  // Parse props
  const {
    goToCoord,
    setGoToCoord,
    setMap,
    setSpiderifierRef,
    setDblClickFeatures,
    selectedLayer,
    mapRequestsSettings
  } = props

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

  const [mapHeadDrawerCoordinates, setMapHeadDrawerCoordinates] = useState([] as any[])

  // Guided procedure dialog
  const onFeatureDialogClose = useCallback(
    (status: DialogResponseType, entityType: EntityType = EntityType.OTHER) => {
      console.debug('onFeatureDialogClose', status)
      clearFeatureEdit()
      mapDrawRef.current?.deleteFeatures(0) // remove polygon if any
      if (status === 'confirm') {
        props.fetchGeoJson(undefined)
        props.refreshList(entityType)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Display wizard or confirm dialog for features
  const showFeaturesDialog = useMapDialog(onFeatureDialogClose, null)

  // Variable checked to draw polygons to the map
  const [polyToMap, setPolyToMap] = useState<undefined | { feature }>(undefined)
  const [teamName, setPersonTeam] = useState<undefined | { feature }>(undefined)

  const [geoLayerState, setGeoLayerState] = useState<any>({ tileId: null, tileSource: {} })

  useEffect(
    () => {
      if (editingFeatureType !== null) {
        const operation = editingFeatureId === null ? 'create' : 'update'
        if (editingFeatureType === 'Report' || editingFeatureType === 'MapRequest') {
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

  /**
   * method to control style changing on map, removing currently shown layer, changing style and adding the layer again after a delay to
   * ensure that the style has finished loading (workaround to known bug with the official callback)
   */
  const onMapStyleChange = () => {
    const map = mapViewRef.current?.getMap()!

    //Management of layer not related to a Map Request
    if (selectedLayer) {
      if (selectedLayer.activeLayer !== null) {
        map.removeLayer(selectedLayer.activeLayer)
        map.removeSource(selectedLayer.activeLayer)
        setGeoLayerState({ tileId: null, tileSource: {} })
      }

      setTimeout(() => {
        const layerName = selectedLayer.activeLayer
        if (layerName != '' && !map.getLayer(layerName)) {
          const source = tileJSONIfy(
            map,
            layerName,
            selectedLayer.availableTimestamps[selectedLayer.dateIndex],
            geoServerConfig,
            map.getBounds()
          )
          source['properties'] = {
            format: undefined,
            fromTime: undefined,
            toTime: undefined
          }
          map.addSource(layerName, source as mapboxgl.RasterSource)
          map.addLayer(
            {
              id: layerName,
              type: 'raster',
              source: layerName
            },
            'clusters'
          )
          map.setPaintProperty(
            selectedLayer.activeLayer,
            'raster-opacity',
            selectedLayer.opacity / 100
          )
        }
      }, 1000) //after 1 sec
    }

    //Map request layers management
    if (mapRequestsSettings) {
      Object.keys(mapRequestsSettings).forEach((mrCode) => {
        Object.keys(mapRequestsSettings[mrCode]).forEach((dataTypeId) => {
          const activeLayer = mapRequestsSettings[mrCode][dataTypeId].activeLayer
          if (activeLayer && activeLayer !== '') {
            map.removeLayer(activeLayer)
            map.removeSource(activeLayer)
            setTimeout(() => {
              const source = tileJSONIfy(
                map,
                activeLayer,
                mapRequestsSettings[mrCode][dataTypeId].availableTimestamps[
                  mapRequestsSettings[mrCode][dataTypeId].dateIndex
                ],
                geoServerConfig,
                map.getBounds()
              )
              source['properties'] = {
                format: undefined,
                fromTime: undefined,
                toTime: undefined
              }
              map.addSource(activeLayer, source as mapboxgl.RasterSource)
              map.addLayer(
                {
                  id: activeLayer,
                  type: 'raster',
                  source: activeLayer
                },
                'clusters'
              )
              map.setPaintProperty(
                activeLayer,
                'raster-opacity',
                mapRequestsSettings[mrCode][dataTypeId].opacity / 100
              )
            }, 1000)
          }
        })
      })
    }
  }

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
      operation?: ProvisionalOperationType,
      type?: ProvisionalFeatureType,
      itemId?: string,
      data?: string
    ) => {
      // Open modal with creation/update/delete wizards
      if (operation && type) {
        console.debug(operation, type)
      }
      setRightClickedPoint(null)
      if (!operation) return
      if (operation === 'delete') {
        showFeaturesDialog(operation, type, itemId)
      } else if (operation == 'copy' && data) {
        navigator.clipboard
          .writeText(data)
          .then((a) => alert(t('common:coordinates_copied_to_clipboard')))
      } else {
        if (
          type &&
          ['Report', 'ReportRequest', 'Mission', 'Communication', 'MapRequest'].includes(type)
        ) {
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
        setMapHeadDrawerCoordinates,
        evt
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewport.zoom, mapMode] // TODO check if needed
  )
  const onMapDoubleClick = useCallback(
    (evt: PointerEvent) => {
      evt.preventDefault()
      evt.stopPropagation()
      onMapDoubleClickHandler(
        mapViewRef,
        mapMode,
        props.selectedLayer,
        setDblClickFeatures,
        setMapHeadDrawerCoordinates,
        evt
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapMode, props.selectedLayer] // TODO check if needed
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
    props.updateMapBounds({ ...bounds, zoom: getMapZoom(mapViewRef) })
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
      // console.log('FILTERED LIST', props.prepGeoJson.features)
      // console.log('FILTER LIST', props.filterList)
      let filteredList = props.prepGeoJson.features.filter(
        (a) =>
          props.filterList.includes(a?.properties?.type) ||
          props.filterList.includes(a?.properties?.status) ||
          props.filterList.includes(a?.properties?.activityFilter)
      )
      const map = mapViewRef?.current?.getMap()
      if (map) spiderifierRef.current?.clearSpiders(map!)
      setJsonData({
        type: 'FeatureCollection',
        features: filteredList
      })
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
    if (goToCoord !== undefined) {
      const map = mapViewRef.current?.getMap()
      if (map) {
        const zoom = map.getZoom()
        map.flyTo(
          {
            center: new mapboxgl.LngLat(goToCoord.longitude, goToCoord.latitude),
            zoom: zoom
          },
          {
            how: 'fly',
            longitude: goToCoord.longitude,
            latitude: goToCoord.latitude
          }
        )
      }
      setGoToCoord(undefined)
    }
  }, [goToCoord, setGoToCoord])

  // Draw communication polygon to map when pin is clicked, if not remove it
  useEffect(() => {
    const map = mapViewRef.current?.getMap()
    setPolyToMap(undefined)
    if (clickedPoint) {
      if (polyToMap && polyToMap?.feature?.geometry) {
        const geometry = JSON.parse(polyToMap?.feature?.geometry)
        const polyToDraw =
          geometry.type === 'Polygon'
            ? polygon(geometry.coordinates, polyToMap?.feature?.properties)
            : geometry.type === 'Point' ?
            geometryCollection([geometry].concat(polyToMap.feature.properties.boundaryConditions.map(e => (JSON.parse(Object.values(e.fireBreak)[0] as string)))))
            : multiPolygon(geometry.coordinates, polyToMap?.feature?.properties)

        drawPolyToMap(
          map,
          polyToMap?.feature.properties.centroid,
          polyToDraw,
          EmergencyColorMap[polyToMap?.feature.properties.type]
        )
      }
    } else {
      removePolyToMap(map)
    }
  }, [polyToMap, clickedPoint])

  // pass the map for popup over
  useEffect(() => {
    setMap(mapViewRef.current?.getMap())
    setSpiderifierRef(spiderifierRef)
  }, [setMap, setSpiderifierRef])

  // when the layers change (like the spiderifier layer), update the mapLayers to show changes
  const mapLayers = useMemo(() => {
    return geoLayerState.tileId
      ? [...GEOJSON_LAYER_IDS, ...props.spiderLayerIds, geoLayerState.tileId]
      : [...GEOJSON_LAYER_IDS, ...props.spiderLayerIds]
  }, [geoLayerState, props.spiderLayerIds])

  const customGetCursor = ({ isDragging, isHovering }: ExtraState) =>
    isDragging ? 'all-scroll' : isHovering ? 'pointer' : 'auto'

  const mapCoordinatesZoom =
    (mapHeadDrawerCoordinates && mapHeadDrawerCoordinates.length > 0
      ? t('social:map_latitude') +
        ': ' +
        mapHeadDrawerCoordinates[1].toFixed(2) +
        '  ' +
        t('social:map_longitude') +
        ': ' +
        mapHeadDrawerCoordinates[0].toFixed(2)
      : t('social:map_latitude') +
        ': ' +
        viewport.latitude.toFixed(2) +
        '  ' +
        t('social:map_longitude') +
        ': ' +
        viewport.longitude.toFixed(2)) +
    '  ' +
    t('social:map_zoom') +
    ': ' +
    viewport.zoom.toFixed(2)

  return (
    <>      
      {/* <MapHeadDrawer
        mapRef={mapViewRef}
        filterApplyHandler={() => filterApplyBoundsHandler()} //props.filterApplyHandler
        mapViewport={viewport}
        coordinates={mapHeadDrawerCoordinates}
        customStyle={{ barHeight: '48px' }}
        isLoading={false}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={props.downloadGeojsonFeatureCollection}
        >
          {t('maps:download_button')}
        </Button>
      </MapHeadDrawer> */}
      <InteractiveMap
        {...viewport}
        doubleClickZoom={false}
        mapStyle={mapTheme?.style}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        transformRequest={transformRequest}
        clickRadius={CLICK_RADIUS}
        onLoad={onMapLoad}
        interactiveLayerIds={mapLayers}
        // onHover={(evt) => console.debug('Map: mouse Hover', evt)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onMapClick}
        onDblClick={onMapDoubleClick}
        onContextMenu={onContextMenu}
        ref={mapViewRef}
        width="100%"
        height="100%" //was  height="calc(100% + 30px)"
        getCursor={customGetCursor}
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
            downloadGeojsonFeatureCollection={props.downloadGeojsonFeatureCollection}
          ></ContextMenu>
        )}
      </InteractiveMap>
      {/* {!isMobileDevice && <SelectionToggle></SelectionToggle>} */}
      {!isMobileDevice && (
        <>
          <DrawerToggle
            toggleDrawerTab={props.toggleDrawerTab}
            setToggleDrawerTab={props.setToggleDrawerTab}
          ></DrawerToggle>
          {/* <FilterButton
            setToggleActiveFilterTab={props.setToggleActiveFilterTab}
            toggleActiveFilterTab={props.toggleActiveFilterTab}
          ></FilterButton> */}
          <LayersButton
            visibility={props.layersSelectVisibility}
            setVisibility={props.setLayersSelectVisibility}
          />
        </>
      )}
      <MapStyleToggle
        mapViewRef={mapViewRef}
        spiderifierRef={spiderifierRef}
        onMapStyleChange={onMapStyleChange}
        mapChangeSource={0}
      ></MapStyleToggle>
      <Collapse in={legendToggle}>
        <Card className={classes.legend_container}>
          <CardContent style={{ padding: 12 }}>
            {Object.keys(EmergencyColorMap).map((key, i) => {
              return (
                <div key={i} className={classes.legend_row}>
                  <div
                    style={{
                      backgroundColor: EmergencyColorMap[key]
                    }}
                    className={classes.legend_dot}
                  ></div>
                  <div className={classes.legend_text}>&nbsp; {t('maps:legend_' + key.toLocaleLowerCase())} </div>
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
      <Chip className={classes.mapCoorZoom} 
        label={mapCoordinatesZoom}
      />
      {/* Bottom drawer - outside map */}
      <BottomDrawerComponent
        open={clickedPoint !== null}
        title={clickedPoint ? (clickedPoint.item as EmergencyProps).description : ''}
        onCloseButtonClick={() => setClickedPoint(null)}
        featureType={clickedPoint ? (clickedPoint?.item as EmergencyProps).type : ''}
      >
        {/* TODO a smart details component that can differentiate between content types */}
        {clickedPoint && (
          <EmergencyDetailsCard
            {...(clickedPoint as ItemWithLatLng<EmergencyProps>)}
            setPolyToMap={setPolyToMap}
            setGoToCoord={props.setGoToCoord}
            setPersonTeam={setPersonTeam}
            teamName={teamName}
          />
        )}
      </BottomDrawerComponent>
    </>
  )
}
