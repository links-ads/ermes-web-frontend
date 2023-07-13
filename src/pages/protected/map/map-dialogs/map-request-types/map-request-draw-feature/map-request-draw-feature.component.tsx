import { useEffect, useRef, useState } from 'react'
import { MapContainer } from '../../../common.components'
import InteractiveMap, {
  ExtraState,
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  Source,
  Layer
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
import { red } from '@material-ui/core/colors'

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
  const { customMapMode, lineIdx } = props

  const { t } = useTranslation(['maps', 'labels'])

  const [mapFeatures, setMapFeatures] = useState<GeoJSON.Feature[]>([])
  const [ featureCollection, setFeatureCollection ] = useState<GeoJSON.FeatureCollection<GeoJSON.Point | GeoJSON.LineString>>({
    type: 'FeatureCollection',
    features: []
  })

  // GeoJSON source Ref
  const geoJSONPointsSourceRef = useRef(null)

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

  useEffect(() => {
    if (customMapMode){
      setMapMode(customMapMode)
    }
  }, [customMapMode])

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
            setMapMode(customMapMode)
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
              } else if (mapMode === 'edit') {
                // shall we also handle multi polygon?
                const editingFeatureType = 'MapRequest'
                //if (editingFeatureType !== null) {
                setEditingFeature({
                  type: editingFeatureType,
                  id: 'mapRequestEditingArea',
                  area: null,
                  collection: null
                })
                if (data.length > 1) {
                  data.shift()
                }
                const featurePolygon = data[0] as GeoJSON.Feature<GeoJSON.Polygon>
                  startFeatureEdit(
                    editingFeatureType,
                    'mapRequestEditingArea',
                    featurePolygon,
                    null
                  ) // editingFeatureId

                  setMapFeatures(data)                
              }
              else if (mapMode === 'editPoint' || mapMode === 'editLine'){
                const editingFeatureType = 'MapRequest'
                setEditingFeature({
                  type: editingFeatureType,
                  id: 'mapRequestEditingArea',
                  area: null,
                  collection: null
                })
                const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Point | GeoJSON.LineString> = {
                  type: 'FeatureCollection',
                  features: []
                }
                if (mapMode === 'editPoint'){
                  let pointIdx = 0
                  if (data.length > 1) {
                    const prevPointIdx = data.findIndex((e) => e.geometry.type === 'Point')                    
                    data.splice(prevPointIdx, 1)
                    pointIdx = data.findIndex((e) => e.geometry.type === 'Point')
                  }
                  const featurePoint = data[pointIdx] as GeoJSON.Feature<GeoJSON.Point>
                  featureCollection.features.push(featurePoint)
                  // keep lines drawn
                  const prevLines = data.filter((e) => e.geometry.type === 'LineString') as GeoJSON.Feature<GeoJSON.LineString>[]
                  featureCollection.features.push.apply(featureCollection.features, prevLines)
                  setFeatureCollection(featureCollection)
                }
                else {
                  const featurePoint = data.find((e) => e.geometry.type === 'Point') as GeoJSON.Feature<GeoJSON.Point>
                  
                  let prevLines = data.filter((e) => e.geometry.type === 'LineString')
                  const prevLinesLength = prevLines.length
                  if(prevLinesLength === 1){
                    // add index of corresponding boundary condition
                    const lineToMark = prevLines[0] as GeoJSON.Feature<GeoJSON.LineString>
                    lineToMark.properties = { boundaryConditionIdx: lineIdx }
                    prevLines[0] = lineToMark
                    // update data
                    const toUdpdateIdx = data.findIndex((e) => e.geometry.type === 'LineString')
                    data[toUdpdateIdx] = lineToMark
                  }
                  else if(prevLinesLength > 1) {
                    const lineToUpdateIdx = prevLines.findIndex((e) => e.properties && e.properties.boundaryConditionIdx === lineIdx)
                    if (lineToUpdateIdx > -1){
                      // element found - update with last one
                      prevLines[lineToUpdateIdx] = prevLines[prevLinesLength - 1] as GeoJSON.Feature<GeoJSON.LineString>
                      prevLines.pop()
                      prevLines[lineToUpdateIdx].properties = { boundaryConditionIdx: lineIdx }
                      // update data
                      const toUdpdateIdx = data.findIndex((e) => e.properties && e.properties.boundaryConditionIdx === lineIdx)
                      const dataLength = data.length
                      data[toUdpdateIdx] = data[dataLength - 1]
                      data[toUdpdateIdx].properties = { boundaryConditionIdx: lineIdx }
                      data.pop()
                    }
                    else {
                      // no element found - add properties to last one (meaning new line added)
                      const lineToMark = prevLines[prevLinesLength - 1] as GeoJSON.Feature<GeoJSON.LineString>
                      lineToMark.properties = { boundaryConditionIdx: lineIdx }
                      prevLines[prevLinesLength - 1] = lineToMark
                      // update data
                      const toUdpdateIdx = data.findIndex((e) => e.geometry.type === 'LineString' && !e.properties)
                      data[toUdpdateIdx] = lineToMark
                    }
                  }
                  if (prevLines){
                    featureCollection.features = prevLines as GeoJSON.Feature<GeoJSON.Point | GeoJSON.LineString, GeoJsonProperties>[]
                  }
                  featureCollection.features.push(featurePoint)
                  setFeatureCollection(featureCollection)
                }
                startFeatureEdit(
                  editingFeatureType,
                  'mapRequestEditingArea',
                  null,
                  featureCollection
                )
                setMapFeatures(featureCollection.features)
              }
            }
          }}
        />
        {/** PUT ONLY EDITOR HERE AND SELECT OUTSIDE */}
        {/* GeoJSON Features (points) */}
        <Source
          id='pointSource'
          type="geojson"
          data={featureCollection as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
          ref={geoJSONPointsSourceRef}
        >
          {/* Layers here */}
          <Layer 
            id='pointLayer'
            type='circle'
            source='pointSource'
            filter={['==', ['geometry-type'], 'Point']}
            paint={{
              'circle-radius': 5,
              'circle-color': red[800]
           }}
          />
        </Source>
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
