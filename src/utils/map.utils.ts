/**
 * Add a filter for the layer id
 * Use for single points layers, e.g. highlight
 * @param map map instance
 * @param layerId layer id
 * @param featureId feature id (either feature.properties.id or feature.id must be available)
 */
export function updatePointFeatureLayerIdFilter(
  map: mapboxgl.Map,
  layerId: string,
  featureId?: string
) {
  const layerExists = !!map.getLayer(layerId)
  if (layerExists) {
    const id = featureId || 'null'
    let filter: any[] = ['all', ['!has', 'point_count'], ['==', 'id', id]]
    map.setFilter(layerId, filter)
  }
}

function makeLayerURL(layerNames, layerTime, geoServerConfig) {
  const { baseUrl, suffix, params } = geoServerConfig
  const layerName = Array.isArray(layerNames) ? layerNames.join(',') : layerNames
  let urlParams = `${composeParams(
    params
  )}&layers=${layerName}&time=${layerTime}&width=256&height=256`
  urlParams = urlParams.replace(':', '%3A')
  return `${baseUrl}/${suffix}?${urlParams}`
}

export function getLegendURL(geoServerConfig, w, h, layerName) {
  const baseUrl = geoServerConfig?.baseUrl

  const suffix = geoServerConfig?.suffix
  const params = {
    request: 'GetLegendGraphic',
    version: '1.0.0',
    format: 'image/png',
    // width: w, //w
    // height: h, //h
    layer: layerName //layerName
  }
  return `${baseUrl}/${suffix}?${composeParams(params)}`
}

export const getFeatureInfoUrl = (geoServerConfig, w, h, layerName, timestamp, mapBounds) => {
  const baseUrl = geoServerConfig?.baseUrl
  const suffix = geoServerConfig?.suffix
  const params = {
    service: 'WMS',
    request: 'GetFeatureInfo',
    version: '1.1.0',
    srs: 'EPSG:4326',
    format: 'application/json',
    info_format: 'application/json',
    width: w,
    height: h,
    layers: layerName,
    query_layers: layerName,
    time: timestamp,
    x: 50,
    y: 50,
    bbox: toBBoxString(mapBounds),
    feature_count: 50
  }
  const url = `${baseUrl}/${suffix}?${composeParams(params)}`
  return url
}

export const getGeocodingUrl = (geocodingConfig, languageCode, mapBounds, searchText) => {
  const baseUrl = geocodingConfig.apiUrl
  const suffix = geocodingConfig.endpoint
  const formattedSearchText = encodeURIComponent(searchText.replace(';', ''))
  const bbox = [...mapBounds.southWest.flat(), ...mapBounds.northEast.flat()].join(',')
  const params = {
    bbox: bbox,
    fuzzyMatch: false,
    language: languageCode,
    limit: 5,
    access_token: geocodingConfig.apiToken
  }
  const url = `${baseUrl}/${suffix}/${formattedSearchText}.json?${composeParams(params)}`
  return url
}

function composeParams(params) {
  return Object.keys(params)
    .reduce<string[]>((par: string[], key: string) => {
      par = par.concat([`${key}=${params[key]}`])
      return par
    }, [])
    .join('&')
}

function toBBoxString(lngLatBound) {
  const _southWest = lngLatBound.getSouthWest()
  const _northEast = lngLatBound.getNorthEast()
  return [_southWest.lng, _southWest.lat, _northEast.lng, _northEast.lat]
}

export function tileJSONIfy(
  map,
  tileName,
  tileTime,
  geoServerConfig: any | null = null,
  mapBounds,
  scheme = 'tms',
  useMapBounds: boolean | null = false //if true, use Europe Bbox
) {
  const bounds = useMapBounds
    ? toBBoxString(mapBounds)
    : [-19.693427946056346, 34.21573658432659, 56.19336550730233, 66.65996714846395] //TODO: move bbox inside config file
  return {
    type: 'raster',
    tilejson: '2.2.0',
    name: tileName,
    description: 'layer description...',
    version: '1.0.0',
    scheme: scheme, //xyz or tms
    tiles: [makeLayerURL(tileName, tileTime, geoServerConfig)],
    data: [],
    minzoom: map.getMinZoom(),
    maxzoom: map.getMaxZoom(),
    bounds: bounds,
    center: [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2],
    tileSize: 256
  }
}
