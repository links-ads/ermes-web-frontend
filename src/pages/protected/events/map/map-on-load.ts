import { Spiderifier } from "../../../../utils/map-spiderifier.utils"
import { EVENTS_LAYER_ID, SOURCE_ID, unclusteredPointsProps } from "./map-init"

export const MapOnLoad = (map,spiderifierRef,setSpiderLayerIds,setMapViewport,updateMarkers,mapInit) => {
    spiderifierRef.current = new Spiderifier({
        sourceName: SOURCE_ID,
        leavesLayerType: 'circle',
        leavesLayerPaintOptions: unclusteredPointsProps,
        highlightLeavesOnHover: false,
        onLeavesLayerUpdate: setSpiderLayerIds
    })
    map.on('zoomend', (e) => {
        const zoom = map.getZoom()
        if (zoom < 14) {
            spiderifierRef.current?.clearSpiders(map)
        }
        if (e['fromCluster']) {
            const center = map.getCenter()
            setMapViewport({
                zoom: zoom,
                latitude: center.lat,
                longitude: center.lng
            })
            const spiderifier = spiderifierRef.current
            if (spiderifier && map.getZoom() >= 12) {
                spiderifier?.spiderifyClusterIfNotOpen(map, e['clusterId'], [center.lng, center.lat])
            }
        }
    })
    map.on('move', () => updateMarkers(map))

    map.on('mouseenter', EVENTS_LAYER_ID, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', EVENTS_LAYER_ID, function () {
        map.getCanvas().style.cursor = '';
    });
    map.on('style.load', function (evt) {
        // initializeMap(props.mapRef?.current?.getMap(), dataRef.current)
        mapInit()
        updateMarkers(map)
    });

    map.on('moveend', function (e) {
        updateMarkers(map)
        if (e.how !== undefined && e.how === 'fly') {
            const center = map.getCenter()
            setMapViewport({
                latitude: center.lat,
                longitude: center.lng,
                zoom: map.getZoom(),
            })
        }
    })
}