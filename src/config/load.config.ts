import { AppConfig, MapboxBaseLayersConfig } from './config.types'
import { DefaultConfig } from './default.config'
import { ThemeOptions, Theme } from '@mui/material/styles'
import { createMuiTheme, responsiveFontSizes } from '@mui/material/styles'
import { Palette } from '@mui/material/styles/createPalette'
import { baseUrl, rootUrl, staticAssetsUrl } from './base-path'
import { isMobileDevice } from '../utils/device.utils'

async function loadConfigFile<T = any>(url: string): Promise<T> {
  try {
    const response = await fetch(url)
    const json = await response.json()
    return json as T
  } catch (err) {
    console.error(`Unable to fectch from ${url}`, err)
    throw err
  }
}

/**
 * Set CSS Variables
 * @param key
 * @param stem
 * @param value
 */
function setCSSProp(key: string, stem: string, value: string) {
  let root = document.documentElement
  root.style.setProperty(`--mui-${stem}-${key}`, value)
}

/**
 * Attempts to set root css variables used by css/scss stylesheets
 *
 * :root {
 *   --mui-<key>: <value>
 * }
 * with key as in palette.text, palette.background, palette.primary, palette.secondary
 *
 * @param palette
 */
function setCSSRootVariables(palette: Palette) {
  let root = document.documentElement
  if (root) {
    ;['text', 'background', 'primary', 'secondary'].forEach((paletteKey) =>
      Object.entries(palette[paletteKey]).forEach(([key, value]) =>
        setCSSProp(key, paletteKey, value as string)
      )
    )
  }
}

/**
 * Load a theme configuration
 * <name>.theme.json
 * from in public/themes
 * and create a theme
 * Will also set CSS variables in root
 * @param name
 */
export async function loadThemeConfiguration(
  name: string | undefined,
  staticAssetsUrl: string
): Promise<Theme> {
  let themeConfig: ThemeOptions = {}
  if (name) {
    try {
      const themeUrl = new URL(`themes/${name}.theme.json`, staticAssetsUrl).href
      console.debug('Loading', themeUrl)
      themeConfig = await loadConfigFile<Partial<ThemeOptions>>(themeUrl)
    } catch (err) {
      console.error('Error loading theme', err)
      throw err
    }
  }
  const theme = responsiveFontSizes(createMuiTheme(themeConfig))
  setCSSRootVariables(theme.palette)
  return theme
}

const HOT_LOADER_ENVTAG = 'hot 🔥'

/**
 * Load app configuration from /config.json
 */
export async function loadConfig(): Promise<AppConfig> {
  try {
    console.debug('rootUrl, baseUrl, staticAssetsUrl', rootUrl, baseUrl, staticAssetsUrl)
    let config: AppConfig

    const configFileUrl = new URL('config.json', staticAssetsUrl).href
    console.debug('Loading config from public folder', configFileUrl)
    // Load main configuration
    const configOverride = await loadConfigFile<Partial<AppConfig>>(configFileUrl)
    // Load default theme
    const defaultThemeConfig = configOverride.ui?.defaultTheme
    const theme = await loadThemeConfiguration(defaultThemeConfig, staticAssetsUrl)

    // Load mapbox base layers styles
    const { baseLayers } = await loadConfigFile<MapboxBaseLayersConfig>(
      new URL('maps/base-layers.json', staticAssetsUrl).href
    )

    config = {
      ...DefaultConfig,
      isMobileDevice: isMobileDevice(),
      baseUrl,
      rootUrl,
      staticAssetsUrl,
      ...configOverride,
      ui: { ...DefaultConfig.ui, ...configOverride.ui, theme },
      mapboxgl: {
        styles: baseLayers.map((lo) => ({
          ...lo,
          preview: new URL(`maps/${lo.preview}`, staticAssetsUrl).href,
          style: new URL(lo.style, configOverride.mapboxgl?.mapStylesURL).href
        })),
        defaultStyle: baseLayers[0].name,
        ...configOverride.mapboxgl
      },
      crs: configOverride.crs!,
      mapPollingInterval: configOverride.mapPollingInterval!,
      envTag: process.env.NODE_ENV === 'production' ? configOverride.envTag : HOT_LOADER_ENVTAG
    }
    console.debug('Config loaded', config)
    return config
  } catch (err) {
    console.error('An error occurred when loading the configuration', err)
    throw err
  }
}
