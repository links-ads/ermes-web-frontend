import { InteractiveMap, PointerEvent } from 'react-map-gl'
import { PointUpdater, ItemWithLatLng, MapMode } from '../map.contest'
import { updatePointFeatureLayerIdFilter } from '../../../../utils/map.utils'
import { Spiderifier } from '../../../../utils/map-spiderifier.utils'

/**
 * Handler for map mouse enter event
 * @param mapViewRef
 * @param isMobileDevice
 * @param setHoveredFeature
 * @param interactiveLayers
 * @param evt
 */
export function onMouseEnterHandler<T extends object>(
  mapViewRef: React.RefObject<InteractiveMap>,
  spiderifierRef: React.MutableRefObject<Spiderifier | null>,
  mapMode: MapMode,
  isMobileDevice: boolean,
  setHoveredFeature: PointUpdater<T>,
  interactiveLayers: string[],
  evt: PointerEvent
) {
  if (mapMode !== 'browse') {
    return
  }
  // Not available on mobile
  if (isMobileDevice) {
    return
  }
  if (mapViewRef.current) {
    // Pad hovered pixel
    const [x, y] = evt.point
    const box: mapboxgl.PointLike[] = [
      [x - 8, y - 8],
      [x + 8, y + 8]
    ]
    const features = mapViewRef.current.queryRenderedFeatures(box, {
      layers: interactiveLayers
    })
    const map = mapViewRef.current.getMap()
    if (features.length > 0) {
      const l = features[0]['layer']['id'] as string
      const isSpiderLeave = l.includes('spider-leaves')
      if (l === 'unclustered-point' || isSpiderLeave) {
        const feature = (features[0] as unknown) as GeoJSON.Feature<GeoJSON.Point, T>
        const properties = feature.properties
        const [longitude, latitude] = feature.geometry.coordinates
        const hoveredFeature: ItemWithLatLng<T> = { item: properties, latitude, longitude }
        setHoveredFeature(hoveredFeature)
        const id = feature.properties['id'] || feature.id
        if (isSpiderLeave && spiderifierRef.current) {
          spiderifierRef.current.highlightHoveredLeaf(map, id)
        } else {
          updatePointFeatureLayerIdFilter(map, 'unclustered-point-hovered', id)
        }
      } else if (l === 'clusters') {
        map.getCanvas().style.cursor = 'pointer'
        // set cluster as hovered
      }
    }
  }
}

/**
 * Handler for mouse leave event
 * @param mapViewRef
 * @param isMobileDevice
 * @param setHoveredFeature
 */
export function onMouseLeaveHandler<T extends object>(
  mapViewRef: React.RefObject<InteractiveMap>,
  spiderifierRef: React.MutableRefObject<Spiderifier | null>,
  isMobileDevice: boolean,
  setHoveredFeature: PointUpdater<T>
  // interactiveLayers: string[],
  // evt: PointerEvent
) {
  // Not available on mobile
  if (isMobileDevice) {
    return
  }
  if (mapViewRef.current) {
    const map = mapViewRef.current.getMap()
    updatePointFeatureLayerIdFilter(map, 'unclustered-point-hovered', 'null')
    spiderifierRef.current?.highlightHoveredLeaf(map, 'null')
    map.getCanvas().style.cursor = ''
  }

  //console.debug('Map: mouse << leave', evt)
  setHoveredFeature(null)
}
