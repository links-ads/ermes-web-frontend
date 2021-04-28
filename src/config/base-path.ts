/**
 * Get Root URL
 */
 function getRootUrl() {
  let rootUrl = ''
  rootUrl += window.location.origin
    ? window.location.origin + '/'
    : window.location.protocol + '/' + window.location.host + '/'

  return rootUrl
}

export const rootUrl = getRootUrl()

/**
 * Auto-detect baseURL
 * https://www.webtechriser.com/how-to-get-base-url-or-root-url-using-javascript/
 */
function getBaseUrl() {
  if (process?.env?.NODE_ENV === 'production') {
    // The following code was generating an issue in production mode when refreshing the pages in organizations base url. The code has been commented, since it seemed to serve no purpose so far.

    // const re = new RegExp(/^.*\//)
    // let baseUrl = ''
    // baseUrl += re.exec(window.location.href)
    // return baseUrl.replace(rootUrl, '/')
    return '/'
  } else {
    return '/'
  }
}

export const baseUrl = getBaseUrl()

/**
 * Detect Static assets URL
 *
 */
function getStaticAssetsUrl() {
  const staticAssetsURL = baseUrl.replace(/^\//, '')
  return new URL(staticAssetsURL, rootUrl).href
}

export const staticAssetsUrl = getStaticAssetsUrl()
