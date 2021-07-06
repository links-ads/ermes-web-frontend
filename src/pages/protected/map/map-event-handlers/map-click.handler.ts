import { InteractiveMap, PointerEvent } from 'react-map-gl'
import { PointUpdater, ItemWithLatLng, PointLocation, MapMode } from '../map.contest'
import { Spiderifier } from '../../../../utils/map-spiderifier.utils'

/**
 * handler for left click on the map
 * @param mapViewRef
 * @param setLeftClickedFeature
 * @param setRightClickedFeature
 * @param setHoveredFeature
 * @param spiderifierRef
 * @param evt
 */
export function onMapLeftClickHandler<T extends object>(
  mapViewRef: React.RefObject<InteractiveMap>,
  mapMode: MapMode,
  setLeftClickedFeature: PointUpdater<T>,
  setRightClickedFeature: PointUpdater<T>,
  setHoveredFeature: PointUpdater<T>,
  spiderifierRef: React.MutableRefObject<Spiderifier | null>,
  evt: PointerEvent
) {
  if (mapMode !== 'browse') {
    return
  }
  console.debug('Map: mouse CLICK', evt)
  // Click intercepts also right click... :/
  // leftButton is added by react-map-gl
  if (!evt['leftButton']) {
    return
  }
  setRightClickedFeature(null)
  const features = evt.features
  const map = mapViewRef.current?.getMap()
  const clear = (map: mapboxgl.Map) => {
    setLeftClickedFeature(null)
    setRightClickedFeature(null)
    // if (spiderifierRef.current && mapViewRef.current) {
    //   spiderifierRef.current.clearSpiders(map)
    // }
  }

  if (map && Array.isArray(features) && features.length > 0) {
    // Set clicked info
    const layer = features[0]['layer']['id'] as string
    if (layer === 'unclustered-point') {
      // Cast is necessary
      const feature = features[0] as unknown as GeoJSON.Feature<GeoJSON.Point, T>
      const properties = feature.properties
      const [longitude, latitude] = feature.geometry.coordinates
      const leftClickedFeature: ItemWithLatLng<T> = { item: properties, latitude, longitude }
      setLeftClickedFeature(leftClickedFeature)
      setHoveredFeature(null)
    } else if (layer === 'clusters') {
      // Depending on settings, it will either expand the cluster or open the spider
      if (spiderifierRef.current && mapViewRef.current) {
        spiderifierRef.current.toggleSpiders(map, evt)
      }
    } else {
      // Other layer - Clear feature
      const feature = features[0] as unknown as GeoJSON.Feature<GeoJSON.Point, T>
      const properties = feature.properties
      const [longitude, latitude] = feature.geometry.coordinates
      const leftClickedFeature: ItemWithLatLng<T> = { item: properties, latitude, longitude }
      setLeftClickedFeature(leftClickedFeature)
        // clear(map)
    }
  } else {
    // Clear feature
    if (map) {
      clear(map)
    }
  }
}

/**
 * Handler for right click on the map
 * @param mapViewRef
 * @param setLeftClickedFeature
 * @param setRightClickedFeature
 * @param setHoveredFeature
 * @param spiderifierRef
 * @param evt
 */
export function onMapRightClickHandler<T extends object>(
  mapViewRef: React.RefObject<InteractiveMap>,
  mapMode: MapMode,
  isMobileDevice: boolean,
  layerIds: string[],
  setRightClickedFeature: PointUpdater<T>,
  evt: PointerEvent
) {
  if (mapMode !== 'browse') {
    return
  }
  if (isMobileDevice) {
    // TODO Check
    return
  }
  console.debug('Map: mouse CTX MENU', evt)
  if (mapViewRef.current) {
    const map = mapViewRef.current.getMap()
    // Pad right clicked pixel
    const [x, y] = evt.point
    const box: mapboxgl.PointLike[] = [
      [x - 8, y - 8],
      [x + 8, y + 8]
    ]
    const features = mapViewRef.current.queryRenderedFeatures(box, {
      layers: layerIds
    })

    const location: PointLocation = {
      latitude: evt.lngLat[1],
      longitude: evt.lngLat[0]
    }

    if (map && Array.isArray(features) && features.length > 0) {
      const layer = features[0]['layer']['id'] as string
      if (layer === 'unclustered-point') {
        // TODO Customize. Consider also that Beni dataset has no type attribute :(
        const item: T = features[0].properties as unknown as T
        const rightClickedFeature: ItemWithLatLng<T> = { item, ...location }
        setRightClickedFeature(rightClickedFeature)
      }
    }

    setRightClickedFeature(location)
  }
}
