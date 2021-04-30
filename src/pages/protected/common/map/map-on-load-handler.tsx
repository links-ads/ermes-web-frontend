import { Spiderifier } from "../../../../utils/map-spiderifier.utils"

export const mapOnLoadHandler = (
    map,
    spiderifierRef,
    setSpiderLayerIds,
    setMapViewport,
    mapInit,
    sourceId,
    pointsLayerId,
    pointsLayerProps,
    updateMarkers
) => {
    spiderifierRef.current = new Spiderifier({
        sourceName: sourceId,
        leavesLayerType: 'symbol',
        leavesLayerPaintOptions: pointsLayerProps,
        highlightLeavesOnHover: false,
        onLeavesLayerUpdate: setSpiderLayerIds
    })

    if(updateMarkers === undefined)
    {
        updateMarkers = (map)=>{}
    }
    else
    {
        map.on('move', () => updateMarkers(map))
    }

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
            if (map.getZoom() >= 12) {
                spiderifier?.spiderifyClusterIfNotOpen(map, e['clusterId'], [center.lng, center.lat])
            }
        }
    })

    map.on('mouseenter', pointsLayerId, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', pointsLayerId, function () {
        map.getCanvas().style.cursor = '';
    });
    map.on('style.load', function (evt) {
        // mapInit()
        // updateMarkers(map)
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