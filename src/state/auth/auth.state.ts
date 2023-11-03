import { AuthState } from './auth.types'

export const defaultState: AuthState = {
  profile: null,
  token: null,
  loading: false,
  isAuthenticated: false
}
