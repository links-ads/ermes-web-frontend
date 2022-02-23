import { Theme } from '@material-ui/core/styles'
interface FusionAuthConfig {
  url: string
  clientId: string
  tenantId: string
}

interface BackendConfiguration {
  url: string
}

interface UIConfig {
  availableThemes: string[]
  defaultTheme?: string
  theme: Theme
}

// Configuration for basemap styles that are not in the same server
// e.g. { label: 'Dark', url: 'https://myserver.com/dark.style.json'}
export interface MapboxStyleObject {
  label: string
  style: string
  name: string
  preview: string
}

export type MapboxBaseLayersConfig = { baseLayers: MapboxStyleObject[] }

export interface i18NextConfig {
  ns?: string | string[]
  defaultNS?: string
  fallbackNS?: string
  whitelist?: false | string[]
  preload?: false | string[]
  fallbackLng?: false | string
}

export interface MapboxGlConfig {
  // base map styles
  // if it is a string, name will be style file name without .json suffix
  styles?: MapboxStyleObject[]
  // name
  defaultStyle?: string
  // API Key
  // TODO apiKey whitelisting on map server
  apiKey?: string
  // if it's mapbox servers, it will start with mapbox://
  mapServerURL?: string
  // if defined, styled without URL or with relative URL will start from be assumed on thsi URL
  // e.g. https://myserver.com/styles -> styles: ['bright'] -> https://myserver.com/styles/bright.json
  mapStylesURL?: string
  //default mapViewport
  mapViewport?: { latitude: number, longitude: number, zoom: number }
  //default mapBounds for spacial filters
  mapBounds?: {
    southWest: [number, number],
    northEast: [number, number]
  }
}

export interface GeoServerConfig {
  baseUrl?:string
  suffix?:string
  params?:{

    service?:string
    request?:string
    version?:string
    format?:string
    bbox?:string
    srs?:string
    height?:number
    width?:number
    transparent?:boolean
  }

}

export interface AppConfig {
  // Identifies the env tag (local, test, dev...) to be displayed
  envTag?: string
  // Root URL (e.g. https://mysite.com), auto-identified when the app starts up
  rootUrl: string
  // Base URL as a relative path (e.g. /some-folder), auto-identified when the app starts up
  baseUrl: string
  // Static assets URL as a absolute URL (e.g. http://mysite.com/some-folder), auto-identified when the app starts up
  // The public folder structure of this project is opionionated and it is described in the README
  staticAssetsUrl: string
  // UI Configuration (themes, etc)
  ui: UIConfig
  // i18next settings - a subset of i18next InitOptions
  i18n?: i18NextConfig
  // Map configuration
  mapboxgl?: MapboxGlConfig
  // GeoServer configuration to retrieve layers
  geoServer?:GeoServerConfig
  // FusionAuth connection paramters
  fusionAuth?: FusionAuthConfig
  // API connection parameters
  backend?: BackendConfiguration
  // Detected at runtime/boot time
  isMobileDevice: boolean
}
