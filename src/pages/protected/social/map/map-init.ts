const tweetImage = new Image(60, 60);
tweetImage.src = require('../../../../assets/twitterIcon/twitter.png');

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

export const initializeMap = (map, geoData) => {
    if (map === undefined || map === null) return
    try {
        if (!map.hasImage('twitterIcon'))
        map.addImage('twitterIcon', tweetImage);

        let s = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource
        if (s === undefined) {
            map.addSource(SOURCE_ID, {
                type: 'geojson',
                data: geoData,
                cluster: true,
                generateId: true,
                clusterMaxZoom: 15, // Max zoom to cluster points on
                clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
            });
        }
        else {
            s.setData(geoData)
        }
        if (map.getLayer(CLUSTER_LAYER_ID) === undefined) {
            map.addLayer({
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
            });
        }

        if (map.getLayer(CLUSTER_COUNT_ID) === undefined) {
            map.addLayer({
                id: CLUSTER_COUNT_ID,
                source: SOURCE_ID,
                filter: ['has', 'point_count'],
                type: 'symbol',
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['Open Sans Bold'],
                    'text-size': 10
                }
            });
        }

        if (map.getLayer(TWEETS_LAYER_ID) === undefined) {
            map.addLayer({
                id: TWEETS_LAYER_ID,
                type: 'symbol',
                source: SOURCE_ID,
                filter: ['!has', 'point_count'],
                layout: unclusteredPointsProps.layout,
                paint: unclusteredPointsProps.paint,
            });
        }
    }
    catch {

    }
}