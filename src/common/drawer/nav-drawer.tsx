import React from 'react'
import { getDrawerSidebar, getCollapseBtn, getSidebarContent } from '@mui-treasury/layout'
import styled from 'styled-components'

import { useUser } from '../../state/auth/auth.hooks'
import { NavContent } from './nav-content'
import { NavHeader } from './nav-header'
import { useLocation } from 'react-router'
import { Theme, createStyles, makeStyles } from '@material-ui/core'
const SidebarContent = styled(getSidebarContent(styled))`
  background-color: ${(props) => props.theme.palette.secondary.contrastText};
`
const useStyles = (props) =>
  makeStyles((theme: Theme) =>
    createStyles({
      drawerSidebarContainer: {
        top: 56,
        [theme.breakpoints.up('sm')]: {
          top: 260
        },
        [theme.breakpoints.up('md')]: {
          top: 210
        },
        [theme.breakpoints.up('lg')]: {
          top: 56
        }
      },
      '@global': {
        '.EdgeHeaderOffset': {
          height: props.filterActive ? '107px!important' : 64,
          '@media screen and (min-width: 514px)': {
            height: props.filterActive ? '245px!important' : 64
          },
          '@media screen and (min-width: 1075px)': {
            height: props.filterActive ? '205px!important' : 64
          },
          '@media screen and (min-width: 1321px)': {
            height: props.filterActive ? '146px!important' : 64
          },
          '@media screen and (min-width: 1566px)': {
            height: props.filterActive ? '107px!important' : 64
          }
        }
      }
    })
  )

const DrawerSidebar = getDrawerSidebar(styled)
const CollapseBtn = styled(getCollapseBtn(styled))`
  background-color: ${(props) => props.theme.palette.secondary.contrastText};
  color: ${(props) => props.theme.palette.primary.contrastText};
  min-height: 40px;
  min-width: 40px;
  border-color: ${(props) => props.theme.palette.primary.contrastText};
  :hover {
    background-color: ${(props) => props.theme.palette.background.default};
  }
`

export function NavDrawer() {
  const { isAuthenticated } = useUser()
  const location = useLocation()
  const path = location.pathname.split('/')
  path.shift()
  const filterActive = path[0] == 'dashboard' || path[0] == 'map' ? true : false
  const classes = useStyles({ filterActive })()
  return isAuthenticated ? (
    <DrawerSidebar sidebarId="left_sidebar">
      <SidebarContent
        style={{
          overflowX: 'hidden'
        }}
        className={classes.drawerSidebarContainer}
      >
        {/* <NavHeader /> */}
        <NavContent />
      </SidebarContent>
      <CollapseBtn />
    </DrawerSidebar>
  ) : null
}
