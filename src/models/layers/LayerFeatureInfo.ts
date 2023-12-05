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

export class FeatureInfo {
  name: string
  value: number | string
  constructor(name, value) {
    this.name = name
    this.value = value
  }
}

export class ImpactFeatureInfoValue {
  jsonStr: string
  formattedImpacts: Impact[]
  strAllImpacts: string | number
  constructor(jsonStr) {
    this.jsonStr = jsonStr
    const parsed = JSON.parse(jsonStr)
    this.formattedImpacts = !(typeof parsed === 'string' || typeof parsed === 'number')
      ? Object.keys(parsed).map((key) => new Impact(key, parsed[key] ?? ''))
      : []
    this.strAllImpacts = !(typeof parsed === 'string' || typeof parsed === 'number')
      ? this.formattedImpacts.map((e) => e.strFullImpact).join('\n')
      : parsed
  }
}

export class Impact {
  impactType: string
  impactQuantities: ImpactQuantity[]
  strFullImpact: string
  constructor(type, value) {
    this.impactType = type
    this.impactQuantities = Object.keys(value).map((key) => new ImpactQuantity(key, value[key]))
    const strImpactVal =
      this.impactQuantities.length > 1
        ? this.impactQuantities.map((e) => e.strImpact).join('\n')
        : this.impactQuantities.map((e) => e.strImpact).join('')
    this.strFullImpact = `${type}${strImpactVal.length > 0 ? '\n' : ''}${strImpactVal}` ?? ''
  }
}

export class ImpactQuantity {
  impactName: string
  impactValue: ImpactQuantityValueUnit
  strImpact: string
  constructor(name, value) {
    this.impactName = name
    this.impactValue = new ImpactQuantityValueUnit(value.value, value.unit)
    this.strImpact = `${this.impactName}\t\t ${this.impactValue.strValue}` ?? ''
  }
}

export class ImpactQuantityValueUnit {
  value: string
  unit: string
  strValue: string
  constructor(value, unit) {
    this.value = value
    this.unit = unit
    this.strValue = `${value}${unit}` ?? ''
  }
}

export class LayerFeatureInfoState {
  layerName: string
  featuresInfo: FeatureInfo[]
  constructor(layerName, featuresInfo) {
    this.layerName = layerName
    this.featuresInfo = featuresInfo
  }
}
