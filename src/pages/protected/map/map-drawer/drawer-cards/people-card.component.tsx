import { Box, CardActions, CardContent, IconButton, Typography } from "@mui/material";
import { EntityType } from "ermes-ts-sdk";
import React from "react";
import { FormatDate } from "../../../../../utils/date.utils";
import CardWithPopup from "./card-with-popup.component";
import LocationOnIcon from '@mui/icons-material/LocationOn'
import classes from './people-card.module.scss'
import { useTranslation } from "react-i18next";
import DrawerCardProps from "../../../../../models/DrawerCardProps";

const ENTITY_TYPE = EntityType.PERSON

const PeopleCard: React.FC<DrawerCardProps> = (props) => {
  const { elem, map, setMapHoverState, spiderLayerIds, spiderifierRef, flyToCoords } = props
  const timestamp = FormatDate(elem.timestamp)
  const { t } = useTranslation(['maps'])
  return (
    <CardWithPopup
      keyID={ENTITY_TYPE + String(elem.id)}
      latitude={elem?.location?.latitude as number}
      longitude={elem?.location?.longitude as number}
      className={classes.card}
      map={map}
      setMapHoverState={setMapHoverState}
      spiderLayerIds={spiderLayerIds}
      id={elem.id}
      spiderifierRef={spiderifierRef}
      type={ENTITY_TYPE}
    >
      <CardContent className={classes.topCard}>
        <div className={classes.headerBlock}>
          <Box component="div" display="inline-block">
            <Typography gutterBottom variant="h5" component="h2" style={{ marginBottom: '0px' }}>
              {elem.username.length > 22
                ? elem.username.substring(0, 20) + '...'
                : elem.displayName == null
                ? elem.username == null
                  ? elem.email
                  : elem.username
                : elem.displayName}
            </Typography>
          </Box>
          <Box component="div" display="inline-block">
            <Typography color="textSecondary" style={{ fontSize: '14px', paddingTop: '6px' }}>
              {timestamp}
            </Typography>
          </Box>
        </div>
        <div className={classes.pos}>
          {['status', 'activityName', 'organizationName', 'teamName'].map((type, index) => {
            if (elem[type]) {
              return (
                <div key={type+index}>
                  <Typography
                    component={'span'}
                    variant="caption"
                    color="textSecondary"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('maps:' + type)}:&nbsp;{' '}
                  </Typography>
                  <Typography component={'span'} variant="body1">
                    {elem[type]}
                  </Typography>
                  <br />
                </div>
              )
            }
            return null
          })}
        </div>
      </CardContent>
      <CardActions className={classes.cardAction}>
        <Typography variant="body2" color="textSecondary">
          {(elem?.location?.latitude as number)?.toFixed(4) +
            ' , ' +
            (elem?.location?.longitude as number)?.toFixed(4)}
        </Typography>
        <IconButton
          size="small"
          onClick={() =>
            flyToCoords(elem?.location?.latitude as number, elem?.location?.longitude as number)
          }
          className={classes.viewInMap}
        >
          <LocationOnIcon />
        </IconButton>
      </CardActions>
    </CardWithPopup>
  )
}

export default PeopleCard