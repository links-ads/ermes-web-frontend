export const POLYGON_SOURCE_ID = 'polygon-source'
export const POLYGON_LAYER_ID = 'polygon-layer'
export const POLYGON_STROKE_ID = 'polygon-stroke'

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
      author_display_name: item.author.display_name,
      author_user_name: item.author.user_name,
      author_profile_image: item.author.profile_image,
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
    name: features['name'],
    hazard_id: features['hazard'],
    started_at: features['started_at'],
    updated_at: features['updated_at'] === 'null' ? null : features['updated_at'],
    ended_at: features['ended_at'] === 'null' ? null : features['ended_at']
  }
}

export const parseTweet = (features) => {
  const tweet = {
    id_str: features['id_str'],
    created_at: features['created_at'],
    text: features['text'],
    hazard_types: JSON.parse(features['hazard_types']),
    information_types: JSON.parse(features['information_types']),
    author: {
      display_name: features['author_display_name'],
      user_name: features['author_user_name'],
      profile_image: features['author_profile_image']
    },
    informative: features['informative']
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

export const getZoomFromArea = (area) => {
  if (!area) return 4
  if (area < 0.0001) return 11
  if (area < 0.1) return 9
  if (area < 0.4) return 8
  if (area < 2) return 7
  if (area < 10) return 6
  if (area < 40) return 5
  if (area < 100) return 4
  if (area < 500) return 3
  else return 2.5
}

const getBboxSizeFromZoom = (zoom: number) => {
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
export const queryHoveredFeature = (map, coord, layers, pointLayer, clusterLayer, elementId, sourceId):{type:"leaf"|"point"|"cluster"|null,id:string|number|null,source?:string} => {
    const point = map.project(coord)
    const bboxSize = getBboxSizeFromZoom(map.getZoom())
    var bbox = [
        [point.x - bboxSize / 2, point.y - bboxSize / 2],
        [point.x + bboxSize / 2, point.y + bboxSize / 2]
    ]
    var features = map.queryRenderedFeatures(bbox, { layers: layers })
    if (features.length > 0) {
        // filter features that match the id of the tweet
        const clusterFeatures = features.filter(point => point.layer.id === clusterLayer)
        const pointFeatures = features.filter(point => (point.layer.id === pointLayer) && (point.properties['id'] === elementId))
        const leavesFeatures = features.filter(point => (point.layer.id.includes('spider-leaves') && (point.properties['id'] === elementId)))
        if (leavesFeatures.length > 0) {
            const feature = leavesFeatures[0]
            return { type: 'leaf', id: feature.id !== undefined ? feature.id : feature.properties['id'],source:feature.source }
        }
        else if (pointFeatures.length > 0) {
            const feature = pointFeatures[0]
            return { type: 'point', id: feature.id !== undefined ? feature.id : feature.properties['id'] }
        }
        else if (clusterFeatures.length === 1) {
            const feature = clusterFeatures[0]
            return { type: 'cluster', id: feature.id }
        }
        else {
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
  if (s && map.getLayer(POLYGON_LAYER_ID) && map.getLayer(POLYGON_STROKE_ID)) {
    map.removeLayer(POLYGON_LAYER_ID)
    map.removeLayer(POLYGON_STROKE_ID)
    map.removeSource(POLYGON_SOURCE_ID)
  }
}

export const drawPolyToMap = (map: mapboxgl.Map | undefined,
  centroid: { latitude: number, longitude: number },
  polygon: GeoJSON.MultiPolygon | GeoJSON.Polygon, properties: {},
  fillColor: mapboxgl.Expression | string) => {

  if (!map) return
  const source_data = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: polygon,
        properties: properties
      }
    ]
  } as unknown as GeoJSON.FeatureCollection

  let s = map.getSource(POLYGON_SOURCE_ID) as mapboxgl.GeoJSONSource

  if (s === undefined) {
    map.addSource(POLYGON_SOURCE_ID, {
      type: 'geojson',
      data: source_data
    })
  } else {
    s.setData(source_data)
  }

  if (map.getLayer(POLYGON_LAYER_ID) === undefined) {
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
  const zoom = getZoomFromArea(getPolygonArea(polygon.coordinates[0]))
  map
    ?.flyTo(
      {
        center: [centroid.longitude, centroid.latitude],
        zoom: zoom
      },
      {
        how: 'fly'
      }
    )
}
