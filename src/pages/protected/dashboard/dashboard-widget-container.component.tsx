import { Grid, CardHeader, Card, CardContent, Typography } from '@material-ui/core'
import React from 'react'

type DashboardWidgetContainerProps = {
  children: React.ReactNode
  info?: React.ReactNode
  title: string
}

export function DashboardWidgetContainer({ children, title, info }: DashboardWidgetContainerProps) {
  return (
    <Grid item xs={12} sm={6}>
      <Card style={{ width: '100%' }}>
        <CardContent>
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography
                variant="h6"
                style={{ textDecoration: 'underline', textTransform: 'uppercase' }}
              >
                {title}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">{info}</Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardContent>{children}</CardContent>
      </Card>
    </Grid>
  )
}
