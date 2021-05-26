import { Spiderifier } from "../../../../utils/map-spiderifier.utils"

export const mapOnLoadHandler = (
    map,
    spiderifierRef,
    setSpiderLayerIds,
    setMapViewport,
    sourceId,
    pointsLayerId,
    pointsLayerProps,
    updateMarkers,
    leavesHoverProps: { paint: mapboxgl.SymbolPaint; layout: mapboxgl.AnyLayout }
        | false = false
) => {

    spiderifierRef.current = new Spiderifier({
        sourceName: sourceId,
        leavesLayerType: 'symbol',
        leavesLayerPaintOptions: pointsLayerProps,
        highlightLeavesOnHover: leavesHoverProps,
        onLeavesLayerUpdate: setSpiderLayerIds
    })


    if (updateMarkers === undefined) {
        updateMarkers = (map) => { }
    }
    else {
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

    //restore webgl context when it is lost
    map.on('webglcontextlost', function () {
        console.log("WEBGL Context lost, restoring...")
        var gl = map.getCanvas().getContext('webgl');
        gl.getExtension('WEBGL_lose_context').restoreContext();
    });
    //console to check context is restored
    map.on('webglcontextrestored', function () {
        console.log('WEBGL Context Restored');
    });

}