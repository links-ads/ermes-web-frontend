import { MeasureDto, SensorDto, StationDto } from 'ermes-backoffice-ts-sdk'
import { AUTH_ACTIONS } from './auth/auth.actions'

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

export function replaceMeasurement(measurement: MeasureDto) {
  return {
    type: 'REPLACE_MEASUREMENT',
    payload: measurement
  }
}

export function selectedCameraReducer(state = defaultState, action: any) {
  switch (action.type) {
    case 'SET_SELECTED_CAMERA':
      return action.payload
    case 'CLEAR_SELECTED_CAMERA':
      return null
    case AUTH_ACTIONS.CLEAR_ALL:
      return null
    case 'REPLACE_MEASUREMENT':
      if (state?.sensors) {
        return {
          ...state,
          sensors: state.sensors.map((sensor: SensorDto) => {
            if (sensor.id === action.payload.sensorId) {
              return {
                ...sensor,
                measurements: sensor.measurements?.map((measure: MeasureDto) => {
                  if (measure.id === action.payload.id) {
                    return action.payload
                  }
                  return measure
                })
              }
            }
            return sensor
          })
        }
      }
      return state
    default:
      return state
  }
}
