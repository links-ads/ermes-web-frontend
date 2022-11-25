import { LayerImportStatusType, MapRequestLayerErrorDto } from 'ermes-ts-sdk'

export class TimestampToFile {
  [timestamp: string]: string
}

export class LayerSettingsState {
  dateIndex: number
  opacity: number
  isChecked: boolean
  errorMessages: MapRequestLayerErrorDto[]
  status: LayerImportStatusType
  metadataId: string | null | undefined
  name: string
  availableTimestamps: any
  timestampsToFiles: TimestampToFile
  activeLayer: string
  toBeRemovedLayer: string
  mapRequestCode: string
  dataTypeId: number
  constructor(status: LayerImportStatusType, errorMessages: MapRequestLayerErrorDto[]) {
    this.dateIndex = 0
    this.opacity = 100
    this.isChecked = false
    this.errorMessages = errorMessages
    this.status = status
    this.metadataId = ''
    this.name = ''
    this.timestampsToFiles = {}
    this.availableTimestamps = []
    this.activeLayer = ''
    this.toBeRemovedLayer = ''
    this.mapRequestCode = ''
    this.dataTypeId = 0
  }
}

export class MapRequestLayerState {
  [dataTypeId: number]: LayerSettingsState
}

class MapRequestState {
  [code: string]: MapRequestLayerState
}

export default MapRequestState