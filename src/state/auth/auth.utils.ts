export function getFusionAuthURLs(rootUrl: string, fusionAuthURL: string) {
  const authorizeUrl = new URL('/oauth2/authorize', fusionAuthURL).href
  const oauth2CallbackUrl = new URL('/callback', rootUrl).href
  const logoutUrl = new URL('/oauth2/logout', fusionAuthURL).href
  const deviceValidateUrl = new URL('/oauth2/device/validate', fusionAuthURL).href

  return {
    authorizeUrl,
    oauth2CallbackUrl,
    logoutUrl,
    deviceValidateUrl
  }
}
