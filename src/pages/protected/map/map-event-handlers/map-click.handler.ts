import { InteractiveMap, PointerEvent } from 'react-map-gl'
import { PointUpdater, ItemWithLatLng, PointLocation, MapMode } from '../map.contest'
import { Spiderifier } from '../../../../utils/map-spiderifier.utils'
import mapboxgl from 'mapbox-gl'

import { makeTimeSeriesURL } from '../../../../utils/map.utils'

/**
 * handler for left click on the map
 * @param mapViewRef
 * @param mapMode
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
    if (spiderifierRef.current && mapViewRef.current) {  //this if enables the closing of the spider iff it is open and user clicks somewhere on the map
      spiderifierRef.current.clearSpiders(map)
    }
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
 * handler for left click on the map
 * @param mapViewRef
 * @param mapMode
 * @param geoLayerState
 * @param geoServerConfig
 * @param setDblClickFeatures
 * @param selectedFilters
 * @param evt
 */
export async function onMapDoubleClickHandler<T extends object>(
  mapViewRef: React.RefObject<InteractiveMap>,
  mapMode: MapMode,
  geoLayerState,
  geoServerConfig,
  setDblClickFeatures,
  selectedFilters,
  evt: PointerEvent
) {
  const map = mapViewRef.current?.getMap()
  if ((mapMode !== 'browse') || (!evt['leftButton'])) {
    return
  }
  const coord = evt.lngLat
  // If a layer id displayed on the map
  if (geoLayerState.tileId && geoLayerState.tileSource['properties']['format'] === 'NetCDF') {
    evt.preventDefault()
    evt.stopImmediatePropagation()
    const timeRange = [
      selectedFilters.datestart.selected ? selectedFilters.datestart.selected : geoLayerState.tileSource['properties']['fromTime'] ,
      selectedFilters.dateend.selected ? selectedFilters.dateend.selected : geoLayerState.tileSource['properties']['toTime']
    ]
    const res = await fetch(makeTimeSeriesURL(coord, geoLayerState.tileId, geoServerConfig,timeRange)) 
    const data = await res.text();
    const dataArray = data.split("\n").slice(3, -1)
    // Check whether the point is in a layer or not
    if (dataArray.length <= 0) {
      map?.zoomTo(map?.getZoom() + 1,{},{'fromCluster': true}) //Add eventData just to update map viewport
    }
    else {
      // The point is associated with features -> trigger data plot
      console.debug("Point is associated with features", dataArray)
      const dateOptions = {
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: false
      } as Intl.DateTimeFormatOptions
      const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)
      setDblClickFeatures({
        layer: geoLayerState.tileId,
        data: {
          'Value': dataArray.map(row => {
            let rowArray = row.split(",")
            return {
              x: formatter.format(new Date(rowArray[0])),
              y: parseFloat(rowArray[1])
            }
          })
        }
      })
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
