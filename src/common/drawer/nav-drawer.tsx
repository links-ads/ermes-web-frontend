import React from 'react'
import { getDrawerSidebar, getCollapseBtn, getSidebarContent } from '@mui-treasury/layout'
import styled from 'styled-components'

import { useUser } from '../../state/auth/auth.hooks'
import { NavContent } from './nav-content'
import { NavHeader } from './nav-header'
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
  return isAuthenticated ? (
    <DrawerSidebar sidebarId="left_sidebar">
      <SidebarContent style={{overflowX:'hidden'}}>
        <NavHeader />
        <NavContent />
      </SidebarContent>
      <CollapseBtn />
    </DrawerSidebar>
  ) : null
}
