import { useEffect, useRef, useState } from 'react'
import { MapContainer } from '../../../common.components'
import InteractiveMap, {
  ExtraState,
  GeolocateControl,
  NavigationControl,
  ScaleControl
} from 'react-map-gl'
import { useMapPreferences } from '../../../../../../state/preferences/preferences.hooks'
import { EmergencyProps } from '../../../api-data/emergency.component'
import { MapDraw, MapDrawRefProps } from '../../../map-draw.components'
import { Feature, Polygon, GeoJsonProperties } from 'geojson'
import bbox from '@turf/bbox'
import { useSnackbars } from '../../../../../../hooks/use-snackbars.hook'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useMapStateContext } from '../../../map.contest'

// Click Radius (see react-map-gl)
const CLICK_RADIUS = 4
const GEOJSON_LAYER_IDS = ['clusters', 'unclustered-point']
// Style for the geolocation controls
const geolocateStyle: React.CSSProperties = {
  position: 'absolute',
  top: 45,
  left: 0,
  margin: 10
}

const MapRequestDrawFeature = (props) => {
  const { customMapMode } = props

  const { t } = useTranslation(['maps', 'labels'])

  const [mapFeatures, setMapFeatures] = useState<GeoJSON.Feature[]>([])

  // // Map state
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
      setEditingFeature,
      startFeatureEdit,
      clearFeatureEdit
    }
  ] = useMapStateContext<EmergencyProps>()

  // MapDraw
  const mapDrawRef = useRef<MapDrawRefProps>(null)

  const { displayMessage, displayWarningSnackbar } = useSnackbars()

  const { mapTheme, transformRequest } = useMapPreferences()
  const mapViewRef = useRef<InteractiveMap>(null)
  const customGetCursor = ({ isDragging, isHovering }: ExtraState) =>
    isDragging ? 'all-scroll' : isHovering ? 'pointer' : 'auto'

  // useEffect(() => {
  //   if (customMapMode){
  //     setMapMode(customMapMode)
  //   }
  // }, [customMapMode])

  return (
    <MapContainer initialHeight={window.innerHeight} style={{ height: '110%', top: 0 }}>
      <InteractiveMap
        {...viewport}
        doubleClickZoom={false}
        mapStyle={mapTheme?.style}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        transformRequest={transformRequest}
        clickRadius={CLICK_RADIUS}
        // onLoad={onMapLoad}
        // interactiveLayerIds={mapLayers}
        // onHover={(evt) => console.debug('Map: mouse Hover', evt)}
        // onMouseEnter={() => {setMapMode('edit')}}
        // onMouseLeave={onMouseLeave}
        onClick={() => {
          if (!customMapMode) {
            setMapMode('edit')
          } else {
            setMapMode('editPoint')
          }
        }}
        // onDblClick={onMapDoubleClick}
        // onContextMenu={onContextMenu}
        ref={mapViewRef}
        width="100%"
        height="100%" //was  height="calc(100% + 30px)"
        getCursor={customGetCursor}
      >
        <MapDraw
          ref={mapDrawRef}
          features={mapFeatures}
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
              } else if (mapMode === 'edit' || mapMode === 'editPoint') {
                if (data.length > 1) {
                  data.shift()
                }

                // shall we also handle multi polygon?
                const editingFeatureType = 'MapRequest'
                //if (editingFeatureType !== null) {
                setEditingFeature({
                  type: editingFeatureType,
                  id: 'mapRequestEditingArea',
                  area: null,
                  collection: null
                })
                if (customMapMode) {
                  const featurePoint = data[0] as GeoJSON.Feature<GeoJSON.Point>
                  const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Point> = {
                    type: 'FeatureCollection',
                    features: []
                  }
                  featureCollection.features.push(featurePoint)
                  startFeatureEdit(
                    editingFeatureType,
                    'mapRequestEditingArea',
                    null,
                    featureCollection
                  )
                } else {
                  const featurePolygon = data[0] as GeoJSON.Feature<GeoJSON.Polygon>
                  startFeatureEdit(
                    editingFeatureType,
                    'mapRequestEditingArea',
                    featurePolygon,
                    null
                  ) // editingFeatureId
                }
                setMapFeatures(data)
              }
            }
          }}
        />
        {/* Map controls */}
        <GeolocateControl
          // ref={geolocationControlsRef}
          label={t('maps:show_my_location')}
          style={geolocateStyle}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
        />
        <div className="controls-contaniner" style={{ top: 0 }}>
          <NavigationControl />
        </div>
        <div className="controls-contaniner" style={{ bottom: 0 }}>
          <ScaleControl />
        </div>
      </InteractiveMap>
    </MapContainer>
  )
}

export default MapRequestDrawFeature
