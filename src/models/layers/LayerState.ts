import { TimestampToFile } from "../common/TimestampToFile"

interface Position {
  x: number, 
  y: number
}

export class AssociatedLayer {
  dataTypeId: number
  name: string
  parentDataTypeId: number
  parentName: string

  constructor(id, name, parentId, parentName) {
      this.dataTypeId = id
      this.name = name
      this.parentDataTypeId = parentId
      this.parentName = parentName
  }
}
export class LayerSettingsState {
  group: string
  subGroup: string
  dataTypeId: number
  format: string
  frequency: number | string
  name: string
  order: number
  type: string
  unitOfMeasure: string
  dateIndex: number
  opacity: number
  isChecked: boolean
  metadataId: string | null | undefined
  availableTimestamps: any
  timestampsToFiles: TimestampToFile
  activeLayer: string
  toBeRemovedLayer: string
  position: Position

  associatedLayers: AssociatedLayer[]

  constructor(
    group: string,
    subGroup: string,
    dataTypeId: number,
    name: string,
    format: string,
    frequency: number | string,
    type: string,
    unitOfMeasure: string,
    yPosition: number
  ) {
    this.group = group
    this.subGroup = subGroup
    this.dataTypeId = dataTypeId
    this.format = format
    this.frequency = frequency
    this.name = name
    this.order = 0
    this.type = type
    this.unitOfMeasure = unitOfMeasure

    this.dateIndex = 0
    this.opacity = 100
    this.isChecked = false
    this.metadataId = ''
    this.timestampsToFiles = {}
    this.availableTimestamps = []
    this.activeLayer = ''
    this.toBeRemovedLayer = ''
    this.associatedLayers = []
    this.position = { x: 470, y: yPosition }
  }
}

/*
  Examples of DatataypeId: 31101, 31102
*/
export class LayerState {
  [dataTypeId: number]: LayerSettingsState
}

/*
  Example of SubGroups: Short term, Medium term
*/
export class SubGroupLayerState {
  [subGroup: string]: LayerState
}
/*
  Examples of Group: Weather, Environment
*/
export class GroupLayerState {
  [group: string]: SubGroupLayerState
}
