import React from 'react';
import { CircularProgress, Grid } from '@material-ui/core';
import mapboxgl from 'mapbox-gl'
import { Feature } from '@turf/helpers';
import { tileJSONIfy } from '../../utils/map.utils';

export const POLYGON_SOURCE_ID = 'polygon-source'
export const POLYGON_LAYER_ID = 'polygon-layer'
export const POLYGON_STROKE_ID = 'polygon-stroke'

export const POSITION_SOURCE_ID = 'position-source'
export const POSITION_LAYER_ID = 'position-point'

export const DEFAULT_MAP_VIEWPORT: { latitude: number; longitude: number; zoom: number } = {
  latitude: 45.3,
  longitude: 7.23,
  zoom: 2.5
}

export const DEFAULT_MAP_BOUNDS: { southWest: [number, number]; northEast: [number, number] } = {
  southWest: [61, 60],
  northEast: [-47, 24]
}

export const getTweetLocation = (tweet) => {
  if (tweet.location != null) return tweet.location.coordinates
  for (let entity of tweet.entities) {
    if (entity.location !== null) {
      return entity.location.coordinates
    }
  }
  return undefined
}

export const parseDataToGeoJson = (data) => {
  let featuresList = [] as GeoJSON.Feature[]
  for (let item of data) {
    let properties = {
      author:item.author,
      created_at: item.created_at,
      text: item.text,
      information_types: item.information_types,
      hazard_types: item.hazard_types,
      informative: item.informative,
      id_str: item.id_str,
      id: item.id_str
    }
    const coordinates = getTweetLocation(item)
    if (coordinates !== undefined) {
      featuresList.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates
        } as unknown as GeoJSON.Point,
        properties: properties
      } as unknown as GeoJSON.Feature)
    }
  }
  return {
    type: 'FeatureCollection',
    features: featuresList
  } as unknown as GeoJSON.FeatureCollection
}

export const parseEventDataToGeoJson = (items) => {
  let featuresList = [] as GeoJSON.Feature[]
  for (let item of items) {
    let properties = {
      id: item.id,
      hazard: String(item.hazard_id),
      name: item.name,
      lang: item.lang,
      polygon: item.hotspots.coordinates,
      center: item.hotspots_centroid.coordinates,
      started_at: item.started_at,
      updated_at: item.updated_at,
      ended_at: item.ended_at,
      last_impact_estimation_at : item.last_impact_estimation_at, 
      impact_estimation : item.impact_estimation, 
      total_area: item.hotspots.coordinates
        .map((arr) => getPolygonArea(arr[0]))
        .reduce((acc, current) => acc + current)
    }
    featuresList.push({
      type: 'Feature',
      id: item.id,
      geometry: item.hotspots_centroid as unknown as GeoJSON.Point,
      properties: properties
    } as unknown as GeoJSON.Feature)
  }
  return {
    type: 'FeatureCollection',
    features: featuresList
  } as unknown as GeoJSON.FeatureCollection
}

export const clearEventMap = (map: mapboxgl.Map, setLeftClickState, leftClickState) => {
  if (leftClickState.showPoint)
    setLeftClickState({
      showPoint: false,
      clickedPoint: null,
      pointFeatures: { ...leftClickState.pointFeatures }
    })
  // if (spiderifierRef.current) {
  //     spiderifierRef.current.clearSpiders(map)
  //   }
  removePolyToMap(map)
}

export const parseEvent = (features) => {
  return {
    ...features,
    hazard_id: features['hazard'],
    updated_at: features['updated_at'] === 'null' ? null : features['updated_at'],
    ended_at: features['ended_at'] === 'null' ? null : features['ended_at'],
    last_impact_estimation_at: features['last_impact_estimation_at'] === 'null' ? null : features['last_impact_estimation_at'],
    impact_estimation : JSON.parse(features['impact_estimation'])
  }
}

export const parseTweet = (features) => {
  const tweet = {
    ...features,
    hazard_types: JSON.parse(features['hazard_types']),
    information_types: JSON.parse(features['information_types']),
    informative: features['informative'] === 'null' ? null : features['informative'],
    author:JSON.parse(features['author'])
  }
  return tweet
}

export const getPolygonArea = (coordinates) => {
  let area = 0
  const n = coordinates.length
  for (var i = 0; i < n - 1; i++) {
    area += coordinates[i][0] * coordinates[i + 1][1] - coordinates[i][1] * coordinates[i + 1][0]
  }

  if (n > 2) {
    area += coordinates[n - 1][0] * coordinates[0][1] - coordinates[n - 1][1] * coordinates[0][0]
  }

  area = Math.abs(area / 2)
  return area
}

