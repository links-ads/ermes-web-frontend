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
  clickedPointPin,
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
} from './map.context'
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
import {
  drawPolyToMap,
  getBboxSizeFromZoom,
  paintMapWithLayer,
  removeLayerFromMap,
  removePolyToMap
} from '../../../common/map/map-common'
import { getMapBounds, getMapZoom } from '../../../common/map/map-common'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { Chip, createStyles } from '@material-ui/core'
import { LayersButton } from './map-layers/layers-button.component'
import { tileJSONIfy } from '../../../utils/map.utils'
import { EntityType } from 'ermes-ts-sdk'
import { geometryCollection, multiPolygon, polygon } from '@turf/helpers'
import { DownloadButton } from './map-drawer/download-button.component'
import MapSearchHere from '../../../common/map/map-search-here'
import {
  highlightClickedPoint,
  placePositionPin,
  tonedownClickedPoint
} from './map-event-handlers/map-click.handler'
import {
  areClickedPointAndSelectedCardEqual,
  findFeatureByTypeAndId
} from '../../../hooks/use-map-drawer.hook'
import { wktToGeoJSON } from '@terraformer/wkt'
import { MapRequestType } from 'ermes-backoffice-ts-sdk'
import MapGeocoderSearchButton from './map-geocoder-search-button.component'
import MapLegendButton from './map-legend-button.component'

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
    mapCoorZoom: {
      zIndex: 8,
      top: 10,
      right: 10,
      position: 'absolute',
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.default
    },
    layersOnly: {
      top: 270,
      position: 'absolute',
      right: 0,
      margin: 10,
      background: theme.palette.background.default,
      width: 29,
      height: 37,
      borderRadius: 12
    },
    drawerDownloadAndLegend: {
      top: 330,
      position: 'absolute',
      right: 0,
      margin: 10,
      background: theme.palette.background.default,
      width: 29,
      height: 112,
      borderRadius: 12
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

  // Parse props
  const {
    setMap,
    setSpiderifierRef,
    addLayerTimeseries,
    selectedLayers,
    mapRequestsSettings,
    mapDrawerDataState,
    addLayerFeatureInfo
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
      editingFeatureId,
      goToCoord,
      clickedCluster
    },
    {
      setMapMode,
      setViewport,
      setClickedPoint,
      setHoveredPoint,
      setRightClickedPoint,
      startFeatureEdit,
      clearFeatureEdit,
      setGoToCoord,
      setClickedCluster
    }
  ] = useMapStateContext<EmergencyProps>()

  const [mapHeadDrawerCoordinates, setMapHeadDrawerCoordinates] = useState([] as any[])
  const { selectedFeatureId } = mapDrawerDataState
  const [selectedLayer, setSelectedLayer] = useState(selectedLayers[selectedLayers.length - 1])

  useEffect(() => {
    if (selectedLayers && selectedLayers.length > 0) {
      setSelectedLayer(selectedLayers[selectedLayers.length - 1])
    } else {
      setSelectedLayer(null)
    }
  }, [selectedLayers])

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

  const [searchHereActive, setSearchHereActive] = useState<boolean>(false)

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
  }, [props.mapHoverState, clickedCluster])

  /**
   * method to control style changing on map, removing currently shown layer, changing style and adding the layer again after a delay to
   * ensure that the style has finished loading (workaround to known bug with the official callback)
   */
  const onMapStyleChange = () => {
    const map = mapViewRef.current?.getMap()!

    //Management of layer not related to a Map Request
    if (selectedLayers && selectedLayers.length > 0) {
      for (let i = 0; i < selectedLayers.length; i++) {
        const currentSelectedLayer = selectedLayers[i]
        const currentSelectedLayerActive = currentSelectedLayer.activeLayer
        if (currentSelectedLayerActive !== null) {
          removeLayerFromMap(map, {
            layerName: currentSelectedLayer.activeLayer,
            layerDateIndex: currentSelectedLayer.dateIndex
          })
          setGeoLayerState({ tileId: null, tileSource: {} })
        }
      }

      setTimeout(() => {
        for (let i = 0; i < selectedLayers.length; i++) {
          const currentSelectedLayer = selectedLayers[i]
          paintMapWithLayer(map, currentSelectedLayer, geoServerConfig)
        }
      }, 1000) //after 1 sec
    }

    //Map request layers management
    if (mapRequestsSettings) {
      Object.keys(mapRequestsSettings).forEach((mrCode) => {
        Object.keys(mapRequestsSettings[mrCode]).forEach((dataTypeId) => {
          const activeLayer = mapRequestsSettings[mrCode][dataTypeId].activeLayer
          if (activeLayer && activeLayer !== '') {
            if (map.getLayer(activeLayer)) {
              map.removeLayer(activeLayer)
            }
            if (map.getSource(activeLayer)) {
              map.removeSource(activeLayer)
            }
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
              if (!map.getSource(activeLayer)) {
                map.addSource(activeLayer, source as mapboxgl.RasterSource)
              }
              if (!map.getLayer(activeLayer)) {
                map.addLayer(
                  {
                    id: activeLayer,
                    type: 'raster',
                    source: activeLayer
                  },
                  'clusters'
                )
              }
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
      data?: string | mapboxgl.LngLatLike
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
          .writeText(data as string)
          .then((a) => alert(t('common:coordinates_copied_to_clipboard')))
      } else if (operation === 'get') {
        if (type) {
          if (type === 'Timeseries') {
            if (selectedLayer && selectedLayer.activeLayer && data) {
              addLayerTimeseries(data, selectedLayer)
            } else {
              displayWarningSnackbar(t('maps:timeseriesNoLayer'))
            }
          } else if (type === 'FeatureInfo' && data) {
            if (selectedLayers && selectedLayers.length > 0) {
              const map = mapViewRef.current?.getMap()!
              const bboxSize = getBboxSizeFromZoom(map.getZoom())
              const ll = mapboxgl.LngLat.convert(data as mapboxgl.LngLatLike)
              const bounds = ll.toBounds(bboxSize / 2)
              addLayerFeatureInfo(geoServerConfig, 101, 101, bounds, window.innerWidth)
            } else {
              displayWarningSnackbar(t('maps:featureInfoNoLayer'))
            }
          }
        }
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
    [
      addLayerTimeseries,
      displayWarningSnackbar,
      selectedLayer,
      setRightClickedPoint,
      startFeatureEdit
    ]
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
        selectedLayer,
        addLayerTimeseries,
        setMapHeadDrawerCoordinates,
        setClickedPoint,
        evt
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapMode, selectedLayer] // TODO check if needed
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
    setSearchHereActive(false)
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

  const { zoom: viewportZoom, latitude: viewportLatitude, longitude: viewportLongitude } = viewport

  const ensureSelectedCardPinHighlight = useCallback(
    (
      centerOnMap: boolean = false,
      updateClickedPoint: boolean = false,
      firstSetup: boolean = true
    ) => {
      const map = mapViewRef.current?.getMap()
      if (selectedFeatureId !== '') {
        const selectedFeature = findFeatureByTypeAndId(jsonData.features, selectedFeatureId)
        if (selectedFeature) {
          const [longitude, latitude] = (selectedFeature as any).geometry.coordinates
          if (centerOnMap) {
            setGoToCoord({ latitude: latitude, longitude: longitude })
          }
          highlightClickedPoint(
            selectedFeature,
            mapViewRef,
            spiderifierRef,
            props.spiderLayerIds,
            clickedCluster,
            setClickedCluster,
            setClickedPoint,
            updateClickedPoint
          )
          updateMarkers(map)
        }
      } else {
        if (firstSetup) {
          tonedownClickedPoint(
            mapViewRef,
            spiderifierRef,
            clickedCluster,
            setClickedCluster,
            setClickedPoint
          )
          updateMarkers(map)
        }
      }
    },
    [findFeatureByTypeAndId, highlightClickedPoint, tonedownClickedPoint, updateMarkers]
  )

  useEffect(() => {
    ensureSelectedCardPinHighlight(false, false, false)
  }, [viewportZoom, viewportLatitude, viewportLongitude])

  useEffect(() => {
    const updateClickedPoint = !areClickedPointAndSelectedCardEqual(clickedPoint, selectedFeatureId)
    ensureSelectedCardPinHighlight(true, updateClickedPoint, true)
  }, [selectedFeatureId])

  // Draw communication polygon to map when pin is clicked, if not remove it
  useEffect(() => {
    const map = mapViewRef.current?.getMap()
    setPolyToMap(undefined)
    if (clickedPoint) {
      if (polyToMap && polyToMap?.feature?.geometry) {
        const geometry = JSON.parse(polyToMap?.feature?.geometry)
        const isGeometryCollection =
          polyToMap.feature.properties.type === EntityType.MAP_REQUEST &&
          polyToMap.feature.properties.mapRequestType === MapRequestType.WILDFIRE_SIMULATION
        const polyToDraw = isGeometryCollection
          ? geometryCollection(
              [geometry].concat(
                polyToMap.feature.properties.boundaryConditions.map((e) => {
                  if (e.fireBreak) {
                    const lineString = Object.values(e.fireBreak)[0] as string
                    let geojsonLine = null
                    if (lineString.startsWith('L')) {
                      geojsonLine = wktToGeoJSON(lineString)
                    } else {
                      geojsonLine = JSON.parse(lineString) // to ensure compatibility with previous map requests
                    }
                    return geojsonLine
                  }
                })
              )
            )
          : geometry.type === 'Polygon'
          ? polygon(geometry.coordinates, polyToMap?.feature?.properties)
          : multiPolygon(geometry.coordinates, polyToMap?.feature?.properties)
        const mapIsMoving = map?.isMoving()
        if (mapIsMoving) {
          map?.once('moveend', function (e) {
            removePolyToMap(map)
            drawPolyToMap(
              map,
              polyToMap?.feature.properties.centroid,
              polyToDraw,
              EmergencyColorMap[polyToMap?.feature.properties.type]
            )
          })
        } else {
          removePolyToMap(map)
          drawPolyToMap(
            map,
            polyToMap?.feature.properties.centroid,
            polyToDraw,
            EmergencyColorMap[polyToMap?.feature.properties.type]
          )
        }
      } else if (
        !['Communication', 'MapRequest', 'Mission', 'Alert'].includes(
          (clickedPoint.item as EmergencyProps).type
        )
      ) {
        removePolyToMap(map)
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
        mapHeadDrawerCoordinates[1].toFixed(6) +
        ' | ' +
        t('social:map_longitude') +
        ': ' +
        mapHeadDrawerCoordinates[0].toFixed(6)
      : t('social:map_latitude') +
        ': ' +
        viewport.latitude.toFixed(6) +
        ' | ' +
        t('social:map_longitude') +
        ': ' +
        viewport.longitude.toFixed(6)) +
    ' | ' +
    t('social:map_zoom') +
    ': ' +
    viewport.zoom.toFixed(2)

  const onViewportChangeHandler = (nextViewport) => {
    setViewport(nextViewport)
    if (
      viewport.latitude !== nextViewport.latitude ||
      viewport.longitude !== nextViewport.longitude ||
      viewport.zoom !== nextViewport.zoom
    ) {
      setSearchHereActive(true)
    }
  }

  const markSearchLocation = (latitude, longitude) => {
    setGoToCoord({ latitude: latitude, longitude: longitude })
    const map = mapViewRef.current?.getMap()
    placePositionPin(map, longitude, latitude, setMapHeadDrawerCoordinates, setClickedPoint)
  }

  const getMapBBox = () => {
    const bounds = getMapBounds(mapViewRef)
    return bounds
  }

  return (
    <>
      <InteractiveMap
        {...viewport}
        doubleClickZoom={false}
        mapStyle={mapTheme?.style}
        onViewportChange={(nextViewport) => onViewportChangeHandler(nextViewport)}
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
          <Layer {...clickedPointPin} />
        </Source>
        <Chip className={classes.mapCoorZoom} label={mapCoordinatesZoom} />
        {/* Map controls */}
        <div className="controls-container" style={{ top: 40, height: 206 }}>
          <MapGeocoderSearchButton
            getMapBBox={getMapBBox}
            markSearchLocation={markSearchLocation}
          />
          <GeolocateControl
            // ref={geolocationControlsRef}
            label={t('maps:show_my_location')}
            className="mapboxgl-ctrl-geolocate"
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
          />
          <NavigationControl />
          <MapStyleToggle
            mapViewRef={mapViewRef}
            spiderifierRef={spiderifierRef}
            onMapStyleChange={onMapStyleChange}
            mapChangeSource={0}
          ></MapStyleToggle>
        </div>
        <div className="controls-container" style={{ bottom: 16 }}>
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
            selectedLayer={selectedLayer}
          ></ContextMenu>
        )}
      </InteractiveMap>
      {/* {!isMobileDevice && <SelectionToggle></SelectionToggle>} */}
      {!isMobileDevice && (
        <>
          <MapSearchHere disabled={!searchHereActive} onClickHandler={filterApplyBoundsHandler} />
          {/* <FilterButton
            setToggleActiveFilterTab={props.setToggleActiveFilterTab}
            toggleActiveFilterTab={props.toggleActiveFilterTab}
          ></FilterButton> */}
          <div className={'controls-container ' + classes.layersOnly}>
            <LayersButton
              visibility={props.layersSelectVisibility}
              setVisibility={props.setLayersSelectVisibility}
            />
          </div>
          <div className={'controls-container ' + classes.drawerDownloadAndLegend}>
            <DrawerToggle
              toggleDrawerTab={props.toggleDrawerTab}
              setToggleDrawerTab={props.setToggleDrawerTab}
            ></DrawerToggle>
            <DownloadButton
              downloadGeojsonFeatureCollection={props.downloadGeojsonFeatureCollection}
            />
            <MapLegendButton />
          </div>
        </>
      )}
      {isMobileDevice && <MapLegendButton />} {/* TODO position button */}
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
            setGoToCoord={setGoToCoord}
            setPersonTeam={setPersonTeam}
            teamName={teamName}
          />
        )}
      </BottomDrawerComponent>
    </>
  )
}
