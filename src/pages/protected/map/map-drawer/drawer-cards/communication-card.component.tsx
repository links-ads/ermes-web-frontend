import {
  CardActions,
  CardContent,
  Chip,
  IconButton,
  makeStyles,
  Typography
} from '@material-ui/core'
import { CommunicationScopeType, EntityType } from 'ermes-ts-sdk'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CardWithPopup from './card-with-popup.component'
import classes from './communication-card.module.scss'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import { FormatDate } from '../../../../../utils/date.utils'
import DrawerCardProps from '../../../../../models/DrawerCardProps'
import { EmergencyColorMap } from '../../api-data/emergency.component'

const useStyles = makeStyles((theme) => ({
  chipStyle: {
    marginBottom: 10,
    marginRight: '10px',
    backgroundColor: theme.palette.primary.dark,
    borderColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText
  }
}))

const CommunicationCard: React.FC<DrawerCardProps> = (props) => {
  const { t } = useTranslation(['common', 'maps'])
  const { elem, map, setMapHoverState, spiderLayerIds, spiderifierRef } = props
  const { message } = elem
  const style = useStyles()

  const lowerBoundDate = FormatDate(elem.duration?.lowerBound)
  const upperBoundDate = FormatDate(elem.duration?.upperBound)

  return (
    <CardWithPopup
      keyID={EntityType.COMMUNICATION + '-' + String(elem.id)}
      latitude={elem!.centroid!.latitude as number}
      longitude={elem!.centroid!.longitude as number}
      className={classes.card}
      map={map}
      setMapHoverState={setMapHoverState}
      spiderLayerIds={spiderLayerIds}
      id={elem.id}
      spiderifierRef={spiderifierRef}
      type={EntityType.COMMUNICATION}
      selectedCard={props.selectedCard}
      setSelectedCard={props.setSelectedCard}
    >
      <CardContent>
        <Typography
          variant="body2"
          component="h2"
          gutterBottom
          dangerouslySetInnerHTML={{
            __html: message.length > 200 ? message.substring(0, 200) + '...' : message
          }}
        ></Typography>
        <div>
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
              {elem.organizationName}
            </Typography>
          </>
        </div>

        <div className={classes.chipContainer}>
          <Chip
            label={
              elem.scope === CommunicationScopeType.RESTRICTED
                ? t('labels:restricted')
                : t('labels:public')
            }
            color="primary"
            size="small"
            className={style.chipStyle}
          />

          <>
            {' '}
            {elem.scope === CommunicationScopeType.RESTRICTED ? (
              <Chip
                label={t('labels:' + elem.restriction.toLowerCase())}
                color="primary"
                size="small"
                className={style.chipStyle}
              />
            ) : null}
          </>
        </div>

        <div>
          <Typography color="textSecondary">
            {' '}
            {lowerBoundDate} - {upperBoundDate}
          </Typography>
        </div>
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
            props.flyToCoords(
              elem?.centroid?.latitude as number,
              elem?.centroid?.longitude as number
            )
          }
          className={classes.viewInMap}
        >
          <LocationOnIcon htmlColor={EmergencyColorMap.Communication} />
        </IconButton>
      </CardActions>
    </CardWithPopup>
  )
}

export default CommunicationCard
