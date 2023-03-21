import { Button, Typography } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'

export const MapHeadDrawer = (props) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      headerBoldText: {
        fontWeight: 600,
        color: 'white'
      },
      headerText: {
        color: 'white'
      },
      button: {
        borderColor: 'white',
        color: 'white',
        borderWidth: 1,
        '&:disabled': {
          color: 'rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        },
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.4)'
        }
      }
    })
  )
  const classes = useStyles()
  const { t } = useTranslation(['social'])

  const { coordinates } = props

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '10%',
        maxHeight:50,
        backgroundColor: 'black',
        zIndex: 10,
        opacity: 0.5
      }}
    >
      <Grid
        container
        style={{ height: '100%' }}
        direction="row"
        justifyContent="space-evenly"
        alignItems="center"
        alignContent="center"
      >
        <Grid item>
          <Typography display="inline" className={classes.headerText} variant="h6">
            {t('social:map_longitude')} :{' '}
          </Typography>
          <Typography display="inline" className={classes.headerBoldText} variant="h6">
            {coordinates.length > 0 ? coordinates[0].toFixed(2) : props.mapViewport.longitude.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item>
          <Typography display="inline" className={classes.headerText} variant="h6">
            {t('social:map_latitude')} :{' '}
          </Typography>
          <Typography display="inline" className={classes.headerBoldText} variant="h6">
            {coordinates.length > 0 ? coordinates[1].toFixed(2) : props.mapViewport.latitude.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item>
          <Typography display="inline" className={classes.headerText} variant="h6">
            {t('social:map_zoom')} :{' '}
          </Typography>
          <Typography display="inline" className={classes.headerBoldText} variant="h6">
            {props.mapViewport.zoom.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => props.filterApplyHandler()}
            disabled={props.isLoading || props.mapRef?.current?.getMap() === undefined}
            className={classes.button}
          >
            {t('social:map_button_label')}
          </Button>
        </Grid>
        {props.children ? <Grid item>{props.children}</Grid> : undefined}
      </Grid>
    </div>
  )
}
