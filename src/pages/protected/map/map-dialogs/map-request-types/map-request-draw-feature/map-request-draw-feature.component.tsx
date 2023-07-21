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
import { GeoJsonProperties } from 'geojson'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useMapStateContext } from '../../../map.contest'
import { blue, cyan, orange, pink, purple, red, yellow } from '@material-ui/core/colors'

// Click Radius (see react-map-gl)
const CLICK_RADIUS = 4
// Style for the geolocation controls
const geolocateStyle: React.CSSProperties = {
  position: 'absolute',
  top: 45,
  left: 0,
  margin: 10
}

export const lineColors = {
  0: cyan[800],
  1: blue[600],
  2: yellow[600],
  3: orange[600],
  4: pink[600],
  5: purple[600]
}

const MapRequestDrawFeature = (props) => {
  const {
    customMapMode,
    lineIdx,
    areaSelectedAlertHandler,
    mmapSelectionCompletedHandler,
    setMapAreaHandler,
    setBoundaryLineHandler,
    toRemoveLineIdx,
    setToRemoveLineIdx,
    boundaryLinesTot,
    mapSelectedFeatures
  } = props

  const { t } = useTranslation(['maps', 'labels'])

  const [mapFeatures, setMapFeatures] = useState<GeoJSON.Feature[]>([])
  const [featureCollection, setFeatureCollection] = useState<
    GeoJSON.FeatureCollection<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
  >({
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

  const { mapTheme, transformRequest } = useMapPreferences()
  const mapViewRef = useRef<InteractiveMap>(null)
  const customGetCursor = ({ isDragging, isHovering }: ExtraState) =>
    isDragging ? 'all-scroll' : isHovering ? 'pointer' : 'auto'

  useEffect(() => {
    if (customMapMode) {
      setMapMode(customMapMode)
    }
  }, [customMapMode])

  // useEffect(() => {
  //   if (mapSelectedFeatures) {
  //     const mappedFeatures = mapSelectedFeatures.map(e => { return { type: 'Feature', geometry: e, properties: {}} as GeoJSON.Feature})
  //     setMapFeatures(mappedFeatures)
  //     setFeatureCollection({
  //       type: 'FeatureCollection',
  //       features: mapSelectedFeatures
  //     })
  //     updateMap(featureCollection)
  //   }
  //     // if (!mapSelectedFeatures.type) {
  //     //   setFeatureCollection({
  //     //     type: 'FeatureCollection',
  //     //     features: mapSelectedFeatures
  //     //       ? mapSelectedFeatures.length > 1
  //     //         ? mapSelectedFeatures
  //     //         : [
  //     //             {
  //     //               type: 'Feature',
  //     //               geometry: mapSelectedFeatures,
  //     //               properties: {}
  //     //             }
  //     //           ]
  //     //       : []
  //     //   })
  //     //   updateMap(featureCollection)
  //     // }
    
  // }, [mapSelectedFeatures])

  // useEffect(() => {
  //   console.log("Map features: ")
  //   console.log(mapFeatures)
  //   console.log("Feature Collection: ")
  //   console.log(featureCollection)
  // }, [mapFeatures, featureCollection])

  const updateMap = (updatedFeatureCollection) => {
    const map = mapViewRef!!.current!!.getMap()
    if (map) {
      const source = map.getSource('pointSource') as mapboxgl.GeoJSONSource
      if (source) {
        source.setData(updatedFeatureCollection)
      }
    }
  }

  useEffect(() => {
    if (toRemoveLineIdx > -1) {
      const removeIdx = featureCollection.features.findIndex(
        (e) => e.properties && e.properties.boundaryConditionIdx === toRemoveLineIdx
      )
      let updatedFeatureCollection = featureCollection
      // update other indeces
      updatedFeatureCollection.features = updatedFeatureCollection.features.map((e) => {
        if (e.properties && e.properties.boundaryConditionIdx > toRemoveLineIdx) {
          const updatedIdx = e.properties.boundaryConditionIdx - 1
          const colorIdx = updatedIdx > 5 ? updatedIdx % 6 : updatedIdx
          return {
            ...e,
            properties: {
              boundaryConditionIdx: updatedIdx,
              color: lineColors[colorIdx]
            }
          }
        }
        return e
      })
      // remove deleted element
      updatedFeatureCollection.features.splice(removeIdx, 1)
      setFeatureCollection(updatedFeatureCollection)
      setMapFeatures(updatedFeatureCollection.features)
      setMapMode('browse')
      setToRemoveLineIdx(-1)
      // update map
      updateMap(updatedFeatureCollection)
    }
  }, [toRemoveLineIdx])

  return (
    <MapContainer initialHeight={window.innerHeight} style={{ height: '110%', top: 0 }}>
      <InteractiveMap
        {...viewport}
        doubleClickZoom={false}
        mapStyle={mapTheme?.style}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        transformRequest={transformRequest}
        clickRadius={CLICK_RADIUS}
        onClick={() => {
          if (!customMapMode) {
            setMapMode('edit')
          } else {
            setMapMode(customMapMode)
          }
        }}
        ref={mapViewRef}
        width="100%"
        height="100%"
        getCursor={customGetCursor}
      >
        <MapDraw
          ref={mapDrawRef}
          features={mapFeatures}
          onFeatureAdd={(data: GeoJSON.Feature[]) => {
            console.debug('Feature drawn!', data)
            if (mapDrawRef.current && mapViewRef.current && data.length > 0) {
              const map = mapViewRef.current.getMap()
              const editingFeatureType = 'MapRequest'
              const editingFeatureId = 0
              if (mapMode === 'edit') {
                setEditingFeature({
                  type: editingFeatureType,
                  id: editingFeatureId,
                  area: null,
                  collection: null
                })
                if (data.length > 1) {
                  data.shift()
                }
                const featurePolygon = data[0] as GeoJSON.Feature<GeoJSON.Polygon>
                startFeatureEdit(editingFeatureType, editingFeatureId, featurePolygon, null)

                setMapFeatures(data)
                areaSelectedAlertHandler('success')
                mmapSelectionCompletedHandler()
                setMapAreaHandler(featurePolygon)
              } else if (mapMode === 'editPoint' || mapMode === 'editLine') {
                const editingFeatureType = 'MapRequest'
                setEditingFeature({
                  type: editingFeatureType,
                  id: editingFeatureId,
                  area: null,
                  collection: null
                })
                const featureCollection: GeoJSON.FeatureCollection<
                  GeoJSON.Point | GeoJSON.LineString
                > = {
                  type: 'FeatureCollection',
                  features: []
                }
                if (mapMode === 'editPoint') {
                  const points = data.filter(
                    (e) => e.geometry.type === 'Point'
                  ) as GeoJSON.Feature<GeoJSON.Point>[]
                  let pointIdx = 0
                  if (points.length > 1) {
                    const prevPointIdx = data.findIndex((e) => e.geometry.type === 'Point')
                    data.splice(prevPointIdx, 1)
                  }
                  pointIdx = data.findIndex((e) => e.geometry.type === 'Point')
                  const featurePoint = data[pointIdx] as GeoJSON.Feature<GeoJSON.Point>
                  featureCollection.features.push(featurePoint)
                  // keep lines drawn
                  const prevLines = data.filter(
                    (e) => e.geometry.type === 'LineString'
                  ) as GeoJSON.Feature<GeoJSON.LineString>[]
                  featureCollection.features.push.apply(featureCollection.features, prevLines)
                  setFeatureCollection(featureCollection)
                  setMapAreaHandler(featurePoint)
                } else {
                  const featurePoint = data.find(
                    (e) => e.geometry.type === 'Point'
                  ) as GeoJSON.Feature<GeoJSON.Point>

                  let prevLines = data.filter((e) => e.geometry.type === 'LineString')
                  const prevLinesLength = prevLines.length
                  if (prevLinesLength === 1) {
                    // add index of corresponding boundary condition
                    const lineToMark = prevLines[0] as GeoJSON.Feature<GeoJSON.LineString>
                    lineToMark.properties = {
                      boundaryConditionIdx: lineIdx,
                      color: lineColors[lineIdx > 5 ? lineIdx % 6 : lineIdx]
                    }
                    setBoundaryLineHandler(lineIdx, lineToMark)
                    prevLines[0] = lineToMark
                    // update data
                    const toUdpdateIdx = data.findIndex((e) => e.geometry.type === 'LineString')
                    data[toUdpdateIdx] = lineToMark
                  } else if (prevLinesLength > 1) {
                    const lineToUpdateIdx = prevLines.findIndex(
                      (e) => e.properties && e.properties.boundaryConditionIdx === lineIdx
                    )
                    if (lineToUpdateIdx > -1) {
                      // element found - update with last one
                      prevLines[lineToUpdateIdx] = prevLines[
                        prevLinesLength - 1
                      ] as GeoJSON.Feature<GeoJSON.LineString>
                      prevLines.pop()
                      prevLines[lineToUpdateIdx].properties = {
                        boundaryConditionIdx: lineIdx,
                        color: lineColors[lineIdx > 5 ? lineIdx % 6 : lineIdx]
                      }
                      // update data
                      const toUdpdateIdx = data.findIndex(
                        (e) => e.properties && e.properties.boundaryConditionIdx === lineIdx
                      )
                      const dataLength = data.length
                      data[toUdpdateIdx] = data[dataLength - 1]
                      data[toUdpdateIdx].properties = {
                        boundaryConditionIdx: lineIdx,
                        color: lineColors[lineIdx > 5 ? lineIdx % 6 : lineIdx]
                      }
                      setBoundaryLineHandler(lineIdx, data[toUdpdateIdx])
                      data.pop()
                    } else {
                      // no element found - add properties to last one (meaning new line added)
                      const lineToMark = prevLines[
                        prevLinesLength - 1
                      ] as GeoJSON.Feature<GeoJSON.LineString>
                      lineToMark.properties = {
                        boundaryConditionIdx: lineIdx,
                        color: lineColors[lineIdx > 5 ? lineIdx % 6 : lineIdx]
                      }
                      setBoundaryLineHandler(lineIdx, lineToMark)
                      prevLines[prevLinesLength - 1] = lineToMark
                      // update data
                      const toUdpdateIdx = data.findIndex(
                        (e) => e.geometry.type === 'LineString' && !e.properties
                      )
                      data[toUdpdateIdx] = lineToMark
                    }
                  }
                  if (prevLines) {
                    featureCollection.features = prevLines as GeoJSON.Feature<
                      GeoJSON.Point | GeoJSON.LineString,
                      GeoJsonProperties
                    >[]
                  }
                  if (featurePoint) {
                    featureCollection.features.push(featurePoint)
                  }
                  setFeatureCollection(featureCollection)
                }
                startFeatureEdit(editingFeatureType, editingFeatureId, null, featureCollection)
                setMapFeatures(featureCollection.features)

                if (
                  featureCollection.features.find((e) => e.geometry.type === 'Point') &&
                  featureCollection.features.filter((e) => e.geometry.type === 'LineString')
                    .length === boundaryLinesTot
                ) {
                  areaSelectedAlertHandler('success')
                  mmapSelectionCompletedHandler()
                }
              }
            }
          }}
        />
        {/** PUT ONLY EDITOR HERE AND SELECT OUTSIDE */}
        {/* GeoJSON Features (points) */}
        <Source
          id="pointSource"
          type="geojson"
          data={featureCollection as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
          ref={geoJSONPointsSourceRef}
        >
          {/* Layers here */}
          <Layer
            id="pointLayer"
            type="circle"
            source="pointSource"
            filter={['==', ['geometry-type'], 'Point']}
            paint={{
              'circle-radius': 5,
              'circle-color': red[800]
            }}
          />
          <Layer
            id="lineLayer"
            type="line"
            source="pointSource"
            filter={['==', ['geometry-type'], 'LineString']}
            paint={{
              'line-width': 5,
              'line-color': ['get', 'color']
            }}
          />
          <Layer
            id="polygonLayer"
            type="fill"
            source="pointSource"
            filter={['==', ['geometry-type'], 'Polygon']}
            paint={{
              'fill-color': red[800],
              'fill-opacity': 0.5
            }}
          />
        </Source>
        {/* Map controls */}
        <GeolocateControl
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
