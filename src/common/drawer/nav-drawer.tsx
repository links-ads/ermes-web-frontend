import React from 'react'
import { getDrawerSidebar, getCollapseBtn, getSidebarContent } from '@mui-treasury/layout'
import styled from 'styled-components'

import { useUser } from '../../state/auth/auth.hooks'
import { NavContent } from './nav-content'
import { NavHeader } from './nav-header'
import { useLocation } from 'react-router'
const SidebarContent = styled(getSidebarContent(styled))`
background-color:  ${(props) => props.theme.palette.secondary.contrastText};
`

const DrawerSidebar = getDrawerSidebar(styled)
const CollapseBtn = styled(getCollapseBtn(styled))`
  background-color: ${(props) => props.theme.palette.secondary.contrastText};
  color: ${(props) => props.theme.palette.primary.contrastText};
  min-height: 40px;
  min-width: 40px;
  border-color: ${(props) => props.theme.palette.primary.contrastText};
:hover{
  background-color: ${(props) => props.theme.palette.background.default};
}

`

export function NavDrawer() {
  const { isAuthenticated } = useUser()
  const location = useLocation()
  const path = location.pathname.split('/')
  path.shift()
  const filterActive = path[0] == 'dashboard' || path[0] == 'map' ? true : false
  return isAuthenticated ? (
    <DrawerSidebar sidebarId="left_sidebar">
      <SidebarContent style={{overflowX:'hidden', position: filterActive ? 'sticky' : 'static', top: filterActive ? '112px' : '64px'}}>
        <NavHeader />
        <NavContent />
      </SidebarContent>
      <CollapseBtn />
    </DrawerSidebar>
  ) : null
}
