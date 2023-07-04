import { StationDto } from 'ermes-backoffice-ts-sdk'
import { AuthState } from './auth/auth.types'
import { PreferencesState } from './preferences/preferences.types'
// MAP pieceOfState: Reducer
export type AppState = {
  selectedCameraState: StationDto | null
  auth: AuthState
  preferences: PreferencesState
} //| { other1: Other1StateType} | { other2: Other2StateType}...;
