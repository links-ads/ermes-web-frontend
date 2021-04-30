import { LayerProps } from "react-map-gl"
import { hazardClusterProperties, HazardColorMap } from "./map-cluster-util"

export const EVENTS_LAYER_ID = 'events'
export const CLUSTER_LAYER_ID = 'clusters'
export const SOURCE_ID = 'events-source'

export const POLYGON_SOURCE_ID = 'polygon-source'
export const POLYGON_LAYER_ID = 'polygon-layer'
export const POLYGON_STROKE_ID = 'polygon-stroke'

export const getColorForHazard = [
    'match',
    ['get', 'hazard'],
    ...Object.entries(HazardColorMap).reduce<string[]>((current, next) => [...current, ...next], []),
    /* default */
    '#ccc'
]

export const unclusteredPointsProps = {
    layout: {
    } as mapboxgl.AnyLayout,
    paint: {
        'circle-color': getColorForHazard,
        'circle-radius': 6,
        'circle-stroke-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
    } as mapboxgl.SymbolPaint
}

export const DEFAULT_MAP_VIEWPORT = {
    latitude: 45.3,
    longitude: 7.23,
    zoom: 2.5
}

export const SOURCE_PROPS = {
    cluster: true,
    generateId: true,
    clusterMaxZoom: 15, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    clusterProperties: hazardClusterProperties
}

export const EVENTS_LAYER_PROPS : LayerProps = {
    id: EVENTS_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['!has', 'point_count'],
    ...unclusteredPointsProps
}

export const CLUSTER_LAYER_PROPS : LayerProps = {
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'], // gets only clusters
    paint: {
        'circle-color': 'transparent',
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
    }
}
