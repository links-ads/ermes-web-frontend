import { Feature, Geometry, GeoJsonProperties, BBox } from 'geojson'

export class LayerFeatureInfo implements GeoJSON.FeatureCollection {
  type: 'FeatureCollection'
  features: Feature<Geometry, GeoJsonProperties>[]
  bbox?: BBox | undefined
  totalFeatures: string | any
  numberReturned: number
  timeStamp: string
  crs: string

  constructor(features, totalFeatures, numberReturned, timeStamp, crs, bbox?) {
    this.type = 'FeatureCollection'
    this.features = features
    this.bbox = bbox
    this.totalFeatures = totalFeatures
    this.numberReturned = numberReturned
    this.timeStamp = timeStamp
    this.crs = crs
  }
}
