import { clearEventMap, drawPolyToMap, parseEvent } from "../../../../common/map/map-common"
import { CLUSTER_LAYER_ID, EVENTS_LAYER_ID, getColorForHazard, SOURCE_ID } from "./map-init"
import { POLYGON_LAYER_ID, POLYGON_SOURCE_ID, POLYGON_STROKE_ID } from '../../../../common/map/map-common';


export const mapClickHandler = (evt, mapRef, leftClickState, setLeftClickState, mapViewport, spiderifierRef) => {
    // handle only left click
    evt.preventDefault()
    evt.stopPropagation()
    if (!evt['leftButton']) {
        return
    }
    const features = evt.features
    const map = mapRef.current?.getMap()
    //check that a point with features has been clicked
    if (map && Array.isArray(features) && features.length > 0) {
        const layer = features[0]['layer']['id'] as string
        if (layer === EVENTS_LAYER_ID || layer.startsWith(SOURCE_ID + '-spider-leaves')) {
            // Cast is necessary
            const feature = (features[0] as unknown) as GeoJSON.Feature<GeoJSON.Point>
            const properties = feature.properties
            const centroid = JSON.parse(properties?.center)
            const coordinates = JSON.parse(properties?.polygon)
            drawPolyToMap(map, { longitude: centroid[0], latitude: centroid[1] }, {
                "type": "MultiPolygon",
                "coordinates": coordinates
            } as GeoJSON.MultiPolygon, {
                "hazard": properties?.hazard
            }, getColorForHazard as mapboxgl.Expression)
            const newLeftClickState = { showPoint: true, clickedPoint: { long: centroid[0], lat: centroid[1] }, pointFeatures: parseEvent(properties) }
            setLeftClickState(newLeftClickState)
        }
        else if (layer === CLUSTER_LAYER_ID) {
            // Depending on settings, it will either expand the cluster or open the spider
            if (spiderifierRef.current && mapRef.current) {
                spiderifierRef.current.toggleSpiders(map, evt)
            }
            setLeftClickState({ showPoint: false, clickedPoint: null, pointFeatures: { ...leftClickState.pointFeatures } })
        }
        else {
            clearEventMap(map, setLeftClickState, leftClickState)
        }
    }
    else {
        // Clear feature
        if (map) {
            clearEventMap(map, setLeftClickState, leftClickState)
        }
    }
}