export const getBboxSizeFromZoom = (zoom: number) => {
  if (!zoom) return 100
  if (zoom < 3) return 100
  if (zoom < 5) return 150
  if (zoom < 7) return 200
  if (zoom < 9) return 200
  if (zoom < 10) return 250
  if (zoom < 11) return 300
  if (zoom < 12) return 350
  if (zoom < 13) return 400
  if (zoom < 14) return 450
  if (zoom < 15) return 500
  else return 700
}

const clipBounds = (bounds: number[]) => {
  for (let i = 0; i < bounds.length; i++) {
    bounds[i] = Math.max(-180, Math.min(bounds[i], 180))
  }
  return bounds
}

export const getMapBounds = (mapRef) => {
  let map = mapRef?.current?.getMap()
  if (!map)
    return {
      southWest: undefined,
      northEast: undefined
    }
  var bounds = map.getBounds().toArray()
  return {
    southWest: clipBounds(bounds[0]) as [number, number],
    northEast: clipBounds(bounds[1]) as [number, number]
  }
}
export const getMapZoom = (mapRef) => {
  let map = mapRef?.current?.getMap()
  if (!map)
    return undefined
  return map.getZoom()
}
export const queryHoveredFeature = (
  map,
  coord,
  layers,
  pointLayer,
  clusterLayer,
  elementId,
  elementType
): { type: 'leaf' | 'point' | 'cluster' | null; id: string | number | null; source?: string } => {
  const point = map.project(coord)
  const bboxSize = getBboxSizeFromZoom(map.getZoom())
  var bbox = [
    [point.x - bboxSize / 2, point.y - bboxSize / 2],
    [point.x + bboxSize / 2, point.y + bboxSize / 2]
  ]
  var features = map.queryRenderedFeatures(bbox, { layers: layers })
  if (features.length > 0) {
    // filter features that match the id of the entity
    // for events and tweets there's no need to add a check on the entity type
    const clusterFeatures = features.filter(
      (point) => point.layer.id === clusterLayer && (!elementType || point.properties[elementType] > 0)
    )
    const pointFeatures = features.filter(
      (point) => point.layer.id === pointLayer && point.properties['id'] === elementId && (!elementType || point.properties['type'] === elementType)
    )
    const leavesFeatures = features.filter(
      (point) =>
        point.layer.id.includes('spider-leaves') &&
        point.properties['id'] === elementId &&
        (!elementType || point.properties['type'] === elementType)
    )
    if (leavesFeatures.length > 0) {
      const feature = leavesFeatures[0]
      return {
        type: 'leaf',
        id: feature.id !== undefined ? feature.id : feature.properties['id'],
        source: feature.source
      }
    } else if (pointFeatures.length > 0) {
      const feature = pointFeatures[0]
      return { type: 'point', id: feature.id !== undefined ? feature.id : feature.properties['id'] }
    } else if (clusterFeatures.length === 1) {
      const feature = clusterFeatures[0]
      return { type: 'cluster', id: feature.id }
    } else {
      var minDist = Number.POSITIVE_INFINITY
      var id = -1
      for (let i = 0; i < clusterFeatures.length; i++) {
        var currentDist = distance(coord, clusterFeatures[i].geometry.coordinates)
        if (currentDist < minDist) {
          minDist = currentDist
          id = clusterFeatures[i].id
        }
      }
      return { type: 'cluster', id: id }
    }
  } else {
    return {
      type: null,
      id: null
    }
  }
}

const distance = (a, b) => {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}

export const removePolyToMap = (map) => {
  let s = map.getSource(POLYGON_SOURCE_ID) as mapboxgl.GeoJSONSource
  if (s) {
    if (map.getLayer(POLYGON_LAYER_ID)) {
      map.removeLayer(POLYGON_LAYER_ID)
    }
    if (map.getLayer(POLYGON_STROKE_ID)) {
      map.removeLayer(POLYGON_STROKE_ID)
    }
    map.removeSource(POLYGON_SOURCE_ID)
  }
}

