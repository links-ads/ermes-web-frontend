import { PreferencesAction, PreferencesState } from './preferences.types'
import { PREFERENCES_ACTIONS } from './preferences.actions'
import { defaultState } from './preferences.state'

export function preferencesReducer(
  state: PreferencesState | undefined = defaultState,
  action: PreferencesAction
): PreferencesState {
  if (action && action.type) {
    switch (action.type) {
      case PREFERENCES_ACTIONS.SET_UI_THEME:
        state.uiTheme = action.uiTheme
        state.uiThemeName = action.uiThemeName
        break
      case PREFERENCES_ACTIONS.SET_MAP_THEME:
        state.mapTheme = action.mapTheme
        break
      // case PREFERENCES_ACTIONS.SET_LANGUAGE:
      //   state.language = action.language
      //   break
      default:
        break
    }
  }
  return state
}
