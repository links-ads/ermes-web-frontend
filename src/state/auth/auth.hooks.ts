import { useEffect, useContext, useCallback, useMemo } from 'react'
import { useOAuth2Token, parseJWT, isExpired, storagePrefix } from '../../oauth/react-oauth2-hook-mod'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { AuthThunkDispatch, AuthThunkAction } from './auth.types'
import { AUTH_ACTIONS } from './auth.actions'
import {
  getUserStateSelector,
  userEqualityFn,
  getTokenStateSelector,
  loadingUserDataSelector,
  getUserPermissionsSelector
} from './auth.selectors'
import { PermissionAction, PermissionEntity, PermissionGranularity, SCOPE } from './auth.consts'
import { useTranslation } from 'react-i18next'
import { AppConfigContext, AppConfig } from '../../config'
import { getFusionAuthURLs } from './auth.utils'
import { Configuration, ProfileApiFactory, ProfileDto } from 'ermes-ts-sdk'
import { Profile } from 'ermes-ts-sdk'
import { useSnackbars } from '../../hooks/use-snackbars.hook'
import { USER_STORAGE_KEY } from '../store.utils'
import useStorage from 'react-storage-hook'

/**
 * Async Thunk!
 * @see https://redux.js.org/recipes/usage-with-typescript/#usage-with-redux-thunk
 * @param cfg
 */
export function thunkLoadProfile(
  cfg: Configuration,
  onError: (any) => void,
  onSessionExpired: (any) => void,
  userProfileStorageKey: string
): AuthThunkAction {
  return async (dispatch, getState) => {
    const apiTtoken = cfg.apiKey
    const authState = getState().auth
    const { profile, token } = authState
    if (apiTtoken === token && profile) {
      return
    } else if (typeof apiTtoken === 'string') {
      const jwt = parseJWT(apiTtoken)
      if (jwt) {
        // Check token expired
        const expired = isExpired(jwt)
        if (expired) {
          // Token expired
          dispatch({ type: AUTH_ACTIONS.CLEAR_ALL })
          localStorage.removeItem(userProfileStorageKey)
          onSessionExpired('errors:session_expired')
        } else {
          dispatch({ type: AUTH_ACTIONS.LOADING_USER_DATA, loading: true })
          const apiFactory = ProfileApiFactory(cfg)
          let profile: ProfileDto | null | undefined = { user: {} }

          try {
            // BEGIN: PROVISIONAL UNTIL 500 err are solved!

            try {
              const response = await apiFactory.profileGetProfile()
              profile = response.data.profile
            } catch (err) {
              console.warn('Error retrieving Profile')
            }
            // END: PROVISIONAL UNTIL 500 err are solved!

            const userProfile = Profile.create(jwt, profile || { user: {} })
            if (userProfile) {
              dispatch({ type: AUTH_ACTIONS.SET_TOKEN, token: apiTtoken })
              dispatch({ type: AUTH_ACTIONS.SET_USER_DATA, profile: userProfile })
              localStorage.setItem(userProfileStorageKey, JSON.stringify(userProfile))
            }
          } catch (err) {
            console.error('Could not Load User Profile', err)
            dispatch({ type: AUTH_ACTIONS.LOADING_USER_DATA, loading: false })
            if (err.isAxiosError && err.response.status === 401) {
              // Token expired
              dispatch({ type: AUTH_ACTIONS.CLEAR_ALL })
              localStorage.removeItem(userProfileStorageKey)
              onSessionExpired(err.response.data.error)
            } else {
              const errorObject = err.isAxiosError ? err.response.data.error : err
              onError(errorObject)
            }
            // throw err
          }
        }
      }
    }
  }
}

export function useOauth() {
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const { displayErrorSnackbar, displayWarningSnackbar } = useSnackbars()
  const { loginCallbackUrl, authorizeUrl, logoutUrl } = getFusionAuthURLs(
    appConfig.rootUrl,
    appConfig.fusionAuth?.url || '',
    appConfig.backend?.url!
  )
  const tenantId = appConfig.fusionAuth?.tenantId || ''
  const clientId = appConfig.fusionAuth?.clientId || ''
  const { i18n } = useTranslation()
  const locale = i18n.language
  const [token, getToken, setToken] = useOAuth2Token({
    authorizeUrl: authorizeUrl,
    scope: SCOPE,
    redirectUri: loginCallbackUrl,
    clientId,
    tenantId,
    locale,
    responseType: 'code'
  })

  const beAPIConfig = useMemo(
    () => {
      return new Configuration({
        apiKey: token || '',
        basePath: appConfig.backend?.url
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token]
  ) // eslint-enable-next-line react-hooks/exhaustive-deps

  const dispatch = useDispatch<AuthThunkDispatch>()

  const updateUserProfile = useCallback((apiConfig) => {
    dispatch(
      thunkLoadProfile(
        apiConfig,
        displayErrorSnackbar,
        (message: string) => {
          setToken(null)
          displayWarningSnackbar(message)
          localStorage.clear()
        },
        USER_STORAGE_KEY + appConfig.baseUrl
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // eslint-enable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (beAPIConfig.apiKey) {
      updateUserProfile(beAPIConfig)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beAPIConfig.apiKey])
  // eslint-enable-next-line react-hooks/exhaustive-deps

  return {
    updateUserProfile,
    beAPIConfig,
    clientId,
    tenantId,
    token,
    getToken,
    setToken,
    logoutUrl,
    locale
  }
}

export function useUser() {
  const { isAuthenticated, profile } = useSelector(getUserStateSelector, userEqualityFn)
  return {
    isAuthenticated,
    profile: profile ? Profile.fromPlainObjcet(profile) : null
  }
}

export const useUserPermission = (
  entity: PermissionEntity,
  action: PermissionAction,
  granularity?: PermissionGranularity | null
): boolean => {
  const permissions = useSelector(getUserPermissionsSelector)
  if (permissions && permissions.length > 0) {
    const permissionName = `${entity}.${action}` + (granularity ? `.${granularity}` : '')
    return permissions.includes(permissionName)
  }
  return false
}

export function useToken() {
  const stateSelection = useSelector(getTokenStateSelector, shallowEqual)
  return stateSelection
}

export function useLogout() {
  const { clientId, tenantId, logoutUrl, setToken } = useOauth()
  const dispatch = useDispatch<AuthThunkDispatch>()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const { logoutCallbackUrl } = getFusionAuthURLs(
    appConfig.rootUrl,
    appConfig.fusionAuth?.url || '',
    appConfig.backend?.url!
  )  
  let [, setHasHandle] = useStorage<boolean>('logout-window-handle', {
    placeholder: false
  })

  // Logout action
  function logout(): void {
    // setUser(null)
    setToken(null)
    /* const handle = */ window.open(
      `${logoutUrl}?client_id=${clientId}&tenantId=${tenantId}&post_logout_redirect_uri=${logoutCallbackUrl}`,
      'Logout',
      'width=360,height=400'
    )
    
    dispatch({ type: AUTH_ACTIONS.CLEAR_ALL })
    localStorage.clear()
    setHasHandle(true)
    // updateLogoutHandle(handle)
    // console.debug('HANDLE', handle)
  }
  return logout
}

export function useLogin() {
  const { locale, getToken } = useOauth()

  const login = useCallback(
    () => getToken(locale),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  ) // eslint-enable-next-line react-hooks/exhaustive-deps

  return login
}

export function useUserDataLoading() {
  const stateSelection = useSelector(loadingUserDataSelector)
  return stateSelection
}
