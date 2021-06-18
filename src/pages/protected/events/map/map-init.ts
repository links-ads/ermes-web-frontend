import { LayerProps } from "react-map-gl"
import { updateMarkers } from '../../map/api-data/emergency.layers';

export const EVENTS_LAYER_ID = 'events'
export const CLUSTER_LAYER_ID = 'clusters'
export const SOURCE_ID = 'events-source'

export const POLYGON_SOURCE_ID = 'polygon-source'
export const POLYGON_LAYER_ID = 'polygon-layer'
export const POLYGON_STROKE_ID = 'polygon-stroke'


type HazardType =
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '21'

type HazardColorMapType = {
    [k in HazardType]: string
}

const HazardColorMap: HazardColorMapType = {
    10: '#4d4e52',//storm
    11: '#f51707',//wildfire
    12: '#0b3ebd',//flood
    13: '#360404',//eartquake
    14: '#a12c0b',//landslide
    15: '#abc8d4',//avalanche
    16: '#0cc725',//subsidence
    17: '#cfe609',//collapse
    18: '#e68e09',//pandemic
    19: '#0d0101',//terrorism
    20: '#e6093d',//accident
    21: '#5fdaed',//temp anomaly
}

const hazardCategories: HazardType[] = Object.keys(HazardColorMap) as HazardType[]

type CounterType = {
    [k in HazardType]?: mapboxgl.Expression
}

const hazardClusterProperties = hazardCategories.reduce<CounterType>(
    (allCategories, nextCategory) => {
        allCategories[nextCategory] = ['+', ['case', ['==', ['get', 'hazard'], nextCategory], 1, 0]] // if match case, 1 else 0, sum
        return allCategories
    },
    {}
)

export const updateHazardMarkers = (sourceName, clusterRef, map,layerName) => {
    return updateMarkers<HazardType>(sourceName, hazardCategories, Object.values(HazardColorMap), clusterRef, map,layerName)
}

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
        'circle-radius': ['+', 6, ['case', ['boolean',
            ['feature-state', 'hover'],
            false
        ],
            6, 0]],
        'circle-stroke-opacity': 0.7,
        'circle-stroke-width': ['+', 2, ['case', ['boolean',
        ['feature-state', 'hover'],
        false
    ],
        2, 0]],
        'circle-stroke-color': '#ffffff'
    } as mapboxgl.SymbolPaint
}


export const SOURCE_PROPS = {
    cluster: true,
    clusterMaxZoom: 15, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    clusterProperties: hazardClusterProperties
}

export const EVENTS_LAYER_PROPS: LayerProps = {
    id: EVENTS_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['!has', 'point_count'],
    ...unclusteredPointsProps
}

export const CLUSTER_LAYER_PROPS: LayerProps = {
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'], // gets only clusters
    paint: {
        'circle-color': 'transparent',
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
    }
}
