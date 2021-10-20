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

function makeLayerURL(layerNames, geoServerConfig,bbox) {
  const {baseUrl,suffix,params} = geoServerConfig
  const layerName = Array.isArray(layerNames) ? layerNames.join(',') : layerNames;
  let urlParams = `${composeParams(params)}&layers=${layerName}&bbox=${bbox.join('%2C')}`
  urlParams = urlParams.replace(':','%3A')
  // const urlParams = `${composeParams(params)}&layers=${layerName}`.replace(':','%3A')
  return `${baseUrl}/${suffix}?${urlParams}`
}


function composeParams(params) {
  return Object.keys(params)
    .reduce<string[]>(
      (par:string[], key:string) => {
        if (key !== 'bbox') 
          par = par.concat([`${key}=${params[key]}`]);
      return par;
    }, [])
    .join('&');
}

export function tileJSONIfy(
  name,
  geoServerConfig:any|null=null,
  format = 'wms',
  scheme = 'tms',
  // bounds = [-28.0,34.5,40.0,72.0],
  // bounds = [-25.0,25.5,40.000003814697266,72.0],
  bounds = [-5.0,45,30,55],
  // center = [7.91015625, 52.69766229413499],
  minzoom = 0,
  maxzoom = 24
  ) {
  return {
    attribution: "<a href='http://ireact.eu'>I-REACT</a>",
    bounds: bounds,
    maxzoom: maxzoom,
    minzoom: minzoom,
    scheme: scheme, //xyz or tms
    // tiles: [url],
    tilejson: '2.2.0',
    name: name,
    tileSize:256,
    description: 'layer description...',
    version: '1.0.0',
    tiles: [makeLayerURL(name, geoServerConfig,bounds)],
    center: [(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2]
  };
}