import './App.css'
import { SnackbarProvider } from 'notistack'
import CircularProgress from '@mui/material/CircularProgress'
import Layout, { Root as MUIRoot } from '@mui-treasury/layout'
import React, { Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppConfig, AppConfigContext } from './config'
import { useUITheme } from './state/preferences/preferences.hooks'
import { ThemeProvider as StyledComponentThemeProvider } from 'styled-components'
import CssBaseline from '@mui/material/CssBaseline'
import { Provider } from 'react-redux'
import { AppStore } from './state/create-store'
import { ModalProvider } from 'react-modal-hook'
import { TransitionGroup } from 'react-transition-group'
import { AxiosHooksConfigurator } from './common/types'


// TODO remove unused
// See https://mui-treasury.com/layout/api-reference/layout-builder/
// const scheme = Layout()
// scheme.configureHeader((builder) => {
//   builder
//     .registerConfig('xs', {
//       position: 'sticky'
//     })
//     .registerConfig('sm', {
//       clipped: true,
//       position: 'relative' // won't stick to top when scroll down
//     })
// })

// scheme.configureEdgeSidebar((builder) => {
//   builder
//     .create('left_sidebar', { anchor: 'left' })
//     .registerTemporaryConfig('xs', {
//       width: 'min(360px, 90vw)' // 'auto' is only valid for temporary variant
//     })
//     .registerPersistentConfig('sm', {
//       collapsible: true,
//       collapsedWidth: 64,
//       headerMagnetEnabled: false,
//       persistentBehavior: 'none',
//       width: 'min(360px, 90vw)' // 'auto' is only valid for temporary variant
//     })
// })

// lazy-loaded alternative for // import { Root } from "./Root";
// const Root = React.lazy(async () => {
//   const module = await import("./Root");
//   return { default: module.Root };
// });
// using default it's not needed
const Root = React.lazy(() => import('./Root'))

// Inner app component
function AppInner({
  axiosHooksConfiguration
}: {
  axiosHooksConfiguration: AxiosHooksConfigurator
}) {
  const { theme, themeName } = useUITheme()
  console.debug('Theme is now', themeName)
  return (
    <StyledComponentThemeProvider theme={theme}>
      <MUIRoot
        scheme={{
          header: {
            config: {
              xs: {
                position: 'sticky',
                height: 56,
              }, 
              md: {
                clipped: true,
                position: 'relative',
                height: 64
              }
            }
          }, 
          leftEdgeSidebar: {
            autoCollapse: "sm",
            config: {
              xs: {
                variant: "temporary",
                width: 'min(360px, 90vw)', // 256
              },
              md: {
                variant: "permanent",
                width: 'min(360px, 90vw)', // 256
                collapsible: true,
                collapsedWidth: 64,
                headerMagnetEnabled: true,
                // uncollapsedOnHover: true, // in v4, it was `autoExpanded`
              }
            }
          }
        }}
        // theme={theme}
        // initialState={{
        //   sidebar: {
        //     left_sidebar: {
        //       collapsed: true,
        //       open: false
        //     }
        //   }
        // }}
      >
        <SnackbarProvider>
          <ModalProvider rootComponent={TransitionGroup}>
            <CssBaseline />
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Root axiosHooksConfiguration={axiosHooksConfiguration} />
            </Suspense>
          </ModalProvider>
        </SnackbarProvider>
      </MUIRoot>
    </StyledComponentThemeProvider>
  )
}

// i18n translations might still be loaded by the xhr backend
// use react's Suspense
export default function App({
  config,
  store,
  axiosHooksConfiguration
}: {
  config: AppConfig
  store: AppStore
  axiosHooksConfiguration: AxiosHooksConfigurator
}) {
  return (
    <Provider store={store}>
      <Router basename={config.baseUrl}>
        <AppConfigContext.Provider value={config}>
          <AppInner axiosHooksConfiguration={axiosHooksConfiguration} />
        </AppConfigContext.Provider>
      </Router>
    </Provider>
  )
}
