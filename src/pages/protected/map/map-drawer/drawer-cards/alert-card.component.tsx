import { CardActions, CardContent, Chip, IconButton, makeStyles, Typography } from "@material-ui/core";
import { AlertDto, EntityType } from "ermes-ts-sdk";
import React from "react";
import { useTranslation } from "react-i18next";
import CardWithPopup from "./card-with-popup.component";
import classes from './communication-card.module.scss'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import { FormatDate } from "../../../../../utils/date.utils";
import DrawerCardProps from "../../../../../models/DrawerCardProps";
import { EmergencyColorMap } from "../../api-data/emergency.component";

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

const AlertCard: React.FC<{ 
  key: number
  elem: AlertDto
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
  const { info } = elem
  const description =
    info![0].description!.length > MAX_DESCRIPTION_LENGTH
      ? info![0].description!.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
      : info![0].description!
  const style = useStyles()

  const lowerBoundDate = FormatDate(elem.sent!)
  const upperBoundDate = FormatDate(info![0].expires!)

  return (
    <CardWithPopup
      keyID={'alert' + String(elem.id)}
      latitude={elem!.centroid!.latitude as number}
      longitude={elem!.centroid!.longitude as number}
      className={classes.card}
      map={map}
      setMapHoverState={setMapHoverState}
      spiderLayerIds={spiderLayerIds}
      id={elem.id}
      spiderifierRef={spiderifierRef}
      type={EntityType.ALERT}
      selectedCard={props.selectedCard}
      setSelectedCard={props.setSelectedCard}
    >
      <CardContent>
        <div className={classes.chipContainer}>
          <Chip
            label={elem.isARecommendation ? t('labels:recommendation') : t('labels:alert')}
            color="primary"
            size="small"
            className={style.chipStyle}
          />

          <>
            {' '}
            <Chip
              label={elem.status!}
              color="secondary"
              size="small"
              className={style.chipStyle}
            />
          </>

          <>
            {' '}
            {elem.restriction ? (
              <Chip
                label={t('labels:' + elem.restriction?.toLowerCase())}
                color="primary"
                size="small"
                className={style.chipStyle}
              />
            ) : (
              <div />
            )}
          </>
        </div>
        <Typography variant="body2" component="h2" gutterBottom>
          {description}
        </Typography>
        <Typography variant="body2" component="h2" gutterBottom>
          {t('maps:location')}: {elem.region}
        </Typography>
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
          <LocationOnIcon htmlColor={EmergencyColorMap.Alert} />
        </IconButton>
      </CardActions>
    </CardWithPopup>
  )
}

export default AlertCard