import React, { memo } from 'react'
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

const Header = getHeader(styled)
const SidebarTrigger = getSidebarTrigger(styled)

export const AppBar = memo(function AppBarFn(/* { headerStyles, drawerOpen }: AppBarProps */) {
  const { isAuthenticated } = useUser()

  return (
    <Header color="primary" className={`header ${isAuthenticated ? 'logged-in' : 'not-logged-in'}`}>
      <Toolbar  style={{paddingLeft:'15px'}}>
        {isAuthenticated ? (
          <SidebarTrigger sidebarId="left_sidebar">
            {({ open }) => (open ? <Close /> : <Menu />)}
          </SidebarTrigger>
        ) : (
          <div />
        )}
        <BrandLogo />
        <Spacer />
        <TitleWidget />
        <Spacer />
        
        <ThemeSelect />
        <LanguageSelect />
        {isAuthenticated ? <AccountWidget /> : <div />}
      </Toolbar>
    </Header>
  )
})
