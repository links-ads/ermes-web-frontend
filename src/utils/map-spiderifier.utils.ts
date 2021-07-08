/**
 * Heavily inspired by https://github.com/FranckKe/mapbox-gl-js-cluster-spiderify/blob/master/index.js
 */
import { nanoid } from 'nanoid'
import { Marker as MapboxGLMarker } from 'mapbox-gl'
import { PointerEvent } from 'react-map-gl'
import { updatePointFeatureLayerIdFilter } from './map.utils'
interface SpiderifiableCluster {
  id: number
  coordinates: [number, number]
}

type ClickEvent = mapboxgl.MapMouseEvent & {
  features?: mapboxgl.MapboxGeoJSONFeature[] | undefined
} & mapboxgl.EventData

type SpiderType = 'layer' | 'marker' // marker: use Mapbox's Marker. layer: Use a Mabpbox point layer

interface SpiderifierOptions {
  sourceName: string // name of the geojson source
  spiderMaxZoom: number // Spiderify after zoom N, zoom otherwise
  spiderType: SpiderType
  maxLeavesCount: number // Max leave to display when spiderify to prevent filling the map with leaves
  circleToSpiralSwitchover: number //  // When below number, will display leave as a circle. Over, as a spiral
  circleDistanceBetweenPoints: number //
  spiralRotationsModifier: number // Higher modifier = closer spiral lines
  spiralDistanceBetweenPoints: number // Distance between points in spiral
  spiralRadiusModifier: number // Spiral radius
  spiralLengthModifier: number // Spiral length modifier
  spiderLegs: boolean // Draw Spider legs
  // mapboxgl layer opts
  leavesLayerType: 'circle' | 'symbol'
  leavesLayerPaintOptions: {
    paint: mapboxgl.CirclePaint | mapboxgl.SymbolPaint
    layout?: mapboxgl.AnyLayout
  }
  legsLayerPaintOptions: { paint: mapboxgl.LinePaint; layout?: mapboxgl.AnyLayout }
  // new
  highlightLeavesOnHover:
    | false
    | { paint: mapboxgl.CirclePaint | mapboxgl.SymbolPaint; layout?: mapboxgl.AnyLayout }
  onLeavesLayerUpdate?: (layerIds: string[]) => void
}

const HOVERED_LEAVES_SUFFIX = '-leaves-hovered'

const DEFAULT_LEAVES_PAINT: mapboxgl.CirclePaint = {
  'circle-color': 'orange',
  'circle-radius': 6,
  'circle-stroke-width': 1,
  'circle-stroke-color': '#fff'
}

const DEFAULT_LEGS_PAINT: mapboxgl.LinePaint = {
  'line-width': 3,
  'line-color': 'rgba(128, 128, 128, 0.5)'
}

const DEFAULT_OPTIONS: Omit<SpiderifierOptions, 'sourceName'> = {
  spiderMaxZoom: 12,
  spiderType: 'layer',
  maxLeavesCount: 255,
  circleToSpiralSwitchover: 15,
  circleDistanceBetweenPoints: 50,
  spiralRotationsModifier: 1250,
  spiralDistanceBetweenPoints: 32,
  spiralRadiusModifier: 50000,
  spiralLengthModifier: 1000,
  spiderLegs: true,
  leavesLayerType: 'circle',
  leavesLayerPaintOptions: { paint: DEFAULT_LEAVES_PAINT },
  legsLayerPaintOptions: { paint: DEFAULT_LEGS_PAINT },
  // new
  highlightLeavesOnHover: false
}

export class Spiderifier {
  private clusterMarkers: mapboxgl.Marker[] = []
  private spiderifiedCluster: SpiderifiableCluster | null = null

  private spiderlegsCollection: GeoJSON.Feature<GeoJSON.LineString>[] = []
  private spiderLeavesCollection: GeoJSON.Feature<GeoJSON.Point>[] = []

  private readonly sourceName: string
  private readonly spiderMaxZoom: number
  private readonly spiderType: SpiderType
  private readonly maxLeavesCount: number
  private readonly spiderLegs: boolean
  private readonly circleToSpiralSwitchover: number
  private readonly circleDistanceBetweenPoints: number
  private readonly spiralDistanceBetweenPoints: number
  private readonly spiralLengthModifier: number
  private readonly spiralRadiusModifier: number
  private readonly spiralRotationsModifier: number

