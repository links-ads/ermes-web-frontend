import { InteractiveMap, PointerEvent } from 'react-map-gl'
import { PointUpdater, ItemWithLatLng, PointLocation, MapMode } from '../map.context'
import { Spiderifier } from '../../../../utils/map-spiderifier.utils'
import mapboxgl from 'mapbox-gl'
import { addUserClickedPoint, removeUserClickedPoint, POSITION_LAYER_ID } from '../../../../common/map/map-common';
import { LayerSettingsState } from '../../../../models/layers/LayerState';
import { updatePointFeatureLayerIdFilter } from '../../../../utils/map.utils';
import { getBboxSizeFromZoom } from '../../../../common/map/map-common';

// add position pin at click or db click of the user 
// if position pin is placed, map head drawer shows coordinates of pin, else of the center of the map
// remove pin if user clicks on it 
const manageUserClickedPoint = (map, evt, setMapHeadDrawerCoordinates, setLeftClickedFeature) => {
  // check if users is clicking on the position point - if so, remove it
  const features = map.queryRenderedFeatures(evt.point);
  if (features && features.length > 0){
    const userFeatures = features.find( ({layer}) => layer.id === POSITION_LAYER_ID)
    if (userFeatures){
      removeUserClickedPoint(map);
      // reset coordinates (it will show coordinates of viewport)
      setMapHeadDrawerCoordinates([]);
    }    
  }
  else {
    const [longitude, latitude] = evt.lngLat
    addUserClickedPoint(map, longitude, latitude)
    // show coordinates of the point
    setMapHeadDrawerCoordinates(evt.lngLat)
    // remove clicked point
    updatePointFeatureLayerIdFilter(map, 'unclustered-point-clicked', 'null')
    // closed open feature
    setLeftClickedFeature(null)
  }
}

export const tonedownClickedPoint = (mapViewRef, setLeftClickedFeature) => {
  const map = mapViewRef.current?.getMap()
  // remove clicked point
  updatePointFeatureLayerIdFilter(map, 'unclustered-point-clicked', 'null')
  // closed open feature
  setLeftClickedFeature(null)
}

export const highlightClickedPoint = <T extends object>(
  feature,
  mapViewRef,
  spiderifierRef,
  setLeftClickedFeature
) => {
  const map = mapViewRef.current?.getMap()
  let layer = 'unclustered-point'
  const point = map.project(feature.geometry.coordinates)
  const bboxSize = getBboxSizeFromZoom(map.getZoom())
  var bbox = [
    [point.x - bboxSize / 2, point.y - bboxSize / 2],
    [point.x + bboxSize / 2, point.y + bboxSize / 2]
  ]
  const renderedFeature = map.queryRenderedFeatures(bbox)

  if (renderedFeature && renderedFeature.length > 0) {
    const layers = renderedFeature.map((e) => e.layer.id)
    if (layers.includes('clusters')) {
      layer = 'clusters'
    }
  }

  const properties = feature.properties
  const [longitude, latitude] = feature.geometry.coordinates
  const leftClickedFeature: ItemWithLatLng<T> = { item: properties, latitude, longitude }
  setLeftClickedFeature(leftClickedFeature)

  // Cast is necessary
  if (layer === 'clusters') {
    // Depending on settings, it will either expand the cluster or open the spider
    if (spiderifierRef.current && mapViewRef.current) {
      spiderifierRef.current.toggleSpidersByPoint(map, bbox)
    }
  } else {
    // layer === 'unclustered-point' and others    
    const id = feature.properties['id'] || feature.id
    updatePointFeatureLayerIdFilter(map, 'unclustered-point-clicked', id)
  }
}

/**
 * handler for left click on the map
 * @param mapViewRef
 * @param mapMode
 * @param setLeftClickedFeature
 * @param setRightClickedFeature
 * @param setHoveredFeature
 * @param spiderifierRef
 * @param setMapHeadDrawerCoordinates
 * @param evt
 */
export function onMapLeftClickHandler<T extends object>(
  mapViewRef: React.RefObject<InteractiveMap>,
  mapMode: MapMode,
  setLeftClickedFeature: PointUpdater<T>,
  setRightClickedFeature: PointUpdater<T>,
  setHoveredFeature: PointUpdater<T>,
  spiderifierRef: React.MutableRefObject<Spiderifier | null>,
  setMapHeadDrawerCoordinates: React.Dispatch<React.SetStateAction<any[]>>,
  evt: PointerEvent
) {
  if (mapMode !== 'browse') {
    return
  }
  //console.debug('Map: mouse CLICK', evt)
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
    if (spiderifierRef.current && mapViewRef.current) {  //this if enables the closing of the spider if it is open and user clicks somewhere on the map
      spiderifierRef.current.clearSpiders(map)
    }
  }

  // add position point at user's click on the map - do not add in case the user is clicking on feature
  if (map && features && features.length === 0) {
    manageUserClickedPoint(map, evt, setMapHeadDrawerCoordinates, setLeftClickedFeature)
  } 

  if (map && Array.isArray(features) && features.length > 0) {
    // remove user clicked point 
    removeUserClickedPoint(map)
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
 * handler for double click on the map
 * @param mapViewRef
 * @param mapMode
 * @param geoLayerState
 * @param setDblClickFeatures
 * @param setMapHeadDrawerCoordinates
 * @param evt
 */
export async function onMapDoubleClickHandler<T extends object>(
  mapViewRef: React.RefObject<InteractiveMap>,
  mapMode: MapMode,
  selectedLayer: LayerSettingsState,
  setDblClickFeatures,
  setMapHeadDrawerCoordinates: React.Dispatch<React.SetStateAction<any[]>>,
  setLeftClickedFeature,
  evt: PointerEvent
) {
  const map = mapViewRef.current?.getMap()
  if ((mapMode !== 'browse') || (!evt['leftButton'])) {
    return
  }

  // manage user clicked point
  manageUserClickedPoint(map, evt, setMapHeadDrawerCoordinates, setLeftClickedFeature)

  if (
    selectedLayer &&
    selectedLayer.activeLayer &&
    selectedLayer.format === 'NetCDF'
  ) {
    evt.preventDefault()
    evt.stopImmediatePropagation()
    setDblClickFeatures({
      showCard: true,
      coord: evt.lngLat
    })
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
