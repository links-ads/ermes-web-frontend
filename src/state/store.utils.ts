/**
 * Set of utilities for store management (e.g. restore)
 */

import { AppState } from './app.state'
import { AppConfig } from '../config'
import { getFusionAuthURLs } from './auth/auth.utils'
import { SCOPE } from './auth/auth.consts'
import { isTokenExpired, restoreTokenInState } from '../oauth/react-oauth2-hook-mod'
import { IProfile } from 'ermes-ts-sdk'
import { LocalUser } from './auth/auth.types'
import Cookie from 'js-cookie'

export const USER_STORAGE_KEY = 'auth-profile-'

export function restoreUserProfileInSTate(baseUrl: string, token: string | null): LocalUser {
  let profile: LocalUser = null
  const key = USER_STORAGE_KEY + baseUrl
  if (token) {
    const storedUser = localStorage.getItem(key)
    if (storedUser) {
      try {
        profile = JSON.parse(storedUser) as IProfile
      } catch (err) {
        console.warn('Could not reload user', err)
      }
    }
  }
  return profile
}

export function getInitialState(appConfig: AppConfig): Promise<Partial<AppState>> {
  // Rehydrate token
  const { authorizeUrl } = getFusionAuthURLs(appConfig.rootUrl, appConfig.fusionAuth?.url || '', appConfig.backend?.url!)
  const token = restoreTokenInState(authorizeUrl, SCOPE, appConfig.fusionAuth?.clientId || '')
  const profile = restoreUserProfileInSTate(appConfig.baseUrl, token)
  const defaultConfigThemeName = appConfig.ui.defaultTheme || appConfig.ui.availableThemes[0]
  const defaultConfigTheme = appConfig.ui.theme
  const expTime = Cookie.get('app.at_exp')
  let isAuthenticated = false
  if(expTime)
      isAuthenticated = !isTokenExpired(expTime)
  const state: Partial<AppState> = {
    selectedCameraState: null,
    auth: { token, profile: null, loading: false, isAuthenticated },
    // preferences will be downloaded from server
    preferences: {
      uiThemeName: defaultConfigThemeName,
      uiTheme: defaultConfigTheme,
      mapTheme: appConfig.mapboxgl?.defaultStyle || ''
    }
  }
  return Promise.resolve(state)
}