  private readonly spiderLegsLayerName: string
  private readonly spiderLeavesLayerName: string

  private readonly leavesLayerType: 'circle' | 'symbol'
  private readonly leavesLayerPaintOptions: {
    paint: mapboxgl.CirclePaint | mapboxgl.SymbolPaint
    layout?: mapboxgl.AnyLayout
  }
  private readonly legsLayerPaintOptions: { paint: mapboxgl.LinePaint; layout?: mapboxgl.AnyLayout }

  public readonly highlightLeavesOnHover:
    | false
    | { paint: mapboxgl.CirclePaint | mapboxgl.SymbolPaint; layout?: mapboxgl.AnyLayout }

  public readonly onLeavesLayerUpdate?: (layerIds: string[]) => void

  constructor(options: Partial<SpiderifierOptions>) {
    if (!options.sourceName) {
      throw new Error('Missing required parameter sourceName')
    }
    const opts: SpiderifierOptions = { ...DEFAULT_OPTIONS, ...(options as SpiderifierOptions) }
    const {
      sourceName,
      spiderMaxZoom,
      spiderType,
      maxLeavesCount,
      circleToSpiralSwitchover,
      circleDistanceBetweenPoints,
      spiralDistanceBetweenPoints,
      spiralLengthModifier,
      spiralRadiusModifier,
      spiralRotationsModifier,
      spiderLegs,
      leavesLayerType,
      leavesLayerPaintOptions,
      legsLayerPaintOptions,
      highlightLeavesOnHover,
      onLeavesLayerUpdate
    } = opts
    this.sourceName = sourceName
    this.spiderMaxZoom = spiderMaxZoom
    this.spiderType = spiderType
    this.maxLeavesCount = maxLeavesCount
    this.circleToSpiralSwitchover = circleToSpiralSwitchover || spiderType === 'marker' ? 10 : 15
    this.circleDistanceBetweenPoints = circleDistanceBetweenPoints
    this.spiralDistanceBetweenPoints =
      spiralDistanceBetweenPoints || spiderType === 'marker' ? 42 : 32
    this.spiralLengthModifier = spiralLengthModifier
    this.spiralRadiusModifier = spiralRadiusModifier
    this.spiralRotationsModifier = spiralRotationsModifier
    this.spiderLegs = spiderLegs

    this.leavesLayerType = leavesLayerType
    this.leavesLayerPaintOptions = leavesLayerPaintOptions
    this.legsLayerPaintOptions = legsLayerPaintOptions

    const randomId = nanoid(5)
    this.spiderLegsLayerName = `${sourceName}-spider-legs-${randomId}`
    this.spiderLeavesLayerName = `${sourceName}-spider-leaves-${randomId}`

    this.highlightLeavesOnHover = highlightLeavesOnHover
    this.onLeavesLayerUpdate = onLeavesLayerUpdate
  }

  public getLayerIds(): string[] {
    return [this.spiderLeavesLayerName, this.spiderLegsLayerName]
  }

  private clearSpiderifiedMarkers() {
    this.clusterMarkers.forEach((m) => {
      m.remove()
    })
    this.clusterMarkers.length = 0
  }

  private clearSpiderifiedCluster() {
    this.spiderifiedCluster = null
  }

  /**
   * Safely remove layers and sources
   * @param map map
   * @param id layer AND source name
   * @param layerIds optional layer ids in the same source
   */
  private removeSourceAndLayer(map: mapboxgl.Map, id: string, ...layerIds: string[]) {
    if (id === this.spiderLeavesLayerName && typeof this.onLeavesLayerUpdate === 'function') {
      this.onLeavesLayerUpdate([])
    }
    for (const lId of [id, ...layerIds]) {
      if (!!map.getLayer(lId)) map.removeLayer(lId)
    }
    if (!!map.getSource(id)) map.removeSource(id)
  }

