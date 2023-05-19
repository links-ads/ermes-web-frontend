import { Action } from 'redux'
import { PREFERENCES_ACTIONS } from './preferences.actions'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { Theme } from '@mui/material'

export interface PreferencesState {
  uiTheme: Theme | null
  uiThemeName: string
  // TODO elborate
  mapTheme: string
  //   language: string
  // TODO add others - understand which are remote prefs
}

export interface SetUiThemeAction extends Action<PREFERENCES_ACTIONS.SET_UI_THEME> {
  uiThemeName: string
  uiTheme: Theme
}

export interface SetMapThemeAction extends Action<PREFERENCES_ACTIONS.SET_MAP_THEME> {
  mapTheme: string
}

// export interface SetLanguageAction extends Action<PREFERENCES_ACTIONS.SET_LANGUAGE> {
//   language: string
// }

export type PreferencesAction = SetUiThemeAction | SetMapThemeAction // | SetLanguageAction

export type PreferencesThunkAction = ThunkAction<void, PreferencesState, void, PreferencesAction>

export type PreferencesDispatch = ThunkDispatch<PreferencesState, void, PreferencesAction>
