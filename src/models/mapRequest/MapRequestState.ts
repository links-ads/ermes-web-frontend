import { LayerImportStatusType, MapRequestLayerErrorDto } from 'ermes-ts-sdk'
import { TimestampToFile } from '../common/TimestampToFile'
export class MapRequestLayerSettingsState {
  dateIndex: number
  opacity: number
  isChecked: boolean
  errorMessages: MapRequestLayerErrorDto[]
  status: LayerImportStatusType
  metadataIds: any
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
    this.metadataIds = {}
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
  [dataTypeId: number]: MapRequestLayerSettingsState
}

class MapRequestState {
  [code: string]: MapRequestLayerState
}

export default MapRequestState