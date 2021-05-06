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
import {
  ContainerSize,
  ContainerSizeContext
} from '../../../common/size-aware-container.component'
import { EmergencyProps, EmergencyColorMap } from './api-data/emergency.component'
import bbox from '@turf/bbox'
import { BottomDrawerComponent } from './bottom-drawer.component'
import { AppConfigContext } from '../../../config'
import {
  emergencyClusterProperties,
  clusterLayer,
  unclusteredPointPinsPaint,
  unclusteredPointLayerPins,
  updateEmergencyMarkers,
  hoveredPointPin
} from './api-data/emergency.layers'
import debounce from 'lodash.debounce'
//import { Spiderifier } from '../../../../utils/map-spiderifier.utils'
import { EmergencyHoverPopup, EmergencyDetailsCard } from './api-data/emergency.popups'
import { ContextMenu } from './context-menu.component'
import { useMapDialog } from './map-dialog.hooks'
import { MapDraw, MapDrawRefProps } from './map-draw.components'
import { useMapStateContext, ItemWithLatLng, ProvisionalFeatureType } from './map.contest'
import {
  onMapLoadHandler,
  onMouseEnterHandler,
  onMouseLeaveHandler,
  onMapLeftClickHandler,
  onMapRightClickHandler
} from './map-event-handlers'
import { SelectionToggle } from './selection-toggle.component'
import { FilterType } from './filter-type.component'
import { MapStyleToggle } from './map-style-toggle.component'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'

// Style for the geolocation controls
const geolocateStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
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

export function MapLayout(props) {
  const [jsonData, setJsonData] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  })
  // const convData FeatureCollection<geometry,
  // Container size
  const containerSize = useContext<ContainerSize>(ContainerSizeContext)
  // Used to hide-show functionalities
  const { isMobileDevice } = useContext(AppConfigContext)
  // Translation
  const { t } = useTranslation(['maps'])
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
  const spiderifierRef = useRef(null)// useRef<Spiderifier | null>(null)
  const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])

  // MapDraw
  const mapDrawRef = useRef<MapDrawRefProps>(null)

  // Snackbars
  const { displayMessage, displayWarningSnackbar } = useSnackbars()

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
    (status: string) => {
      console.debug('onFeatureDialogClose', status)
      clearFeatureEdit()
      mapDrawRef.current?.deleteFeatures(0) // remove polygon if any
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Display wizard or confirm dialog for features
  const showFeaturesDialog = useMapDialog(onFeatureDialogClose)

  useEffect(
    () => {
      if (editingFeatureType !== null) {
        const operation = editingFeatureId === null ? 'create' : 'update'
        if (editingFeatureType === 'report') {
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
              editingFeatureId ? editingFeatureId + '' : ''
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

  // Update markers on map
  const updateMarkers = useCallback(
    debounce((map: mapboxgl.Map | undefined) => {
      // TODO change this when final types defined
      if (map !== undefined) {
        clusterMarkersRef.current = updateEmergencyMarkers(SOURCE_ID, clusterMarkersRef, map)
      }
    }, DEBOUNCE_TIME),
    []
  )

  const onMapLoad = useCallback(
    () => {
      onMapLoadHandler(
        mapViewRef,
        spiderifierRef,
        setSpiderLayerIds,
        updateMarkers,
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
      type?: string /*use ProvisionalFeatureType*/,
      itemId?: string
    ) => {
      // Open modal with creation/update/delete wizards
      if (operation && type) {
        console.debug(operation, type)
      }
      setRightClickedPoint(null)
      if (operation === 'delete') {
        showFeaturesDialog(operation, type, itemId)
      } else {
        if (type && ['report', 'report_request', 'mission', 'communication'].includes(type)) {
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
        [...GEOJSON_LAYER_IDS, ...spiderLayerIds],
        evt
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapMode, spiderLayerIds.length]
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

  // Update viewport state
  useEffect(
    () => setViewport({ ...viewport, ...containerSize }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerSize, props.prepGeoJson.features, props.prepGeoJson.features.length]
  )
  // Empty array ensures that effect is only run on mount and unmount
  useEffect(() => {
    if (props.isGeoJsonPrepared) {
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
      updateMarkers(map)
    }
  }, [
    props.isGeoJsonPrepared,
    props.filterList,
    props.prepGeoJson.features,
    props.prepGeoJson.features.length,
    updateMarkers
  ])
  return (
    <>
      <InteractiveMap
        {...viewport}
        mapStyle={mapTheme?.style}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        transformRequest={transformRequest}
        clickRadius={CLICK_RADIUS}
        onLoad={onMapLoad}
        interactiveLayerIds={[...GEOJSON_LAYER_IDS, ...spiderLayerIds]}
        // onHover={(evt) => console.debug('Map: mouse Hover', evt)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onMapClick}
        // onDblClick={onDoubleClick}
        onContextMenu={onContextMenu}
        ref={mapViewRef}
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
        <div className="controls-contaniner" style={{ top: 8 }}>
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
      {!isMobileDevice && <SelectionToggle></SelectionToggle>}
      {!isMobileDevice && (
        <FilterType
          setToggleActiveFilterTab={props.setToggleActiveFilterTab}
          toggleActiveFilterTab={props.toggleActiveFilterTab}
        ></FilterType>
      )}
      <MapStyleToggle mapViewRef={mapViewRef} spiderifierRef={spiderifierRef}></MapStyleToggle>

      {/* Bottom drawer - outside map */}
      <BottomDrawerComponent
        open={clickedPoint !== null}
        title={clickedPoint ? (clickedPoint.item as EmergencyProps).descrizione : ''}
        onCloseButtonClick={() => setClickedPoint(null)}
      >
        {/* TODO a smart details component that can differentiate between content types */}
        {clickedPoint && (
          <EmergencyDetailsCard {...(clickedPoint as ItemWithLatLng<EmergencyProps>)} />
        )}
      </BottomDrawerComponent>
    </>
  )
}
