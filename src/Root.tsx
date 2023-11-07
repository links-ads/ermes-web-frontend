import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useSidebarCollapse } from '@mui-treasury/layout/hooks'
import React, { memo, useEffect } from 'react'
import styled from 'styled-components'
import './App.css'
import { AppBar } from './common/app-bar'
import { Main } from './common/common.components'
import { NavDrawer } from './common/drawer/nav-drawer'
import { AxiosHooksConfigurator } from './common/types'
import { useSnackbars } from './hooks/use-snackbars.hook'
import { ContentRoutes } from './routes/content.routes'
import { useUser, useUserDataLoading } from './state/auth/auth.hooks'
import FiltersContextProvider from './state/filters.context'
import ErmesAxiosContextProvider from './state/ermesaxios.context'

const RoutesWrapper = styled.div<{ leftSidebarCollapsed: boolean }>`
  margin-left: ${(props) => (props.leftSidebarCollapsed ? '64px' : '0px')};
  width: ${(props) => (props.leftSidebarCollapsed ? 'calc(100% - 64px)' : '100%')};
  height: 100%;
`
// Body of the app
const MainContent = memo(
  function MainContent({ isAuthenticated }: { isAuthenticated: boolean }) {
    const profileLoading = useUserDataLoading()
    const { state } = useSidebarCollapse('left_sidebar')
    const { collapsed, open } = state
    console.debug('LS', collapsed, open)
    return (
      <Main className={`main content ${isAuthenticated ? 'logged-in' : 'not-logged-in'}`}>
        <RoutesWrapper
          className="routes-wrapper"
          leftSidebarCollapsed={collapsed === true && open === true}
        >
          <ContentRoutes />
        </RoutesWrapper>
        <Backdrop
          style={{ zIndex: 99999 }}
          open={profileLoading}
          className="user-profile-loading-backdrop"
        >
          <CircularProgress color="secondary" />
        </Backdrop>
      </Main>
    )
  },
  (prev, next) => prev.isAuthenticated === next.isAuthenticated
)

// Main visible component of the app
export default function Root({
  axiosHooksConfiguration
}: {
  axiosHooksConfiguration: AxiosHooksConfigurator
}) {
  const { displayErrorSnackbar, displayWarningSnackbar } = useSnackbars()

  useEffect(
    () => {
      console.debug('Mounting Root')
      //axiosHooksConfiguration(displayWarningSnackbar, displayErrorSnackbar)
      return () => {
        console.debug('Unmounting Root')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  // eslint-enable-next-line react-hooks/exhaustive-deps
  const { /* profile,  */ isAuthenticated } = useUser()

  return (
    <>
      <ErmesAxiosContextProvider>
        <FiltersContextProvider>
          <AppBar />
          <NavDrawer />
          <MainContent isAuthenticated={isAuthenticated} />
        </FiltersContextProvider>
      </ErmesAxiosContextProvider>
      {/* <GlobalFooter /> */} {/*commented before Shelter Venice Demo, April 2023*/}
    </>
  )
}
