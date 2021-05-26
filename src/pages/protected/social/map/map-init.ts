import { LayerProps } from "react-map-gl";

export const SOURCE_ID = "tweets-source"
export const CLUSTER_LAYER_ID = "clusters"
export const CLUSTER_COUNT_ID = 'tweets-cluster-count'
export const TWEETS_LAYER_ID = 'tweets-point'
export const HOVER_TWEETS_LAYER_ID = 'tweets-hover'


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

export const HOVER_TWEETS_LAYER_PROPS: LayerProps = {
    id: HOVER_TWEETS_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['all', ['!has', 'point_count'], ['==', 'id', 'null']],
    layout: {
        'icon-image': 'twitterIconHover',
        'icon-size': 0.8,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true
    } as mapboxgl.AnyLayout,
    paint: {
        'text-halo-width': 2,
        'text-halo-color': '#fff',
        'text-color': '#449fdb'
    } as mapboxgl.CirclePaint
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
        'text-size': ['step', ['get', 'point_count'], 10, 20, 11, 100, 12]
    },
    paint: {}
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
        //add 5 to original defined dimesion if point is in hover state
        'circle-radius': ["+", ['step', ['get', 'point_count'], 10, 20, 20, 100, 30], 
                                ['case', ['boolean',
                                    ['feature-state', 'hover'],
                                    false
                                ],
                                5, 0]],
        'circle-stroke-color': '#ff0000',
        // circle border is 3 iff point is in hover state, 0 otherwise
        'circle-stroke-width': ['case', ['boolean',
            ['feature-state', 'hover'],
            false
        ],
            3, 0]
    }
}
