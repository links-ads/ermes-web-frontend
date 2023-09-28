import {
  Button,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Typography,
  useTheme
} from '@material-ui/core'
import { AlertDto, EntityType } from 'ermes-ts-sdk'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CardWithPopup from './card-with-popup.component'
import classes from './communication-card.module.scss'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import { FormatDate } from '../../../../../utils/date.utils'
import DrawerCardProps from '../../../../../models/DrawerCardProps'
import { EmergencyColorMap } from '../../api-data/emergency.component'
import { SensorDto, StationDto } from 'ermes-backoffice-ts-sdk'
import { CameraDetails } from '../camera-details.component'
import { useDispatch } from 'react-redux'
import { setSelectedCamera } from '../../../../../state/selected-camera.state'
import { getSensorsLastUpdate } from '../../../../../utils/get-sensors-last-update.util'
import {
  CameraValidationStatus,
  getCameraValidationStatus
} from '../../../../../utils/get-camera-validation-status.util'
import { Cancel, CheckCircle } from '@material-ui/icons'
import { DiscardedIcon, ValidatedIcon } from '../camera-chip-icons.component'

const MAX_DESCRIPTION_LENGTH = 500

const useStyles = makeStyles((theme) => ({
  chipStyle: {
    marginBottom: 10,
    marginRight: '10px',
    backgroundColor: theme.palette.primary.dark,
    borderColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText
  }
}))

const CameraCard: React.FC<{
  key: number
  elem: StationDto
  map: any
  setMapHoverState: any
  spiderLayerIds: any
  spiderifierRef: any
  flyToCoords: any
  selectedCard: any
  setSelectedCard: any
}> = (props) => {
  const { t } = useTranslation(['common', 'maps'])
  const { elem, map, setMapHoverState, spiderLayerIds, spiderifierRef } = props
  const dispatch = useDispatch()

  const theme = useTheme()

  const lastUpdate = getSensorsLastUpdate(elem?.sensors ?? [])

  const [
    hasFire,
    hasSmoke,
    hasNotAvailable,
    hasAtLeastOneFireValidation,
    hasAllFireValidationsDiscarded,
    hasAtLeastOneSmokeValidation,
    hasAllSmokeValidationsDiscarded
  ] = useMemo(() => {
    const hasFire = elem?.sensors?.some((sensor) =>
      sensor.measurements?.some((measurement) => measurement.metadata?.detection?.fire)
    )
    const hasSmoke = elem?.sensors?.some((sensor) =>
      sensor.measurements?.some((measurement) => measurement.metadata?.detection?.smoke)
    )
    const hasNotAvailable = elem?.sensors?.some((sensor) =>
      sensor.measurements?.some((measurement) => measurement.metadata?.detection?.not_available)
    )

    const hasAtLeastOneFireValidation = elem?.sensors?.some((sensor) => {
      return sensor.measurements?.some(
        (measurement) =>
          getCameraValidationStatus('fire', measurement.metadata) ===
          CameraValidationStatus.DetectedAndValidated
      )
    })

    const hasAllFireValidationsDiscarded = elem?.sensors?.every((sensor) => {
      return sensor.measurements?.every(
        (measurement) =>
          getCameraValidationStatus('fire', measurement.metadata) ===
          CameraValidationStatus.DetectedAndDiscarded
      )
    })

    const hasAtLeastOneSmokeValidation = elem?.sensors?.some((sensor) => {
      return sensor.measurements?.some(
        (measurement) =>
          getCameraValidationStatus('smoke', measurement.metadata) ===
          CameraValidationStatus.DetectedAndValidated
      )
    })

    const hasAllSmokeValidationsDiscarded = elem?.sensors?.every((sensor) => {
      return sensor.measurements?.every(
        (measurement) =>
          getCameraValidationStatus('smoke', measurement.metadata) ===
          CameraValidationStatus.DetectedAndDiscarded
      )
    })

    return [
      hasFire,
      hasSmoke,
      hasNotAvailable,
      hasAtLeastOneFireValidation,
      hasAllFireValidationsDiscarded,
      hasAtLeastOneSmokeValidation,
      hasAllSmokeValidationsDiscarded
    ]
  }, [elem])

  function handleShowDetails(event, elem) {
    event.stopPropagation()

    dispatch(setSelectedCamera(elem))
  }

  return (
    <>
      <CardWithPopup
        keyID={EntityType.STATION + '-' + String(elem.id)}
        latitude={elem!.location!.latitude as number}
        longitude={elem!.location!.longitude as number}
        className={classes.card}
        map={map}
        setMapHoverState={setMapHoverState}
        spiderLayerIds={spiderLayerIds}
        id={elem.id}
        spiderifierRef={spiderifierRef}
        type={EntityType.STATION}
        selectedCard={props.selectedCard}
        setSelectedCard={props.setSelectedCard}
      >
        <CardContent>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="body2" component="span" gutterBottom style={{ marginRight: 5 }}>
                {elem.name}
              </Typography>
              <Typography variant="caption" component="span" gutterBottom>
                (
                {(elem!.location!.latitude as number).toFixed(4) +
                  ' , ' +
                  (elem!.location!.longitude as number).toFixed(4)}
                )
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" component="h2" gutterBottom>
                {elem.sensors?.length ?? 0} {t('maps:orientations')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions className={classes.cardAction}>
          <Typography color="textSecondary" variant="caption">
            Last update: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A'}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()

              props.flyToCoords(
                elem?.location?.latitude as number,
                elem?.location?.longitude as number
              )
            }}
            className={classes.viewInMap}
          >
            <LocationOnIcon htmlColor={EmergencyColorMap.Station} />
          </IconButton>
        </CardActions>
        <CardActions className={classes.cardAction}>
          <div className={classes.chipContainer}>
            {hasFire && (
              <Chip
                avatar={
                  hasAllFireValidationsDiscarded ? (
                    <DiscardedIcon type="fire" avatar />
                  ) : hasAtLeastOneFireValidation ? (
                    <ValidatedIcon type="fire" avatar />
                  ) : undefined
                }
                color="primary"
                size="small"
                style={{
                  backgroundColor: theme.palette.error.dark,
                  borderColor: theme.palette.error.dark,
                  color: theme.palette.error.contrastText
                }}
                className={classes.chipStyle}
                label={t('maps:fire')}
              />
            )}
            {hasSmoke && (
              <Chip
                avatar={
                  hasAllSmokeValidationsDiscarded ? (
                    <DiscardedIcon type="fire" avatar />
                  ) : hasAtLeastOneSmokeValidation ? (
                    <ValidatedIcon type="fire" avatar />
                  ) : undefined
                }
                color="primary"
                size="small"
                style={{
                  backgroundColor: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.dark,
                  color: theme.palette.primary.dark
                }}
                className={classes.chipStyle}
                label={t('maps:smoke')}
              />
            )}
            {hasNotAvailable && (
              <Chip className={classes.chipStyle} label={t('maps:not_available')} />
            )}
          </div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={(e) => handleShowDetails(e, elem)}
          >
            {t('common:details')}
          </Button>
        </CardActions>
      </CardWithPopup>
    </>
  )
}

export default CameraCard
