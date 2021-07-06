import { parseTweet } from '../../common/map/map-common'
import { CLUSTER_LAYER_ID, SOURCE_ID, TWEETS_LAYER_ID } from './map-init'

export const mapClickHandler = (
  evt,
  mapRef,
  leftClickState,
  setLeftClickState,
  mapViewport,
  spiderifierRef
) => {
  // handle only left click
  evt.preventDefault()
  evt.stopPropagation()
  if (!evt['leftButton']) {
    return
  }
  const features = evt.features
  const map = mapRef.current?.getMap()
  const clear = (map: mapboxgl.Map) => {
    setLeftClickState({
      showPoint: false,
      clickedPoint: null,
      pointFeatures: { ...leftClickState.pointFeatures }
    })
    // if (spiderifierRef.current && mapRef.current) {
    //     spiderifierRef.current.clearSpiders(map)
    //   }
  }
  //check that a point with features has been clicked
  if (map && Array.isArray(features) && features.length > 0) {
    const layer = features[0]['layer']['id'] as string
    if (layer === TWEETS_LAYER_ID || layer.startsWith(SOURCE_ID + '-spider-leaves')) {
      // Cast is necessary
      const feature = features[0] as unknown as GeoJSON.Feature<GeoJSON.Point>
      const properties = feature.properties
      const [longitude, latitude] = feature.geometry.coordinates
      const newLeftClickState = {
        showPoint: true,
        clickedPoint: { long: longitude, lat: latitude },
        pointFeatures: parseTweet(properties)
      }
      map?.flyTo(
        {
          center: feature.geometry.coordinates,
          zoom: mapViewport.zoom
        },
        {
          how: 'fly'
        }
      )
      setLeftClickState(newLeftClickState)
    } else if (layer === CLUSTER_LAYER_ID) {
      // Depending on settings, it will either expand the cluster or open the spider
      if (spiderifierRef.current && mapRef.current) {
        spiderifierRef.current.toggleSpiders(map, evt)
      }
      setLeftClickState({
        showPoint: false,
        clickedPoint: null,
        pointFeatures: { ...leftClickState.pointFeatures }
      })
    } else {
      clear(map)
    }
  } else {
    // Clear feature
    if (map) {
      clear(map)
    }
  }
}
