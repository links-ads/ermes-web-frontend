import React, { memo, useContext, useEffect, useMemo } from 'react'
// import { Header, SidebarTrigger, SidebarTriggerIcon } from '@mui-treasury/layout'
import { BrandLogo } from './app-bar-widgets/brand-logo/brand-logo'
import LanguageSelect from './app-bar-widgets/language-select'
import ThemeSelect from './app-bar-widgets/theme-select'
import { getHeader, getSidebarTrigger } from '@mui-treasury/layout'
import styled from 'styled-components'

import Toolbar from '@material-ui/core/Toolbar'
import { AccountWidget } from './app-bar-widgets/account-widget'
import { TitleWidget } from './app-bar-widgets/title-widget'
import { Spacer } from './common.components'
import Close from '@material-ui/icons/Close'
import Menu from '@material-ui/icons/Menu'
import { useUser } from '../state/auth/auth.hooks'
import { DashboardFilters } from '../pages/protected/dashboard/filters'
import { useLocation } from 'react-router'
import { FiltersContext } from '../state/filters.context'
import { TeamsApiFactory } from 'ermes-ts-sdk'
import { useAPIConfiguration } from '../hooks/api-hooks'
import useAPIHandler from '../hooks/use-api-handler'

const Header = getHeader(styled)
const SidebarTrigger = getSidebarTrigger(styled)

export const AppBar = memo(function AppBarFn(/* { headerStyles, drawerOpen }: AppBarProps */) {
  const { isAuthenticated } = useUser()

  const location = useLocation()
  const path = location.pathname.split('/')
  path.shift()

  const filterActive = path[0] == 'dashboard' || path[0] == 'map' ? true : false
  const showCategoryFilters = path[0] !== 'dashboard' ? true : false

  const filtersCtx = useContext(FiltersContext)
  const {
    localStorageFilters,
    filters,
    mapDrawerTabVisibility,
    lastUpdate,
    applyDate,
    applyFilters,
    updateTeamList,
    updateMapDrawerTabs
  } = filtersCtx

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const teamsApiFactory = useMemo(() => TeamsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [teamsApiHandlerState, handleTeamsAPICall] = useAPIHandler(false)

  useEffect(() => {
    handleTeamsAPICall(() => {
      return teamsApiFactory.teamsGetTeams(1000)
    })
  }, [teamsApiFactory, handleTeamsAPICall])

  useEffect(() => {
    if (
      !teamsApiHandlerState.loading &&
      !!teamsApiHandlerState.result &&
      teamsApiHandlerState.result.data
    ) {
      //update starting filter object with actual team names from http
      const teamNamesList = teamsApiHandlerState.result.data.data.map((t) => t.name)
      updateTeamList(teamNamesList)
    }
  }, [teamsApiHandlerState])

  return (
    <Header
      color="primary"
      className={`header ${isAuthenticated ? 'logged-in' : 'not-logged-in'}`}
      style={{
        boxShadow:
          '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
        height: 'auto'
      }}
    >
      <Toolbar style={{ paddingLeft: '15px' }}>
        {isAuthenticated ? (
          <SidebarTrigger sidebarId="left_sidebar">
            {({ open }) => (open ? <Close /> : <Menu />)}
          </SidebarTrigger>
        ) : (
          <div />
        )}
        <BrandLogo />
        <Spacer />
        {filterActive ? (
          <DashboardFilters
            filters={filters}
            localStorageFilters={localStorageFilters}
            mapDrawerTabVisibility={mapDrawerTabVisibility}
            lastUpdate={lastUpdate}
            onDateFilterApply={applyDate}
            onFilterApply={applyFilters}
            onFilterChecked={updateMapDrawerTabs}
            showCategoryFilters={showCategoryFilters}
          />
        ) : (
          <TitleWidget />
        )}
        <Spacer />

        <ThemeSelect />
        <LanguageSelect />
        {isAuthenticated ? <AccountWidget /> : <div />}
      </Toolbar>
    </Header>
  )
})
