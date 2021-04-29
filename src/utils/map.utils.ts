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