export const drawPolyToMap = (
  map: mapboxgl.Map | undefined,
  centroid: { latitude: number; longitude: number },
  feature: Feature,
  fillColor: mapboxgl.Expression | string
) => {
  if (!feature || !centroid.latitude || !centroid.longitude) return
  if (!map) return
  const source_data = {
    type: 'FeatureCollection',
    features: [feature]
  } as GeoJSON.FeatureCollection
  let s = map.getSource(POLYGON_SOURCE_ID) as mapboxgl.GeoJSONSource

  if (s === undefined) {
    map.addSource(POLYGON_SOURCE_ID, {
      type: 'geojson',
      data: source_data
    })
  } else {
    s.setData(source_data)
  }

  if (map.getLayer(POLYGON_LAYER_ID) === undefined && feature.geometry.type !== 'GeometryCollection') {
    map.addLayer({
      id: POLYGON_LAYER_ID,
      type: 'fill',
      source: POLYGON_SOURCE_ID,
      layout: {},
      paint: {
        'fill-color': fillColor, // blue color fill
        'fill-opacity': 0.5
      }
    })
  }

  if (map.getLayer(POLYGON_STROKE_ID) === undefined) {
    map.addLayer({
      id: POLYGON_STROKE_ID,
      type: 'line',
      source: POLYGON_SOURCE_ID,
      layout: {},
      paint: {
        'line-color': fillColor, // blue color fill
        'line-width': 2
      }
    })
  }
  
  map.fitBounds(
    [
      [centroid.longitude, centroid.latitude], // southwestern corner of the bounds
      [centroid.longitude, centroid.latitude] // northeastern corner of the bounds
    ],
    {
      padding: 150,
      zoom: map.getZoom()
    },
    {
      how: 'fly'
    }
  )
}

// add layer when user clicks on a point 
export const addUserClickedPoint = (
  map: mapboxgl.Map | undefined,
  longitude: number,
  latitude: number
) => {
  if (!map) return
  const source_data = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        properties: {
          id: 'user-position'
        }
      }
    ]
  } as unknown as GeoJSON.FeatureCollection

  let s = map.getSource(POSITION_SOURCE_ID) as mapboxgl.GeoJSONSource

  if (s === undefined) {
    map.addSource(POSITION_SOURCE_ID, {
      type: 'geojson',
      data: source_data
    })
  } else {
    s.setData(source_data)
  }

  if (map.getLayer(POSITION_LAYER_ID) === undefined) {
    map.addLayer({
      id: POSITION_LAYER_ID,
      type: 'symbol',
      source: POSITION_SOURCE_ID,
      layout: {
        'icon-image': 'position-pin',
        'icon-allow-overlap': true,
        'icon-size': 1.5,
        'icon-anchor': 'bottom-right' // use bottom with regular pins
      },
      paint: {}
    })
  }
}

// remove added layer at user's click
export const removeUserClickedPoint = (map) => {
  let s = map.getSource(POSITION_SOURCE_ID) as mapboxgl.GeoJSONSource
  if (s) {
    if (map.getLayer(POSITION_LAYER_ID)) {
      map.removeLayer(POSITION_LAYER_ID)
    }    
    if (map.getLayer(POLYGON_STROKE_ID)) {
      map.removeLayer(POLYGON_STROKE_ID)
    }
    map.removeSource(POSITION_SOURCE_ID)
  }
  let ps = map.getSource(POLYGON_SOURCE_ID) as mapboxgl.GeoJSONSource
  if (ps) {
    if (map.getLayer(POLYGON_LAYER_ID)) {
      map.removeLayer(POLYGON_LAYER_ID)
    }
    if (map.getLayer(POLYGON_STROKE_ID)) {
      map.removeLayer(POLYGON_STROKE_ID)
    }
    map.removeSource(POLYGON_SOURCE_ID)
  }
}

export const paintMapWithLayer = (map, selectedLayer, geoServerConfig) => {
  const layerName = selectedLayer.activeLayer + '-' + selectedLayer.dateIndex
  if (layerName != '' && !map.getLayer(layerName)) {
    const source = tileJSONIfy(
      map,
      selectedLayer.activeLayer,
      selectedLayer.availableTimestamps[selectedLayer.dateIndex],
      geoServerConfig,
      map.getBounds()
    )
    source['properties'] = {
      format: undefined,
      fromTime: undefined,
      toTime: undefined
    }
    if (!map.getSource(layerName)) {
      map.addSource(layerName, source as mapboxgl.RasterSource)
    }
    map.addLayer(
      {
        id: layerName,
        type: 'raster',
        source: layerName
      },
      'clusters'
    )
    map.setPaintProperty(layerName, 'raster-opacity', selectedLayer.opacity / 100)
  }
}

export const removeLayerFromMap = (map, toRemoveLayer) => {
  const removeLayerName = toRemoveLayer.layerName + '-' + toRemoveLayer.layerDateIndex
  if (map.getLayer(removeLayerName)) {
    map.removeLayer(removeLayerName)
  }
  if (map.getSource(removeLayerName)) {
    map.removeSource(removeLayerName)
  }
}

export const MapLoadingDiv = (props) => {
  return props.isLoading && (
      <Grid style={{
        position: 'absolute', zIndex: 10, height:'100%', backgroundColor: 'black', opacity: 0.65
      }}
        container justifyContent='center' alignItems='center'>
        <Grid item style={{ top: '40%', left: '40%' }}>
          <CircularProgress size={100} thickness={4} />
        </Grid>
      </Grid>
  )
}

