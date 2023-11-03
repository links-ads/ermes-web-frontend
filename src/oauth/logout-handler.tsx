import React from "react"
import useStorage from "react-storage-hook"
import { oauthStateName, storagePrefix } from "./react-oauth2-hook-mod"


const OAuthLogoutCallbackHandler: React.FunctionComponent<{}> = ({ children }) => {
  // const [state] = useStorage<string>(oauthStateName)
  // const { target } = state ? JSON.parse(atob(state)) : ''
  // const [, setIsAuthenticated] = useStorage(storagePrefix + '-' + JSON.stringify(target))
  let [hasHandle] = useStorage<boolean>('logout-window-handle', {
    placeholder: false
  })

  React.useEffect(() => {
    //setIsAuthenticated(false)
    if (hasHandle) {
      window.close()
    }
  }, [hasHandle])

  return <React.Fragment>{children || 'please wait...'}</React.Fragment>
}

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

   render() {
     return this.state.errored ? null : this.props.children
   }
 }


export const OAuthLogoutCallback: React.FunctionComponent<{
  errorBoundary?: boolean
}> = ({
  /**
   * When set to true, errors are thrown
   * instead of just closing the window.
   */
  errorBoundary = true,
  children
}) => {
  if (errorBoundary === false) return <OAuthLogoutCallbackHandler>{children}</OAuthLogoutCallbackHandler>
  return (
    <ClosingErrorBoundary>
      <OAuthLogoutCallbackHandler>{children}</OAuthLogoutCallbackHandler>
    </ClosingErrorBoundary>
  )
}


