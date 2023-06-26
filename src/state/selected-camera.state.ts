import { StationDto } from 'ermes-backoffice-ts-sdk'

const defaultState = null as StationDto | null

export function setSelectedCamera(station: StationDto) {
  return {
    type: 'SET_SELECTED_CAMERA',
    payload: station
  }
}

export function clearSelectedCamera() {
  return {
    type: 'CLEAR_SELECTED_CAMERA'
  }
}

export function selectedCameraReducer(state = defaultState, action: any) {
  switch (action.type) {
    case 'SET_SELECTED_CAMERA':
      return action.payload
    case 'CLEAR_SELECTED_CAMERA':
      return null
    default:
      return state
  }
}
