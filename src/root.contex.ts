import React, { useState } from 'react'

// Use this context to store stuff which is not serializable
// such as windows and timeout handles
// that cannot be added to redux state

interface GlobalContext {
  logoutHandle: Window | null
  updateLogoutHandle: (handle: Window | null) => void
  //Todo store other stuff if neede
}

export const defaultGlobalContext: GlobalContext = {
  logoutHandle: null,
  updateLogoutHandle: (handle: Window | null) => {}
  //   setLogoutHandle: handle =>
  //Todo store other stuff if neede
}

export function useRootContext(initialValue: GlobalContext): GlobalContext {
  const [logoutHandle, setLogoutHandle] = useState(initialValue.logoutHandle)
  function updateLogoutHandle(handle: Window | null): void {
    setLogoutHandle(handle)
  }
  return { logoutHandle, updateLogoutHandle }
}

export const RootContext = React.createContext(defaultGlobalContext)
