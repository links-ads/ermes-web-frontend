import { LayerProps } from 'react-map-gl'
import { EmergencyColorMap, EmergencyType } from './emergency.component'
import { donutChartHTML } from '../../../../utils/mapbox-marker.utils'
import { Marker } from 'mapbox-gl'

const colors = Object.entries(EmergencyColorMap).flat()

const pointColors: mapboxgl.Expression = [
  'match',
  ['get', 'type'],
  ...colors,
  '#000'
] as unknown as mapboxgl.Expression // possibly broken types

// Circle clusters layers, transparent because it's overlapped by markers
// but used for catching events
export const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  source: 'emergency-source',
  filter: ['has', 'point_count'], // gets only clusters
  paint: {
    'circle-color': 'transparent',
    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
  }
}

// Unclustered points paint (no pins, circles) TODO ignore in final release
export const unclusteredPointPaint = {
  'circle-color': pointColors,
  'circle-radius': 4,
  'circle-stroke-width': 1,
  'circle-stroke-color': '#fff'
}

// Unclustered points layer (no pins, circles) TODO ignore in final release
export const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'emergency-source',
  filter: ['!', ['has', 'point_count']],
  paint: unclusteredPointPaint
}

// unclustered points layer (pins): layout and paint properties
// selects icon based on type
export const unclusteredPointPinsPaint: {
  layout: mapboxgl.AnyLayout
  paint: mapboxgl.SymbolPaint
} = {
  layout: {
    'icon-image': ['get', 'type'],
    'icon-allow-overlap': true,
    'icon-anchor': 'bottom-right' // use bottom with regular pins
  },
  paint: {}
}

// unclustered points layer definition (pins)
export const unclusteredPointLayerPins: LayerProps = {
  id: 'unclustered-point',
  type: 'symbol',
  source: 'emergency-source',
  filter: ['!has', 'point_count'],
  ...unclusteredPointPinsPaint
}

// Yellow marker for hovered feature
export const hoveredPointPin: Required<Omit<LayerProps, 'beforeId' | 'minzoom' | 'maxzoom'>> = {
  id: 'unclustered-point-hovered',
  type: 'symbol',
  source: 'emergency-source',
  filter: ['all', ['!has', 'point_count'], ['==', 'id', 'null']],
  layout: {
    'icon-image': ['get', 'type'],
    'icon-allow-overlap': true,
    'icon-size': 1.5,
    'icon-anchor': 'bottom-right' // use bottom with regular pins
  },
  paint: {
    // Halo does not work easy with svg and addImage https://github.com/mapbox/mapbox-gl-js/issues/5684
    // 'icon-halo-color': yellow[500],
    // 'icon-halo-width': 10,
    // 'icon-halo-blur': 5
  }
}

export const getClickedPointPinBySource = (source: string) => {
  const pin = clickedPointPin
  pin.source = source
  return pin
}

export const clickedPointPin: Required<Omit<LayerProps, 'beforeId' | 'minzoom' | 'maxzoom'>> = {
  id: 'unclustered-point-clicked',
  type: 'symbol',
  source: 'emergency-source',
  filter: ['all', ['!has', 'point_count'], ['==', 'id', 'null']],
  layout: {
    'icon-image': ['get', 'type'],
    'icon-allow-overlap': true,
    'icon-size': 1.5,
    'icon-anchor': 'bottom-right' // use bottom with regular pins
  },
  paint: {
    // Halo does not work easy with svg and addImage https://github.com/mapbox/mapbox-gl-js/issues/5684
    // 'icon-halo-color': yellow[500],
    // 'icon-halo-width': 10,
    // 'icon-halo-blur': 5
  }
}

// All possible types
// TODO type and category refer both to "type of feature". Stick to 1 single definition
export const categories: EmergencyType[] = Object.keys(EmergencyColorMap) as EmergencyType[]

// Define the type of a counter in a cluster
type CounterType = {
  [k in EmergencyType]?: mapboxgl.Expression
}

// Expression that accumulates the count of elements in a cluster per each "type"
// TODO type and category refer both to "type of feature". Stick to 1 single definition
export const emergencyClusterProperties = categories.reduce<CounterType>(
  (allCategories, nextCategory) => {
    allCategories[nextCategory] = ['+', ['case', ['==', ['get', 'type'], nextCategory], 1, 0]] // if match case, 1 else 0, sum
    return allCategories
  },
  {}
)

type ClusterProps<P extends string> = {
  cluster: boolean
  cluster_id: string
} & { [k in P]: number }

/**
 * Arguments are objects for caching and keeping track of HTML marker objects (for performance)
 * @param markers
 * @param markersOnScreen
 */
export function updateMarkers<P extends string>(
  sourceName: string,
  relevantKeys: P[],
  colors: string[],
  markersRef: React.MutableRefObject<[object, object]>,
  // markersOnScreenRef: React.RefObject<Object>,
  map: mapboxgl.Map,
  checkFeatureState: boolean = false
): [object, object] {
  let allMarkers = markersRef.current || [{}, {}]
  let [markers, markersOnScreen] = allMarkers
  // let markersOnScreen = markersOnScreenRef.current || {}
  let newMarkers = {}

  let features = map.querySourceFeatures(sourceName) as unknown as GeoJSON.Feature<
    GeoJSON.Point,
    ClusterProps<P>
  >[]
  // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
  // and add it to the map if it's not there already
  const processedClusters = [] as string[]
  for (let i = 0; i < features.length; i++) {
    const coords = features[i].geometry.coordinates as [number, number]
    const props = features[i].properties
    if (!props.cluster) continue
    const id = props.cluster_id
    if (processedClusters.includes(id)) continue
    let isHover = false
    if (checkFeatureState !== null) {
      const state = map.getFeatureState({
        source: sourceName,
        id: id
      })
      isHover = state.hover ? state.hover : state.highlight ? state.highlight : false
    }
    let marker = markers[id]
    if (!marker || checkFeatureState) {
      const el = donutChartHTML<ClusterProps<P>>(props, relevantKeys, colors, isHover)
      if (el) {
        marker = markers[id] = new Marker({
          element: el
        }).setLngLat(coords)
      }
    }
    newMarkers[id] = marker
    processedClusters.push(id)

    // if marker is not present, add it
    if (!markersOnScreen[id]) marker.addTo(map)
    else {
      // otherwise, if you have to check for featureState
      if (checkFeatureState) {
        // remove old marker
        markersOnScreen[id].remove()
        // add new one
        marker.addTo(map)
      }
    }
  }
  // for every marker we've added previously, remove those that are no longer visible
  for (let id of Object.keys(markersOnScreen)) {
    if (!newMarkers[id]) markersOnScreen[id].remove()
  }
  return [markers, newMarkers]
}

/**
 * Updates markers on screen
 * @param sourceName name of the geojson source
 * @param markersRef a reference from the parents to a [{},{}] element
 * @param map map object
 */
export function updateEmergencyMarkers(
  sourceName: string,
  markersRef: React.MutableRefObject<[object, object]>, //= [ allmarkers, onscreen]
  map: mapboxgl.Map,
  checkFeatureState: boolean
) {
  const relevantKeys = categories
  const colors = Object.values(EmergencyColorMap)
  return updateMarkers<EmergencyType>(
    sourceName,
    relevantKeys,
    colors,
    markersRef,
    map,
    checkFeatureState
  )
}
