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
import { getCameraState } from '../../../../../utils/get-camera-state.util'
import { CameraChip } from './camera-chip.component'

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
  const { t } = useTranslation(['common', 'maps', 'labels'])
  const { elem, map, setMapHoverState, spiderLayerIds, spiderifierRef } = props
  const dispatch = useDispatch()

  const theme = useTheme()

  const lastUpdate = getSensorsLastUpdate(elem?.sensors ?? [])

  const [
    hasFire,
    hasSmoke,
    hasAtLeastOneFireValidation,
    hasAllFireValidationsDiscarded,
    hasAtLeastOneSmokeValidation,
    hasAllSmokeValidationsDiscarded
  ] = useMemo(() => {
    const allMeasurements = elem?.sensors?.flatMap((sensor) => sensor.measurements) ?? []

    const [hasFire, hasAtLeastOneFireValidation, hasAllFireValidationsDiscarded] = getCameraState(
      'fire',
      allMeasurements
    )
    const [hasSmoke, hasAtLeastOneSmokeValidation, hasAllSmokeValidationsDiscarded] =
      getCameraState('smoke', allMeasurements)

    return [
      hasFire,
      hasSmoke,
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
            {t('labels:timestamp')}: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A'}
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
            <CameraChip status={hasFire} label={t('maps:fire')} />
            <CameraChip status={hasSmoke} label={t('maps:smoke')} />
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
