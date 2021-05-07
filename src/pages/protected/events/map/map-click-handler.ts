import { clearEventMap, getZoomFromArea, parseEvent } from "../../common/map/map-common"
import { CLUSTER_LAYER_ID, EVENTS_LAYER_ID, getColorForHazard, POLYGON_LAYER_ID, POLYGON_SOURCE_ID, POLYGON_STROKE_ID, SOURCE_ID } from "./map-init"

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
            //Add source and layer for polygon
            const coordinates = JSON.parse(properties?.polygon)
            const source_data = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "MultiPolygon",
                            "coordinates": coordinates
                        },
                        "properties": {
                            "hazard": properties?.hazard
                        }
                    }
                ]
            } as unknown as GeoJSON.FeatureCollection
            let s = map.getSource(POLYGON_SOURCE_ID) as mapboxgl.GeoJSONSource
            if (s === undefined) {
                map.addSource(POLYGON_SOURCE_ID, {
                    type: 'geojson',
                    data: source_data
                });
            }
            else {
                s.setData(source_data)
            }
            if (map.getLayer(POLYGON_LAYER_ID) === undefined) {
                map.addLayer({
                    id: POLYGON_LAYER_ID,
                    type: 'fill',
                    source: POLYGON_SOURCE_ID,
                    layout: {},
                    paint: {
                        'fill-color': getColorForHazard, // blue color fill
                        'fill-opacity': 0.5
                    }
                });
            }
            if (map.getLayer(POLYGON_STROKE_ID) === undefined) {
                map.addLayer({
                    id: POLYGON_STROKE_ID,
                    type: 'line',
                    source: POLYGON_SOURCE_ID,
                    layout: {},
                    paint: {
                        'line-color': getColorForHazard, // blue color fill
                        'line-width': 2
                    }
                });
            }
            map?.flyTo(
                {
                    center: centroid,
                    zoom: getZoomFromArea(properties?.total_area)
                    // zoom: getZoomFromArea(getPolygonArea(coordinates[0]))
                },
                {
                    how: 'fly',
                }
            )
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
            clearEventMap(map,setLeftClickState,leftClickState)
        }
    }
    else {
        // Clear feature
        if (map) {
            clearEventMap(map,setLeftClickState,leftClickState)
        }
    }
}
