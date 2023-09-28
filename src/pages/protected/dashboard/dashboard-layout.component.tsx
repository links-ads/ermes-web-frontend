import { Grid } from '@material-ui/core'
import React from 'react'
import { Map } from '../map/map.component'

export function DashboardLayout() {
  return (
    <Grid container style={{ height: '100%', padding: 12 }}>
      <Grid item xs={12} sm={4}>
        <Map dashboardMode height="100%" top="0px" />
      </Grid>
    </Grid>
  )
}
