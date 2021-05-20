import { Action } from 'redux'
import { AUTH_ACTIONS } from './auth.actions'
import { JWT /* , User */ } from '@fusionauth/typescript-client'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { IProfile } from 'ermes-ts-sdk/dist/common/index'
import { AppState } from '../app.state'

// TODO use USER DEFINITION
export type LocalUser = IProfile | null

export interface AuthState {
   profile: LocalUser
   token: string | null
   loading: boolean
}

export interface AuthActionSetUser extends Action<AUTH_ACTIONS.SET_USER_DATA> {
  profile: IProfile
}
export interface AuthActionSetToken extends Action<AUTH_ACTIONS.SET_TOKEN> {
  token: string
}
export interface AuthActionSetLoading extends Action<AUTH_ACTIONS.LOADING_USER_DATA> {
  loading: boolean
}

export interface AuthActionClear extends Action<AUTH_ACTIONS.CLEAR_ALL> {}

export type AuthAction =
  | AuthActionSetUser
  | AuthActionSetToken
  | AuthActionSetLoading
  | AuthActionClear

export type AuthThunkAction = ThunkAction<void, AppState, unknown, AuthAction>

export type AuthThunkDispatch = ThunkDispatch<AppState, void, AuthAction>

export interface AuthSelection {
  token: string | null
  profile: LocalUser
  isAuthenticated: boolean
}

export interface CurrentUserSelection {
  profile: LocalUser
  isAuthenticated: boolean
}

export interface OauthParams {
  login: () => void
  token: string | null | undefined
  jwt: JWT | null
  userId: string | null
  logout: () => void
  logoutHandle: Window | null
  closeLogoutWindow: () => void
}
