import { useContext, useEffect, useRef, useState } from 'react'
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
import { EmergencyColorMap, EmergencyProps } from '../../../api-data/emergency.component'
import { MapDraw, MapDrawRefProps } from '../../../map-draw.components'
import { GeoJsonProperties } from 'geojson'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MapMode, useMapStateContext } from '../../../map.context'
import { blue, cyan, orange, pink, purple, red, yellow } from '@material-ui/core/colors'
import { Color } from '@material-ui/lab'
import { MapRequestType } from 'ermes-backoffice-ts-sdk'
import { Chip, IconButton, Theme, Tooltip, createStyles, makeStyles } from '@material-ui/core'
import { featureCollection as createFeatureCollection } from '@turf/helpers'
import MapGeocoderSearchButton from '../../../map-geocoder-search-button.component'
import {
  manageUserClickedPoint,
  placePositionPin
} from '../../../map-event-handlers/map-click.handler'
import { getMapBounds } from '../../../../../../common/map/map-common'
import { getClickedPointPinBySource } from '../../../api-data/emergency.layers'
import { onMapSoftLoadHandler } from '../../../map-event-handlers/map-load.handler'
import {
  ContainerSize,
  ContainerSizeContext
} from '../../../../../../common/size-aware-container.component'
import styled from 'styled-components'
import { LocationOff } from '@material-ui/icons'

// Click Radius (see react-map-gl)
const CLICK_RADIUS = 4

export const lineColors = {
  0: cyan[800],
  1: blue[600],
  2: yellow[600],
  3: orange[600],
  4: pink[600],
  5: purple[600]
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapCoorZoom: {
      zIndex: 97,
      top: 10,
      right: 10,
      position: 'absolute',
      color: '#fff',
      backgroundColor: '#333'
    }
  })
)

const ClearPinButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  width: 100%;
`

const ClearPinBtn = (props) => {
  const { t } = useTranslation(['maps', 'labels'])
  const { clearPinFromMap, disabled } = props
  return (
    <ClearPinButtonContainer>
      <Tooltip title={t('maps:clearPin') ?? 'Clear pin'}>
        <span>
          <IconButton
            onClick={clearPinFromMap}
            aria-label="clear-pin-button"
            className="mapboxgl-ctrl-icon"
            disabled={disabled}
          >
            <LocationOff fontSize="small" color={disabled ? 'disabled' : 'inherit'} />
          </IconButton>
        </span>
      </Tooltip>
    </ClearPinButtonContainer>
  )
}

const MapRequestDrawFeature: React.FC<{
  mapRequestType: MapRequestType
  customMapMode?: MapMode
  lineIdx?: number
  areaSelectedAlertHandler: React.Dispatch<React.SetStateAction<Color>>
  mapSelectionCompletedHandler: () => void
  mapSelectionNotCompletedHandler: () => void
  setMapAreaHandler: (area: any) => void
  setBoundaryLineHandler?: (idx: any, line: any) => void
  toRemoveLineIdx?: number
  setToRemoveLineIdx?: React.Dispatch<React.SetStateAction<number>>
  toRemoveBoundaryConditionIdx?: number
  setToRemoveBoundaryConditionIdx?: React.Dispatch<React.SetStateAction<number>>
  boundaryLinesTot?: number
  mapSelectedFeatures: any[]
}> = (props) => {
  const {
    mapRequestType,
    customMapMode,
    lineIdx,
    areaSelectedAlertHandler,
    mapSelectionCompletedHandler,
    mapSelectionNotCompletedHandler,
    setMapAreaHandler,
    setBoundaryLineHandler,
    toRemoveLineIdx,
    setToRemoveLineIdx,
    toRemoveBoundaryConditionIdx,
    setToRemoveBoundaryConditionIdx,
    boundaryLinesTot,
    mapSelectedFeatures
  } = props

  const classes = useStyles()
  const { t } = useTranslation(['maps', 'labels'])

  const [mapFeatures, setMapFeatures] = useState<GeoJSON.Feature[]>(mapSelectedFeatures ?? [])
  const [featureCollection, setFeatureCollection] = useState<
    GeoJSON.FeatureCollection<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
  >(
    createFeatureCollection<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>(
      mapSelectedFeatures ?? []
    )
  )
  const [mapHeadDrawerCoordinates, setMapHeadDrawerCoordinates] = useState([] as any[])

  const containerSize = useContext<ContainerSize>(ContainerSizeContext)

  const [clearActive, setClearActive] = useState<boolean>(false)

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
      clearFeatureEdit,
      setGoToCoord
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

  useEffect(() => {
    if (mapSelectedFeatures && mapSelectedFeatures.length > 0) {
      let featCollection
      if (
        mapRequestType === MapRequestType.FIRE_AND_BURNED_AREA ||
        mapRequestType === MapRequestType.FLOODED_AREA ||
        mapRequestType === MapRequestType.POST_EVENT_MONITORING
      ) {
        const polygonFeatures = mapSelectedFeatures.filter((e) => e.geometry.type === 'Polygon')
        setMapFeatures(polygonFeatures)
        featCollection = createFeatureCollection<
          GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon
        >(polygonFeatures)
        setFeatureCollection(featCollection)
        updateMap(featCollection)
      } else {
        setMapFeatures(mapSelectedFeatures)
        featCollection = createFeatureCollection<
          GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon
        >(mapSelectedFeatures)
      }
      setFeatureCollection(featCollection)
      updateMap(featCollection)
    }
  }, [mapSelectedFeatures])

  const updateMap = (updatedFeatureCollection) => {
    const map = mapViewRef!!.current!!.getMap()
    if (map) {
      const source = map.getSource('pointSource') as mapboxgl.GeoJSONSource
      if (source) {
        source.setData(updatedFeatureCollection)
      }
    }
  }

  const removeLine = (lineIdx: number, updateIndeces: boolean = false) => {
    const removeIdx = featureCollection.features.findIndex(
      (e) => e.properties && e.properties.boundaryConditionIdx === lineIdx
    )
    let updatedFeatureCollection = featureCollection
    if (updateIndeces) {
      // update other indeces - only if a boundary condition has been removed
      updatedFeatureCollection.features = updatedFeatureCollection.features.map((e) => {
        if (e.properties && e.properties.boundaryConditionIdx > lineIdx) {
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
    }
    if (removeIdx > -1) {
      // remove deleted element
      updatedFeatureCollection.features.splice(removeIdx, 1)
    }
    setFeatureCollection(updatedFeatureCollection)
    setMapFeatures(updatedFeatureCollection.features)
    setMapMode('browse')
    // update map
    updateMap(updatedFeatureCollection)
  }

  useEffect(() => {
    if (toRemoveLineIdx !== undefined && toRemoveLineIdx > -1 && setToRemoveLineIdx) {
      removeLine(toRemoveLineIdx)
      setToRemoveLineIdx(-1)
    }
  }, [toRemoveLineIdx])

  useEffect(() => {
    if (
      toRemoveBoundaryConditionIdx &&
      toRemoveBoundaryConditionIdx > -1 &&
      setToRemoveBoundaryConditionIdx
    ) {
      removeLine(toRemoveBoundaryConditionIdx, true)
      setToRemoveBoundaryConditionIdx(-1)
    }
  }, [toRemoveBoundaryConditionIdx])

  useEffect(() => {
    if (
      mapRequestType === MapRequestType.FIRE_AND_BURNED_AREA ||
      mapRequestType === MapRequestType.FLOODED_AREA ||
      mapRequestType === MapRequestType.POST_EVENT_MONITORING
    ) {
      if (mapFeatures.find((e) => e.geometry.type === 'Polygon')) {
        areaSelectedAlertHandler('success')
        mapSelectionCompletedHandler()
      } else {
        areaSelectedAlertHandler('info')
        mapSelectionNotCompletedHandler()
      }
    } else {
      if (
        mapFeatures.filter((e) => e && e.geometry.type === 'LineString').length !== boundaryLinesTot
      ) {
        areaSelectedAlertHandler('info')
        mapSelectionNotCompletedHandler()
      } else if (
        mapFeatures.find((e) => e.geometry.type === 'Point' || e.geometry.type === 'Polygon') &&
        mapFeatures.filter((e) => e && e.geometry.type === 'LineString').length === boundaryLinesTot
      ) {
        areaSelectedAlertHandler('success')
        mapSelectionCompletedHandler()
      }
    }
  }, [boundaryLinesTot, mapFeatures])

  const getLineColor = (lineIdx) => {
    return lineColors[lineIdx > 5 ? lineIdx % 6 : lineIdx]
  }

  const markSearchLocation = (latitude, longitude) => {
    setGoToCoord({ latitude: latitude, longitude: longitude })
    const map = mapViewRef.current?.getMap()
    placePositionPin(map, longitude, latitude, setMapHeadDrawerCoordinates, setClickedPoint)
    setClearActive(true)
  }

  const getMapBBox = () => {
    const bounds = getMapBounds(mapViewRef)
    return bounds
  }

  const onMapLoad = () => {
    onMapSoftLoadHandler(mapViewRef, EmergencyColorMap, viewport, containerSize, setViewport)
  }

  const clearPinFromMapHandler = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    manageUserClickedPoint(
      mapViewRef.current?.getMap(),
      evt,
      setMapHeadDrawerCoordinates,
      setClickedPoint
    )
    setClearActive(false)
  }

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

  return (
    mapFeatures &&
    featureCollection && (
      <MapContainer initialHeight={window.innerHeight} style={{ height: '110%', top: 0 }}>
        <InteractiveMap
          {...viewport}
          doubleClickZoom={false}
          mapStyle={mapTheme?.style}
          onViewportChange={(nextViewport) => setViewport(nextViewport)}
          transformRequest={transformRequest}
          clickRadius={CLICK_RADIUS}
          onLoad={onMapLoad}
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
                const editingFeatType = 'MapRequest'
                const editingFeatId = 0
                if (
                  mapRequestType === MapRequestType.FIRE_AND_BURNED_AREA ||
                  mapRequestType === MapRequestType.FLOODED_AREA ||
                  mapRequestType === MapRequestType.POST_EVENT_MONITORING
                ) {
                  if (mapMode === 'edit') {
                    // draw polygon
                    setEditingFeature({
                      type: editingFeatType,
                      id: editingFeatId,
                      area: null,
                      collection: null
                    })
                    let polygonFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
                      type: 'FeatureCollection',
                      features: []
                    }
                    if (data.length > 1) {
                      // keep only one polygon at a time
                      data.shift()
                    }
                    const featurePolygon = data[0] as GeoJSON.Feature<GeoJSON.Polygon>
                    startFeatureEdit(editingFeatType, editingFeatId, featurePolygon, null)
                    polygonFeatureCollection.features.push(featurePolygon)
                    setFeatureCollection(polygonFeatureCollection)
                    setMapFeatures(data)
                    areaSelectedAlertHandler('success')
                    mapSelectionCompletedHandler()
                    setMapAreaHandler(featurePolygon)
                  }
                } else {
                  // draw polygon
                  setEditingFeature({
                    type: editingFeatType,
                    id: editingFeatId,
                    area: null,
                    collection: null
                  })
                  let pointOrPolygonAndLinesFeatureCollection: GeoJSON.FeatureCollection<
                    GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon
                  > = {
                    type: 'FeatureCollection',
                    features: []
                  }

                  if (mapMode === 'edit' || mapMode === 'editPoint') {
                    const points = data.filter(
                      (e) => e.geometry.type === 'Polygon' || e.geometry.type === 'Point'
                    ) as GeoJSON.Feature<GeoJSON.Point>[]
                    let pointIdx = 0
                    if (points.length > 1) {
                      // keep one point at a time
                      const prevPointIdx = data.findIndex(
                        (e) => e.geometry.type === 'Point' || e.geometry.type === 'Polygon'
                      )
                      data.splice(prevPointIdx, 1)
                    }
                    pointIdx = data.findIndex(
                      (e) => e.geometry.type === 'Point' || e.geometry.type === 'Polygon'
                    )
                    const featurePoint = data[pointIdx] as GeoJSON.Feature<GeoJSON.Polygon>
                    pointOrPolygonAndLinesFeatureCollection.features.push(featurePoint)
                    // keep lines drawn
                    const prevLines = data.filter(
                      (e) => e.geometry.type === 'LineString'
                    ) as GeoJSON.Feature<GeoJSON.LineString>[]
                    pointOrPolygonAndLinesFeatureCollection.features.push.apply(
                      pointOrPolygonAndLinesFeatureCollection.features,
                      prevLines
                    )
                    setFeatureCollection(pointOrPolygonAndLinesFeatureCollection)
                    setMapAreaHandler(featurePoint)
                  } else {
                    const featurePointOrPolygon = data.find(
                      (e) => e.geometry.type === 'Point' || e.geometry.type === 'Polygon'
                    ) as GeoJSON.Feature<GeoJSON.Point | GeoJSON.Polygon>

                    let prevLines = data.filter((e) => e.geometry.type === 'LineString')
                    const prevLinesLength = prevLines.length
                    if (prevLinesLength === 1) {
                      // add index of corresponding boundary condition
                      const lineToMark = prevLines[0] as GeoJSON.Feature<GeoJSON.LineString>
                      lineToMark.properties = {
                        boundaryConditionIdx: lineIdx,
                        color: getLineColor(lineIdx)
                      }
                      if (setBoundaryLineHandler) setBoundaryLineHandler(lineIdx, lineToMark)
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
                          color: getLineColor(lineIdx)
                        }
                        // update data
                        const toUdpdateIdx = data.findIndex(
                          (e) => e.properties && e.properties.boundaryConditionIdx === lineIdx
                        )
                        const dataLength = data.length
                        data[toUdpdateIdx] = data[dataLength - 1]
                        data[toUdpdateIdx].properties = {
                          boundaryConditionIdx: lineIdx,
                          color: getLineColor(lineIdx)
                        }
                        if (setBoundaryLineHandler)
                          setBoundaryLineHandler(lineIdx, data[toUdpdateIdx])
                        data.pop()
                      } else {
                        // no element found - add properties to last one (meaning new line added)
                        const lineToMark = prevLines[
                          prevLinesLength - 1
                        ] as GeoJSON.Feature<GeoJSON.LineString>
                        lineToMark.properties = {
                          boundaryConditionIdx: lineIdx,
                          color: getLineColor(lineIdx)
                        }
                        if (setBoundaryLineHandler) setBoundaryLineHandler(lineIdx, lineToMark)
                        prevLines[prevLinesLength - 1] = lineToMark
                        // update data
                        const toUdpdateIdx = data.findIndex(
                          (e) =>
                            e.geometry.type === 'LineString' &&
                            (!e.properties || e.properties.boundaryConditionIdx === lineIdx)
                        )
                        data[toUdpdateIdx] = lineToMark
                      }
                    }
                    if (prevLines) {
                      pointOrPolygonAndLinesFeatureCollection.features =
                        prevLines as GeoJSON.Feature<
                          GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon,
                          GeoJsonProperties
                        >[]
                    }
                    if (featurePointOrPolygon) {
                      pointOrPolygonAndLinesFeatureCollection.features.push(featurePointOrPolygon)
                    }
                    setFeatureCollection(pointOrPolygonAndLinesFeatureCollection)
                  }
                  startFeatureEdit(
                    editingFeatType,
                    editingFeatId,
                    null,
                    pointOrPolygonAndLinesFeatureCollection
                  )
                  setMapFeatures(pointOrPolygonAndLinesFeatureCollection.features)

                  if (
                    pointOrPolygonAndLinesFeatureCollection.features.find(
                      (e) => e.geometry.type === 'Point' || e.geometry.type === 'Polygon'
                    ) &&
                    pointOrPolygonAndLinesFeatureCollection.features.filter(
                      (e) => e.geometry.type === 'LineString'
                    ).length === boundaryLinesTot
                  ) {
                    areaSelectedAlertHandler('success')
                    mapSelectionCompletedHandler()
                  }
                }
              }
            }}
          />
          {/** PUT ONLY EDITOR HERE AND SELECT OUTSIDE */}
          {/* GeoJSON Features (points) */}
          {featureCollection && (
            <Source
              id="pointSource"
              type="geojson"
              data={featureCollection}
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
                  'fill-color': purple[800],
                  'fill-opacity': 0.5
                }}
              />
              <Layer {...getClickedPointPinBySource('pointSource')} />
            </Source>
          )}
          {/* Map controls */}
          <Chip className={classes.mapCoorZoom} label={mapCoordinatesZoom} />
          <div className="controls-container" style={{ top: 40 }}>
            <MapGeocoderSearchButton
              getMapBBox={getMapBBox}
              markSearchLocation={markSearchLocation}
            />
            <ClearPinBtn clearPinFromMap={clearPinFromMapHandler} disabled={!clearActive} />
            <GeolocateControl
              label={t('maps:show_my_location')}
              className="mapboxgl-ctrl-geolocate"
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
            />
            <NavigationControl />
          </div>
          <div className="controls-container" style={{ bottom: 0 }}>
            <ScaleControl />
          </div>
        </InteractiveMap>
      </MapContainer>
    )
  )
}

export default MapRequestDrawFeature
