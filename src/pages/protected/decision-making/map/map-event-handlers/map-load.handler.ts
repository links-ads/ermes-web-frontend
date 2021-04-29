import { InteractiveMap } from 'react-map-gl'
import { ViewportStateUpdater, MapViewportState } from '../map.contest'
import { ContainerSize } from '../../../../../common/size-aware-container.component'
import { SVGPinPointStyle, getPinImages, ColorMap } from '../pin-svg-factories'
import { Spiderifier } from '../../../../../utils/map-spiderifier.utils'

export async function onMapLoadHandler<T extends object>(
  mapViewRef: React.RefObject<any>,
  spiderifierRef: React.MutableRefObject<Spiderifier | null>,
  setSpiderLayerNames: (layerIds: string[]) => void,
  updateMarkers: (map: mapboxgl.Map) => void,
  unclusteredPointsPaint: {
    layout: mapboxgl.AnyLayout
    paint: mapboxgl.SymbolPaint
  },
  typeColors: ColorMap,
  viewport: MapViewportState,
  containerSize: ContainerSize,
  setViewport: ViewportStateUpdater,
  geoJSONSourceId: string,
  highlightLeavesOnHoverPaint:
    | { paint: mapboxgl.SymbolPaint; layout: mapboxgl.AnyLayout }
    | false = false,
  pinStyle: SVGPinPointStyle = 'old-fashioned'
) {
  console.debug('Map Loaded')
  setViewport({ ...viewport, ...containerSize })
  if (mapViewRef.current) {
    try {
      const map = mapViewRef.current.getMap()
      // Load generated SVG Pin Images
      const loadImages = async () => {
        const pinImages = await getPinImages(typeColors, pinStyle, true)
        pinImages.forEach(([key, img]) => {
          if (!map.hasImage(key)) {
            map.addImage(key, img)
          }
        })
      }
      loadImages()
      // when switching style, icons are lost
      map.on('styleimagemissing', loadImages)

      // Attach listeners for spider and cluster
      const geoJSONSource = map.getSource(geoJSONSourceId)
      if (geoJSONSource && geoJSONSource.type === 'geojson') {
        
        map.on('move', () => updateMarkers(map))
        map.on('moveend', () => updateMarkers(map))
        updateMarkers(map)

        // Simple dots on leafs
        // spiderifier.current = new Spiderifier({
        //   sourceName: SOURCE_ID,
        //   leavesLayerPaintOptions: unclusteredPointPaint
        // })

        // image icons on leafs
        spiderifierRef.current = new Spiderifier({
          sourceName: geoJSONSourceId,
          leavesLayerType: 'symbol',
          leavesLayerPaintOptions: unclusteredPointsPaint,
          highlightLeavesOnHover: highlightLeavesOnHoverPaint,
          onLeavesLayerUpdate: setSpiderLayerNames
        })

        // Zoom behavior for spiderifier
        map.on('zoomstart', () => spiderifierRef.current?.clearSpiders(map))
        map.on('zoomend', (e) => {
          if (e['fromCluster']) {
            const center = map.getCenter()
            setViewport({
              ...viewport,
              zoom: map.getZoom(),
              latitude: center.lat,
              longitude: center.lng
            })
          }
        })
      }
    } catch (err) {
      console.error('Map Load Error', err)
    }
  }
}
