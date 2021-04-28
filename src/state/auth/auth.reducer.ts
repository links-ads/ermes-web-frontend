import { AuthState, AuthAction } from './auth.types'
import { AUTH_ACTIONS } from './auth.actions'
import { defaultState } from './auth.state'

export function authReducer(
  state: AuthState | undefined = defaultState,
  action: AuthAction
): AuthState {
  if (action && action.type) {
    switch (action.type) {
      case AUTH_ACTIONS.LOADING_USER_DATA:
        state.loading = action.loading
        break
      case AUTH_ACTIONS.SET_USER_DATA:
        state.profile = action.profile
        state.loading = false
        break
      case AUTH_ACTIONS.SET_TOKEN:
        state.token = action.token
        break
      case AUTH_ACTIONS.CLEAR_ALL:
        state.profile = defaultState.profile
        state.token = defaultState.token
        state.loading = defaultState.loading
        break
      default:
        break
    }
  }
  return state
}
