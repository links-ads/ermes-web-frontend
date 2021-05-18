import { POLYGON_LAYER_ID, POLYGON_SOURCE_ID, POLYGON_STROKE_ID } from "../../events/map/map-init"

export const DEFAULT_MAP_VIEWPORT: { latitude: number, longitude: number, zoom: number } = {
    latitude: 45.3,
    longitude: 7.23,
    zoom: 2.5
}

export const DEFAULT_MAP_BOUNDS : {southWest:[number,number],northEast:[number,number]} = {
    southWest: [61, 60],
    northEast: [-47, 24]
}

export const getTweetLocation = (tweet) => {
    if (tweet.location != null)
        return tweet.location.coordinates
    for (let entity of tweet.entities) {
        if (entity.location !== null) {
            return entity.location.coordinates
        }
    }
    return undefined
}

export const parseDataToGeoJson = (data) => {
    let featuresList = [] as GeoJSON.Feature[]
    let i = 0
    for (let item of data) {
        let properties = {
            "author_display_name": item.author.display_name,
            "author_user_name": item.author.user_name,
            "author_profile_image": item.author.profile_image,
            "created_at": item.created_at,
            "text": item.text,
            "information_types": item.information_types,
            "hazard_types": item.hazard_types,
            "informative": item.informative,
            "id_str": item.id_str,
            "id": i
        }
        const coordinates = getTweetLocation(item)
        if (coordinates !== undefined) {
            featuresList.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": coordinates
                } as unknown as GeoJSON.Point,
                "properties": properties
            } as unknown as GeoJSON.Feature)
            i++
        }
    }
    return {
        "type": "FeatureCollection",
        "features": featuresList
    } as unknown as GeoJSON.FeatureCollection
}



export const parseEventDataToGeoJson = (items) => {
    let featuresList = [] as GeoJSON.Feature[]
    for (let item of items) {
        let properties = {
            "id": item.id,
            "hazard": String(item.hazard_id),
            "name": item.name,
            "lang": item.lang,
            "polygon": item.hotspots.coordinates,
            "center": item.hotspots_centroid.coordinates,
            "started_at": item.started_at,
            "updated_at": item.updated_at,
            "ended_at": item.ended_at,
            "total_area": item.hotspots.coordinates.map(arr => getPolygonArea(arr[0])).reduce((acc, current) => acc + current)
        }
        featuresList.push({
            "type": "Feature",
            "geometry": item.hotspots_centroid as unknown as GeoJSON.Point,
            "properties": properties
        } as unknown as GeoJSON.Feature)
    }
    return {
        "type": "FeatureCollection",
        "features": featuresList
    } as unknown as GeoJSON.FeatureCollection
}

export const clearEventMap = (map: mapboxgl.Map, setLeftClickState, leftClickState) => {
    if (leftClickState.showPoint)
        setLeftClickState({ showPoint: false, clickedPoint: null, pointFeatures: { ...leftClickState.pointFeatures } })
    // if (spiderifierRef.current) {
    //     spiderifierRef.current.clearSpiders(map)
    //   }
    if (map.getLayer(POLYGON_STROKE_ID) !== undefined)
        map.removeLayer(POLYGON_STROKE_ID)
    if (map.getLayer(POLYGON_LAYER_ID) !== undefined)
        map.removeLayer(POLYGON_LAYER_ID)
    if (map.getSource(POLYGON_SOURCE_ID) !== undefined)
        map.removeSource(POLYGON_SOURCE_ID)
}

export const parseEvent = (features) => {
    return {
        name: features['name'],
        hazard_id: features['hazard'],
        started_at: features['started_at'],
        updated_at: features['updated_at'] === 'null' ? null : features['updated_at'],
        ended_at: features['ended_at'] === 'null' ? null : features['ended_at']
    }
}

export const parseTweet = (features) => {
    const tweet = {
        id_str: features['id_str'],
        created_at: features['created_at'],
        text: features['text'],
        hazard_types: JSON.parse(features['hazard_types']),
        information_types: JSON.parse(features['information_types']),
        author: {
            display_name: features['author_display_name'],
            user_name: features['author_user_name'],
            profile_image: features['author_profile_image']
        },
        informative: features['informative']
    }
    return tweet
}

export const getPolygonArea = (coordinates) => {
    let area = 0;
    const n = coordinates.length
    for (var i = 0; i < n - 1; i++) {

        area += coordinates[i][0] * coordinates[i + 1][1] - coordinates[i][1] * coordinates[i + 1][0]
    }

    if (n > 2) {
        area += coordinates[n - 1][0] * coordinates[0][1] - coordinates[n - 1][1] * coordinates[0][0]

    }

    area = Math.abs(area / 2)
    return area
}

export const getZoomFromArea = (area) => {
    if (area === null || area === undefined) return 4
    if (area < 0.0001) return 11
    if (area < 0.1) return 9
    if (area < 0.4) return 8
    if (area < 2) return 7
    if (area < 10) return 6
    if (area < 40) return 5
    if (area < 100) return 4
    if (area < 500) return 3
    else return 2.5
}