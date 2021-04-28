import { useDispatch, useSelector } from 'react-redux'
import { /*  useState, useEffect, */ useContext, useMemo, useCallback } from 'react'
import { PreferencesDispatch } from './preferences.types'
import { AppState } from '../app.state'
import { PREFERENCES_ACTIONS } from './preferences.actions'
import {
  loadThemeConfiguration,
  AppConfig,
  AppConfigContext,
  MapboxStyleObject
} from '../../config'
import { Theme } from '@material-ui/core'
//import { MapRequest } from 'react-map-gl'

type UIThemeSelection = { uiTheme: Theme; uiThemeName: string }

function uiThemeSelector(state: AppState): UIThemeSelection {
  return {
    uiTheme: state.preferences.uiTheme || ({} as Theme),
    uiThemeName: state.preferences.uiThemeName
  }
}

function themeEquality(left: UIThemeSelection, right: UIThemeSelection): boolean {
  return left.uiThemeName === right.uiThemeName
}

/**
 * Export current UI theme settings and handler for changing UI theme
 */
export function useUITheme() {
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const { uiTheme, uiThemeName } = useSelector<AppState, UIThemeSelection>(
    uiThemeSelector,
    themeEquality
  )

  const dispatch = useDispatch<PreferencesDispatch>()

  async function changeTheme(newTheme: string) {
    const theme = await loadThemeConfiguration(newTheme, appConfig.staticAssetsUrl)
    dispatch({ type: PREFERENCES_ACTIONS.SET_UI_THEME, uiThemeName: newTheme, uiTheme: theme })
  }

  return {
    theme: uiTheme,
    themeName: uiThemeName,
    availableThemes: appConfig.ui.availableThemes,
    changeTheme
  }
}

function mapThemeSelector(state: AppState): string {
  return state.preferences.mapTheme
}

/**
 * Export current MAP settings and handler for changing UI theme
 */
export function useMapPreferences() {
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const mapConfig = appConfig.mapboxgl
  const mapThemeName = useSelector<AppState, string>(mapThemeSelector)
  const dispatch = useDispatch<PreferencesDispatch>()
  const availableMapThemes: MapboxStyleObject[] =
    mapConfig?.styles && Array.isArray(mapConfig?.styles) ? mapConfig?.styles : []
  const apiKey = mapConfig?.apiKey || ''
  const mapServerURL = mapConfig?.mapServerURL || ''
  const mapStylesURL = mapConfig?.mapStylesURL || ''

  const mapTheme = useMemo(() => {
    return availableMapThemes.find((mto) => mto.name === mapThemeName) || null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapThemeName])
  // eslint-enable-next-line react-hooks/exhaustive-deps

  const transformRequest = useCallback(
    (url: string | undefined, resourceType: string | undefined) => {
      const reqUrl = url || ''
      const mapRequest: any /*MapRequest*/ = { url: reqUrl }

      if (resourceType === 'Tile' && reqUrl.includes(mapServerURL)) {
        mapRequest['headers'] = { apiKey: apiKey }
        mapRequest['credentials'] = 'same-origin'
      }
      return mapRequest
    },
    [apiKey, mapServerURL]
  )

  async function changeMapTheme(newMapTheme: string) {
    dispatch({
      type: PREFERENCES_ACTIONS.SET_MAP_THEME,
      mapTheme: newMapTheme
    })
  }

  return {
    mapTheme,
    changeMapTheme,
    apiKey,
    transformRequest,
    mapServerURL,
    mapStylesURL,
    availableMapThemes
  }
}
