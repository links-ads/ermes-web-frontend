export function getFusionAuthURLs(rootUrl: string, fusionAuthURL: string, backendUrl: string) {
  const authorizeUrl = new URL('/oauth2/authorize', fusionAuthURL).href
  const oauth2CallbackUrl = new URL('/api/services/app/auth/oauth-callback', backendUrl).href
  const logoutUrl = new URL('/oauth2/logout', fusionAuthURL).href
  const logoutCallbackUrl = new URL('/api/services/app/auth/logout-callback', backendUrl).href
  const deviceValidateUrl = new URL('/oauth2/device/validate', fusionAuthURL).href

  return {
    authorizeUrl,
    oauth2CallbackUrl,
    logoutUrl,
    deviceValidateUrl,
    logoutCallbackUrl
  }
}
