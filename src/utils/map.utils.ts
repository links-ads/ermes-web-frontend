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

function makeLayerURL(layerNames,layerTime, geoServerConfig) {
  const { baseUrl, suffix, params } = geoServerConfig
  const layerName = Array.isArray(layerNames) ? layerNames.join(',') : layerNames;
  let urlParams = `${composeParams(params)}&layers=${layerName}&time=${layerTime}&width=256&height=256`
  urlParams = urlParams.replace(':', '%3A')
  return `${baseUrl}/${suffix}?${urlParams}`
}

export function getLegendURL(geoServerConfig, w, h ,layerName){

   const baseUrl = geoServerConfig?.baseUrl
 
   const suffix  = geoServerConfig?.suffix
   const params = {
     request: "GetLegendGraphic",
     version: '1.0.0',
     format: "image/png",
     width: w, //w
     height: h, //h
     layer: layerName, //layerName
   }
   return `${baseUrl}/${suffix}?${composeParams(params)}`
 
 }

export const getFeatureInfoUrl = (geoServerConfig, w, h, layerNames, mapBounds) => {
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
    layers: layerNames,
    query_layers: layerNames,
    x: 1,
    y: 1,
    bbox: toBBoxString(mapBounds),
    feature_count: 50
  }
  const url = `${baseUrl}/${suffix}?${composeParams(params)}`
  return url
}


function composeParams(params) {
  return Object.keys(params)
    .reduce<string[]>(
      (par: string[], key: string) => {
        par = par.concat([`${key}=${params[key]}`]);
        return par;
      }, [])
    .join('&');
}


function toBBoxString(lngLatBound) {
  const _southWest = lngLatBound.getSouthWest();
  const _northEast = lngLatBound.getNorthEast();
  return [_southWest.lng, _southWest.lat, _northEast.lng, _northEast.lat]
}

export function tileJSONIfy(
  map,
  tileName,
  tileTime,
  geoServerConfig: any | null = null,
  mapBounds,
  scheme = 'tms',
) {
  const bounds = toBBoxString(mapBounds)
  return {
    type: 'raster',
    tilejson: '2.2.0',
    name: tileName,
    description: 'layer description...',
    version: '1.0.0',
    scheme: scheme, //xyz or tms
    tiles: [makeLayerURL(tileName,tileTime, geoServerConfig)],
    data:[],
    minzoom: map.getMinZoom(),
    maxzoom: map.getMaxZoom(),
    bounds: bounds,
    center: [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2],
    tileSize: 256
  };
}