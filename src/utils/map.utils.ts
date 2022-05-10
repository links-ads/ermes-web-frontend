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

export function makeTimeSeriesURL(coord,layerName,geoServerConfig,timeRange){
  const { baseUrl, suffix } = geoServerConfig
  const params = {
    service: 'WMS',
    version: '1.1.0',
    feature_count: '1',
    x: "1",
    y: "1",
    srs: "EPSG:4326",
    width: "101",
    height: "101",
    request: "GetTimeSeries",
    info_format: "text/csv",
    time: timeRange.join('/'),
    bbox: [coord[0],coord[1],coord[0]+0.00001,coord[1]+0.00001].join('%2C'),
    query_layers: layerName,
    layers: layerName,
  }
  return `${baseUrl}/${suffix}?${composeParams(params)}`

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