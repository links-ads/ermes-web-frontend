import React from 'react'
import { getDrawerSidebar, getCollapseBtn, getSidebarContent } from '@mui-treasury/layout'
import styled from 'styled-components'

import { useUser } from '../../state/auth/auth.hooks'
import { NavContent } from './nav-content'
import { NavHeader } from './nav-header'
const SidebarContent = styled(getSidebarContent(styled))`
background-color:  ${(props) => props.theme.palette.sideboard.main};
`

const DrawerSidebar = getDrawerSidebar(styled)
const CollapseBtn = styled(getCollapseBtn(styled))`
  background-color: ${(props) => props.theme.palette.sideboard.main};
  color: ${(props) => props.theme.palette.sideboard.textColor};
  min-height: 40px;
  min-width: 40px;
  border-color: ${(props) => props.theme.palette.sideboard.textColor};
:hover{
  background-color: ${(props) => props.theme.palette.sideboard.light};
}

`

export function NavDrawer() {
  const { isAuthenticated } = useUser()
  return isAuthenticated ? (
    <DrawerSidebar sidebarId="left_sidebar">
      <SidebarContent >
        <NavHeader />
        <NavContent />
      </SidebarContent>
      <CollapseBtn />
    </DrawerSidebar>
  ) : null
}
