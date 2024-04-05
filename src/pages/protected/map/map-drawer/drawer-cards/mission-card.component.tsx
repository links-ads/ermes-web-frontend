import { CardActions, CardContent, Chip, IconButton, Typography } from '@material-ui/core'
import { EntityType } from 'ermes-backoffice-ts-sdk'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FormatDate } from '../../../../../utils/date.utils'
import CardWithPopup from './card-with-popup.component'
import classes from './mission-card.module.scss'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import DrawerCardProps from '../../../../../models/DrawerCardProps'
import { EmergencyColorMap } from '../../api-data/emergency.component'

const ENTITY_TYPE = EntityType.MISSION

const MissionCard: React.FC<DrawerCardProps> = (props) => {
  const { elem, map, setMapHoverState, spiderLayerIds, spiderifierRef, flyToCoords } = props
  const { t } = useTranslation(['common', 'maps'])
  const lowerBoundDate = FormatDate(elem.duration?.lowerBound)
  const upperBoundDate = FormatDate(elem.duration?.upperBound)
  return (
    <CardWithPopup
      keyID={ENTITY_TYPE + '-' + String(elem.id)}
      latitude={elem!.centroid!.latitude as number}
      longitude={elem!.centroid!.longitude as number}
      className={classes.card}
      map={map}
      setMapHoverState={setMapHoverState}
      spiderLayerIds={spiderLayerIds}
      id={elem.id}
      spiderifierRef={spiderifierRef}
      type={ENTITY_TYPE}
      selectedCard={props.selectedCard}
      setSelectedCard={props.setSelectedCard}
    >
      <CardContent>
        <div className={classes.hazardRow}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            style={{ marginBottom: '0px', width: '89%', display: 'inline-block' }}
          >
            {elem.title}
          </Typography>
          <Chip
            label={'#' + elem.id}
            color="primary"
            size="small"
            className={classes.chipStyle}
            disabled={false}
          />
        </div>
        <>
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:associatedReports')}:&nbsp;
          </Typography>
          <Typography component={'span'} variant="body1">
            {elem.reports.length}
          </Typography>
        </>
        <br />
        <>
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:organization')}:&nbsp;
          </Typography>
          <Typography component={'span'} variant="body1">
            {elem.organization == null ? '' : elem.organization.name}
          </Typography>
        </>
        <Typography color="textSecondary">
          {' '}
          {lowerBoundDate} - {upperBoundDate}
        </Typography>
        <>
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:mission_state')}:&nbsp;
          </Typography>
          <Typography component={'span'} variant="body1">
            {elem.currentStatus == null ? '' : t('labels:' + elem.currentStatus.toLowerCase())}
          </Typography>
        </>
      </CardContent>
      <CardActions className={classes.cardAction}>
        <Typography color="textSecondary">
          {(elem!.centroid!.latitude as number).toFixed(4) +
            ' , ' +
            (elem!.centroid!.longitude as number).toFixed(4)}
        </Typography>
        <IconButton
          size="small"
          onClick={() =>
            flyToCoords(elem?.centroid?.latitude as number, elem?.centroid?.longitude as number)
          }
          className={classes.viewInMap}
        >
          <LocationOnIcon htmlColor={EmergencyColorMap.Mission} />
        </IconButton>
      </CardActions>
    </CardWithPopup>
  )
}

export default MissionCard
