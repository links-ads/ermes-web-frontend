/**
 * @module react-oauth2-hook
 * Modified by Vito Macchia <vito.macchia@linksfoundation.com>
 */

/**
 *
 */

 import React from 'react'
 import { JWT } from '@fusionauth/typescript-client'
 import jwtDecode from 'jwt-decode'
 
 // react-storage-hook.d.ts
 import { useStorage } from 'react-storage-hook'
 
 import { Map } from 'immutable'
 import * as PropTypes from 'prop-types'
import axios from 'axios'
import { useAPIConfiguration } from '../hooks/api-hooks'
 
 /**
  * @hidden
  */
 export const storagePrefix = 'react-oauth2-hook'
 
 /**
  * @public
  */
 export const oauthStateName = storagePrefix + '-state-token-challenge'
 
 export interface Options {
   /**
    * The OAuth authorize URL to retrieve the token from.
    */
   authorizeUrl: string
   /**
    * The OAuth scopes to request.
    */
   scope?: string[]
   /**
    * The OAuth `redirect_uri` callback.
    */
   redirectUri: string
   /**
    * The OAuth `client_id` corresponding to the requesting client.
    */
   clientId: string
   /**
    * The FusionAuth `tenantId` of the requesting client.
    */
   tenantId?: string
   /**
    * The FusionAuth `locale` of the requesting client.
    */
   locale?: string
   /**
    * The FusionAuth `response_type` of the requesting client.
    */
   responseType?: string
 }
 
 /**
  * useOAuth2Token is a React hook providing an OAuth2 implicit grant token.
  *
  * When useToken is called, it will attempt to retrieve an existing
  * token by the criteria of `{ authorizeUrl, scopes, clientID }`.
  * If a token by these specifications does not exist, the first
  * item in the returned array will be `undefined`.
  *
  * If the user wishes to retrieve a new token, they can call `getToken()`,
  * a function returned by the second parameter. When called, the function
  * will open a window for the user to confirm the OAuth grant, and
  * pass it back as expected via the hook.
  *
  * The OAuth token must be passed to a static endpoint. As
  * such, the `callbackUrl` must be passed with this endpoint.
  * The `callbackUrl` should render the [[OAuthCallback]] component,
  * which will securely verify the token and pass it back,
  * before closing the window.
  *
  * All instances of this hook requesting the same token and scopes
  * from the same place are synchronised. In concrete terms,
  * if you have many components waiting for a Facebook OAuth token
  * to make a call, they will all immediately update when any component
  * gets a token.
  *
  * Finally, in advanced cases the user can manually overwrite any
  * stored token by capturing and calling the third item in
  * the reponse array with the new value.
  *
  * @param authorizeUrl The OAuth authorize URL to retrieve the token from.
  * @param scope The OAuth scopes to request.
  * @param redirectUri The OAuth redirect_uri callback URL.
  * @param clientID The OAuth client_id corresponding to the requesting client.
  * @example
  *const SpotifyTracks = () => {
  * const [token, getToken] = useOAuth2Token({
  *     authorizeUrl: "https://accounts.spotify.com/authorize",
  *     scope: ["user-library-read"],
  *     clientID: "abcdefg",
  *     redirectUri: document.location.origin + "/callback"
  * })
  *
  * const [response, setResponse] = React.useState()
  * const [error, setError] = React.useState()
  *
  * // when we get a token, query spotify
  * React.useEffect(() => {
  *     if (token == undefined) {return}
  *     fetch('https://api.spotify.com/v1/me/tracks', {
  *         headers: {
  *             Authorization: `Bearer ${token}`
  *         }
  *     }).then(
  *         json => response.json()
  *     ).then(
  *         data => setResponse(data)
  *     ).catch(
  *         error => setError(error)
  *     )
  * }, [token])
  *
  * if (!token || error) return <div onClick={getToken}> login with Spotify </div>
  *
  *return <div>
  * Your saved tracks on Spotify: {JSON.stringify(response)}
  *</div>
  *}
  */
 export const useOAuth2Token = ({
   /**
    * The OAuth authorize URL to retrieve the token
    * from.
    */
   authorizeUrl,
   /**
    * The OAuth scopes to request.
    */
   scope = [],
   /**
    * The OAuth `redirect_uri` callback.
    */
   redirectUri,
   /**
    * The OAuth `client_id` corresponding to the
    * requesting client.
    */
   clientId,
   /**
    * The FusionAuth `tenantId` corresponding to the
    * requesting client. - optional
    */
   tenantId,
   /**
    * The FusionAuth `locale` to be loaded
    */
   locale,
   /**
    * The FusionAuth `responseType`
    * default: 'token'
    */
   responseType
 }: Options): [OAuthToken | undefined, getToken, setToken] => {
   const target = {
     authorizeUrl,
     scope,
     clientId
   }
 
   const [token, setToken] = useStorage<string | null>(storagePrefix + '-' + JSON.stringify(target))
 
   let [state, setState] = useStorage<string>(oauthStateName)
   let [, setHasHandle] = useStorage<boolean>(storagePrefix + 'window-handle', {
     placeholder: false
   })
 
   const getToken = (language?: string) => {
     setState(
       (state = btoa(
         JSON.stringify({
           nonce: cryptoRandomString(),
           target
         })
       ))
     )
 
     window.open(
       OAuth2AuthorizeURL({
         scope,
         clientId,
         tenantId,
         authorizeUrl,
         state,
         redirectUri,
         locale: language || locale,
         responseType
       })
     )
     setHasHandle(true)
   }
 
   return [token, getToken, setToken]
 }
 
 /**
  * OAuthToken represents an OAuth2 implicit grant token.
  */
 export type OAuthToken = string | null
 
 /**
  * getToken is returned by [[useOAuth2Token]].
  * When called, it prompts the user to authorize.
  */
 export type getToken = (language?: string) => void
 
 /**
  * setToken is returned by [[useOAuth2Token]].
  * When called, it overwrites any stored OAuth token.
  * `setToken(undefined)` can be used to synchronously
  * invalidate all instances of this OAuth token.
  */
 export type setToken = (newValue: OAuthToken | null) => void
 
 /**
  * @hidden
  */
 export const cryptoRandomString = () => {
   const entropy = new Uint32Array(10)
   window.crypto.getRandomValues(entropy)
 
   return window.btoa([...entropy].join(','))
 }
 
 /**
  * @hidden
  */
 const OAuth2AuthorizeURL = ({
   scope,
   clientId,
   tenantId,
   state,
   authorizeUrl,
   redirectUri,
   locale,
   responseType = 'id_token token'
 }: {
   scope: string[]
   clientId: string
   tenantId?: string
   state: string
   authorizeUrl: string
   redirectUri: string
   responseType?: string
   locale?: string
 }) =>
   `${authorizeUrl}?${Object.entries({
     scope: scope.join(','),
     client_id: clientId,
     state,
     tenantId: tenantId,
     redirect_uri: redirectUri,
     response_type: responseType,
     locale
   })
     .filter(([k, v]) => typeof v !== 'undefined')
     .map(([k, v]) => [k, v ? encodeURIComponent(v) : v].join('='))
     .join('&')}`
 
 /**
  * This error is thrown by the [[OAuthCallback]]
  * when the state token recieved is incorrect or does not exist.
  */
 export const ErrIncorrectStateToken = new Error('incorrect state token')
 
 /**
  * This error is thrown by the [[OAuthCallback]]
  * if no access_token is recieved.
  */
 export const ErrNoAccessToken = new Error('no access_token')
 
 /**
  * @hidden
  */
 const urlDecode = (urlString: string): Map<string, string> =>
   Map(
     urlString.split('&').map<[string, string]>((param: string): [string, string] => {
       const sepIndex = param.indexOf('=')
       const k = decodeURIComponent(param.slice(0, sepIndex))
       const v = decodeURIComponent(param.slice(sepIndex + 1))
       return [k, v]
     })
   )
 
 /**
  * @hidden
  */
 const OAuthCallbackHandler: React.FunctionComponent<{}> = ({ children }) => {
   const [state] = useStorage<string>(oauthStateName)
   const { target } = state ? JSON.parse(atob(state)) : ''
   const [, /* token */ setToken] = useStorage(storagePrefix + '-' + JSON.stringify(target))
   const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
   const backendUrl = backendAPIConfig.basePath!
   let [hasHandle] = useStorage<boolean>(storagePrefix + 'window-handle', {
     placeholder: false
   })
 
    React.useEffect(() => {
      const params: Map<string, string> = Map([
        ...urlDecode(window.location.search.slice(1)),
        ...urlDecode(window.location.hash.slice(1))
      ])

      if (state !== params.get('state') || params.get('userState') !== 'Authenticated')
        throw ErrIncorrectStateToken

      const code = params.get('code')
      async function exchangeCodeForToken(code, backendUrl) {
        const response = await axios.get(
          `${backendUrl}/api/services/app/auth/oauth-callback?code=${code}`
        )
        if (response.status === 200) {
          setToken(response.data.access_token)
          if (hasHandle) {
            window.close()
          }
        }
      }
      exchangeCodeForToken(code, backendUrl)
    }, [setToken, state, hasHandle])
 
   return <React.Fragment>{children || 'please wait...'}</React.Fragment>
 }
 
 /**
  * OAuthCallback is a React component that handles the callback
  * step of the OAuth2 protocol.
  *
  * OAuth2Callback is expected to be rendered on the url corresponding
  * to your redirect_uri.
  *
  * By default, this component will deal with errors by closing the window,
  * via its own React error boundary. Pass `{ errorBoundary: false }`
  * to handle this functionality yourself.
  *
  * @example
  * <Route exact path="/callback" component={OAuthCallback} />} />
  */
 export const OAuthCallback: React.FunctionComponent<{
   errorBoundary?: boolean
 }> = ({
   /**
    * When set to true, errors are thrown
    * instead of just closing the window.
    */
   errorBoundary = true,
   children
 }) => {
   if (errorBoundary === false) return <OAuthCallbackHandler>{children}</OAuthCallbackHandler>
   return (
     <ClosingErrorBoundary>
       <OAuthCallbackHandler>{children}</OAuthCallbackHandler>
     </ClosingErrorBoundary>
   )
 }
 
 OAuthCallback.propTypes = {
   errorBoundary: PropTypes.bool
 }
 
 /**
  * @hidden
  */
 class ClosingErrorBoundary extends React.PureComponent {
   state = { errored: false }
 
   static getDerivedStateFromError(error: string) {
     console.error('Authentication error', error)
     localStorage.clear()
     setTimeout(() => {
       window.location.replace('/')
     }, 1000)
     // window.close()
     return { errored: true }
   }
 
   static propTypes = {
     children: PropTypes.func.isRequired
   }
 
   render() {
     return this.state.errored ? null : this.props.children
   }
 }
 
 /**
  * Parse a JWT client side
  * @param token
  */
 export function parseJWT(token: string): JWT | null {
   return token ? jwtDecode<JWT>(token) || null : null
 }
 
 /**
  * Client-side checking if a JWT token is expired
  * @param token
  */
 export function isExpired(token: string | JWT): boolean {
   const jwt = typeof token === 'string' ? parseJWT(token) : token
   return jwt && jwt.exp ? new Date(1000 * jwt.exp) < new Date() : true
 }
 
 /**
  * Call this function at the very page load
  * It will return the token if not expired
  * Otherwise it will remove it
  * It can help for storing/removing initial redux state
  * @param authorizeUrl
  * @param scope
  * @param clientId
  */
 export function restoreTokenInState(
   authorizeUrl: string,
   scope: string | string[],
   clientId
 ): string | null {
   const target = {
     authorizeUrl,
     scope,
     clientId
   }
   const key = storagePrefix + '-' + JSON.stringify(target)
   let storedToken = localStorage.getItem(key)
   if (typeof storedToken === 'string') {
     try {
       storedToken = JSON.parse(storedToken)
     } catch (err) {
       console.warn('Invalid stored Token', storedToken)
     }
   }
   if (storedToken) {
     // verify validity
     if (isExpired(storedToken)) {
       localStorage.removeItem(key)
       storedToken = null
     }
   }
   return storedToken
 }
 
 export default 'this module has no default export.'
 