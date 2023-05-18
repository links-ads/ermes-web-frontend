import React from 'react'

import { SizeAwareContainer } from '../../../common/size-aware-container.component'
import { DashboardLayout } from './dashboard-layout.component'
import { IDashboardWidgetLayoutConfig } from './dashboard.config'
import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export interface DashboardProps {
  className?: string
  rowHeight?: number
  initialConfig?: IDashboardWidgetLayoutConfig[]
}

const useStyles = makeStyles()((theme: Theme) => { return {
  dashboardContainer: {
    position: 'relative', 
    top: 56,
    [theme.breakpoints.up('sm')]: {
      top: 260,
    },
    [theme.breakpoints.up('md')]: {
      top: 210,
    },
    [theme.breakpoints.up('lg')]: {
      top: 56,
    },
  }
}})

export function Dashboard(props: DashboardProps) {
  const {classes} = useStyles()
  return (
    <SizeAwareContainer
      className={classes.dashboardContainer + " dashboard-container"}
      style={{
        width: '100%',
        height: 'calc(100% - 50px)',
        overflow: 'auto'
      }}
      initialHeight={window.innerHeight - 112}
    >
      <DashboardLayout {...props} />
    </SizeAwareContainer>
  )
}
