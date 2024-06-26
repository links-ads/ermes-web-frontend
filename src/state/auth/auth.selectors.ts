import { /* AuthState, */ CurrentUserSelection } from './auth.types'
import { AppState } from '../app.state'

export function getUserStateSelector(state: AppState): CurrentUserSelection {
  return {
    profile: state.auth.profile,
    isAuthenticated: state.auth.token !== null
  }
}

/**
 * Avoid unnecessary re-renders.
 * Equality on user id. Make it more complicated if needed
 * @param left
 * @param right
 */
export function userEqualityFn(left: CurrentUserSelection, right: CurrentUserSelection): boolean {
  return (
    (left.profile === null && right.profile === null) ||
    left.profile?.user?.id === right.profile?.user?.id
  )
}

export function getTokenStateSelector(state: AppState): string | null {
  return state.auth.token
}

export function loadingUserDataSelector(state: AppState): boolean {
  return state.auth.loading
}

export function getUserPermissionsSelector(state: AppState): string[] {
  return state.auth.profile?.permissions ?? []
}
