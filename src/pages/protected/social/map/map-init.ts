import { LayerProps } from "react-map-gl";

export const SOURCE_ID = "tweets-source"
export const CLUSTER_LAYER_ID = "clusters"
export const CLUSTER_COUNT_ID = 'tweets-cluster-count'
export const TWEETS_LAYER_ID = 'tweets-point'

export const DEFAULT_MAP_VIEWPORT = {
    latitude: 45.3,
    longitude: 7.23,
    zoom: 5
}

export const unclusteredPointsProps = {
    layout: {
        'icon-image': 'twitterIcon',
        'icon-size': 0.5,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true
    } as mapboxgl.AnyLayout,
    paint: {
        'text-halo-width': 2,
        'text-halo-color': '#fff',
        'text-color': '#449fdb'
    } as mapboxgl.SymbolPaint
}

export const TWEETS_LAYER_PROPS: LayerProps = {
    id: TWEETS_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['!has', 'point_count'],
    ...unclusteredPointsProps
}

export const CLUSTER_COUNT_LAYER_PROPS: LayerProps = {
    id: CLUSTER_COUNT_ID,
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    type: 'symbol',
    layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold'],
        'text-size': 10
    },
    paint:{}
}

export const CLUSTER_LAYER_PROPS: LayerProps = {
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'], // gets only clusters
    paint: {
        'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            20,
            '#f1f075',
            100,
            '#f28cb1'
        ],
        'circle-radius': ['step', ['get', 'point_count'], 10, 20, 20, 100, 30]
    }
}
