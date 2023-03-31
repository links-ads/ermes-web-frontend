import React, { memo, useContext } from 'react'
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
import { FiltersType } from './filters/reducer'
import { FiltersContext } from '../state/filters.context'

const Header = getHeader(styled)
const SidebarTrigger = getSidebarTrigger(styled)

export const AppBar = memo(function AppBarFn(/* { headerStyles, drawerOpen }: AppBarProps */) {
  const { isAuthenticated } = useUser()

  const location = useLocation()
  const path = location.pathname.split('/')
  path.shift()

  const timefilterActive = path[0] == 'dashboard' || path[0] == 'map' ? true : false

  const appBarContext = useContext(FiltersContext)
  const { filters, apply } = appBarContext

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
        {timefilterActive ? (
          <DashboardFilters filters={filters} onFilterApply={apply} />
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