  private updateLayer(
    map: mapboxgl.Map,
    id: string,
    type: 'line' | 'circle' | 'symbol',
    features: GeoJSON.Feature[],
    paintProperties: mapboxgl.AnyPaint,
    layoutProperties: mapboxgl.AnyLayout = {},
    highlightLeavesOnHover:
      | false
      | { paint: mapboxgl.AnyPaint; layout?: mapboxgl.AnyLayout } = false
  ) {
    const layerExists = !!map.getLayer(id)
    if (id === this.spiderLeavesLayerName && typeof this.onLeavesLayerUpdate === 'function') {
      this.onLeavesLayerUpdate([this.spiderLeavesLayerName /* , this.spiderLegsLayerName */])
    }
    if (layerExists) {
      const source = map.getSource(id)
      if (!!source && source.type === 'geojson') {
        source.setData({
          type: 'FeatureCollection',
          features
        })
      }
    } else {
      // Add it!
      map.addLayer({
        id,
        type,
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        },
        layout: layoutProperties,
        paint: paintProperties
      } as mapboxgl.AnyLayer)

      // Add leaves highlight
      if (highlightLeavesOnHover && id === this.spiderLeavesLayerName) {
        map.addLayer({
          id: id + HOVERED_LEAVES_SUFFIX,
          type,
          source: id,
          layout: highlightLeavesOnHover.layout,
          paint: highlightLeavesOnHover.paint,
          filter: ['all', ['!has', 'point_count'], ['==', 'id', 'null']]
        } as mapboxgl.AnyLayer)
      }
    }
  }

  public clearSpiders(map: mapboxgl.Map) {
    this.spiderLeavesCollection.length = 0
    this.spiderlegsCollection.length = 0
    this.removeSourceAndLayer(map, this.spiderLegsLayerName)
    this.removeSourceAndLayer(
      map,
      this.spiderLeavesLayerName,
      this.spiderLeavesLayerName + HOVERED_LEAVES_SUFFIX
    )

    switch (this.spiderType) {
      case 'marker':
        this.clearSpiderifiedMarkers()
        break
      case 'layer':
      default:
        this.clearSpiderifiedCluster()
        break
    }
  }

  private generateEquidistantPointsInCircle(totalPoints = 1) {
    const theta = (Math.PI * 2) / totalPoints
    const points: mapboxgl.PointLike[] = Array.from({ length: totalPoints }, (v, i) => {
      const angle = theta * i
      return [
        // [x,y]
        this.circleDistanceBetweenPoints * Math.cos(angle),
        this.circleDistanceBetweenPoints * Math.sin(angle)
      ]
    })
    return points
  }

  private generateEquidistantPointsInSpiral(totalPoints = 1) {
    const points: mapboxgl.PointLike[] = []
    // Higher modifier = closer spiral lines
    const rotations = totalPoints * this.spiralRotationsModifier
    const distanceBetweenPoints = this.spiralDistanceBetweenPoints
    const radius = totalPoints * this.spiralRadiusModifier
    // Value of theta corresponding to end of last coil
    const thetaMax = rotations * 2 * Math.PI
    // How far to step away from center for each side.
    const awayStep = radius / thetaMax

    for (
      let theta = distanceBetweenPoints / awayStep;
      points.length <= totalPoints + this.spiralLengthModifier;

    ) {
      points.push([Math.cos(theta) * (awayStep * theta), Math.sin(theta) * (awayStep * theta)])
      theta += distanceBetweenPoints / (awayStep * theta)
    }
    return points.slice(0, totalPoints)
  }

  private generateLeavesCoordinates(nbOfLeaves: number) {
    let points: mapboxgl.PointLike[] = []
    // Position cluster's leaves in circle if below threshold, spiral otherwise
    if (nbOfLeaves < this.circleToSpiralSwitchover) {
      points = this.generateEquidistantPointsInCircle(nbOfLeaves)
    } else {
      points = this.generateEquidistantPointsInSpiral(nbOfLeaves)
    }
    return points
  }

  public spiderifyCluster(map: mapboxgl.Map, clusterToSpiderify: SpiderifiableCluster) {
    const source = map.getSource(this.sourceName)
    if (!!source && source.type === 'geojson') {
      const geoJSONSource = source as mapboxgl.GeoJSONSource
      geoJSONSource.getClusterLeaves(
        clusterToSpiderify.id,
        this.maxLeavesCount,
        0,
        (error, features) => {
          if (error) {
            console.warn('Cluster does not exists on this zoom')
            return
          }
          this.spiderlegsCollection.length = 0
          this.spiderLeavesCollection.length = 0
          this.clusterMarkers.length = 0
          const leavesCoordinates = this.generateLeavesCoordinates(features.length)
          const clusterXY = map.project(clusterToSpiderify.coordinates)
          // Generate spiderlegs and leaves coordinates
          features.forEach((element, index) => {
            let spiderLeafLatLng = map.unproject([
              clusterXY.x + leavesCoordinates[index][0],
              clusterXY.y + leavesCoordinates[index][1]
            ])
            if (this.spiderType === 'marker') {
              this.clusterMarkers.push(new MapboxGLMarker().setLngLat(spiderLeafLatLng))
            }
            if (this.spiderType === 'layer') {
              this.spiderLeavesCollection.push({
                type: 'Feature',
                properties: element.properties,
                id:element.id,
                geometry: {
                  type: 'Point',
                  coordinates: [spiderLeafLatLng.lng, spiderLeafLatLng.lat]
                }
              })
            }

            if (this.spiderLegs) {
              this.spiderlegsCollection.push({
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    clusterToSpiderify.coordinates,
                    [spiderLeafLatLng.lng, spiderLeafLatLng.lat]
                  ]
                }
              })
            }
          })

          // Draw spiderlegs and leaves coordinates
          if (this.spiderLegs) {
            this.updateLayer(
              map,
              this.spiderLegsLayerName,
              'line',
              this.spiderlegsCollection,
              this.legsLayerPaintOptions.paint,
              this.legsLayerPaintOptions.layout
            )
          }

          if (this.spiderType === 'marker') {
            this.clusterMarkers.forEach((marker) => marker.addTo(map))
          }

          if (this.spiderType === 'layer') {
            this.updateLayer(
              map,
              this.spiderLeavesLayerName,
              this.leavesLayerType,
              this.spiderLeavesCollection,
              this.leavesLayerPaintOptions.paint,
              this.leavesLayerPaintOptions.layout,
              this.highlightLeavesOnHover
            )
          }
        }
      )
    }
  }

  public highlightHoveredLeaf(map: mapboxgl.Map, featureId?: string) {
    if (this.highlightLeavesOnHover) {
      updatePointFeatureLayerIdFilter(
        map,
        this.spiderLeavesLayerName + HOVERED_LEAVES_SUFFIX,
        featureId
      )
    }
  }

  public toggleSpiders(map: mapboxgl.Map, e: ClickEvent | PointerEvent) {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    })
    if (Array.isArray(features) && features.length > 0) {
      const feature = features[0]
      if (feature.geometry.type === 'Point') {
        const clusterId = feature?.properties?.cluster_id
        const coordinates = feature.geometry.coordinates as [number, number]
        if (clusterId) {
          // Zoom on cluster or spiderify it
          if (map.getZoom() < this.spiderMaxZoom) {
            const source = map.getSource(this.sourceName)
            if (!!source && source.type === 'geojson') {
              source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return
                // This signal that the events was caused by click on cluster
                const evtData = { fromCluster: true, clusterId: clusterId }
                map.easeTo(
                  {
                    center: coordinates,
                    zoom: zoom
                  },
                  evtData
                )
              })
            }
          } else {
            // Check if already open
            const alreadyOpen =
              this.spiderifiedCluster !== null && this.spiderifiedCluster.id === clusterId
            if (alreadyOpen) {
              this.clearSpiders(map)
              
            } else {
              this.spiderifiedCluster = {
                id: clusterId,
                coordinates
              }
              this.spiderifyCluster(map, this.spiderifiedCluster)
            }
          }
        }
      }
    }
  }

  public spiderifyClusterIfNotOpen(map: mapboxgl.Map, clusterId: number, coord: [number, number]) {
    const alreadyOpen = this.spiderifiedCluster !== null && this.spiderifiedCluster.id === clusterId
    if (alreadyOpen) {
      this.clearSpiders(map)
      
    } else {
      this.spiderifiedCluster = {
        id: clusterId,
        coordinates: coord
      }
      this.spiderifyCluster(map, this.spiderifiedCluster)
    }
  }

  // This function does seem to be doing nothing???
  // public attachOnLoadListeners(map: mapboxgl.Map, clustersLayerName: string = 'clusters') {
  //   map
  //     // Click on cluster
  //     .on('click', clustersLayerName, (e) => {
  //       this.toggleSpiders(map, e)
        
  //     })
  //     // Click on map
  //     .on('click', (e) => {
  //       this.clearSpiders(map)
  //     })
  //     // zoom start
  //     .on('zoomstart', () => {
  //       this.clearSpiders(map)
  //     })
  // }
}
