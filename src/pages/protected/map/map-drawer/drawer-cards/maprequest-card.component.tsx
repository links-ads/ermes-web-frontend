import { Box, CardActions, CardContent, IconButton, Typography } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { FormatDate } from "../../../../../utils/date.utils";
import CardWithPopup from "./card-with-popup.component";
import LocationOnIcon from '@material-ui/icons/LocationOn'
import DeleteIcon from '@material-ui/icons/Delete'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import classes from './maprequest-card.module.scss'
import { EntityType, MapRequestDto, MapRequestStatusType } from "ermes-ts-sdk";
import MapRequestAccordion from "./maprequest-accordion.component";
import { MapRequestLayerState } from "../../../../../models/mapRequest/MapRequestState";
import { EmergencyColorMap } from "../../api-data/emergency.component";

const MapRequestCard: React.FC<{
  mapRequestInfo: MapRequestDto
  setGoToCoord
  map
  setMapHoverState
  spiderLayerIds
  spiderifierRef
  getMeta
  getLegend
  deleteMR
  fetchRequestById
  mapRequestSettings: MapRequestLayerState
  updateMapRequestsSettings
  selectedCard
  setSelectedCard
}> = (props) => {
  const { t } = useTranslation(['common', 'maps'])

  const {
    mapRequestInfo,
    setGoToCoord,
    map,
    setMapHoverState,
    spiderLayerIds,
    spiderifierRef,
    getMeta,
    getLegend,
    mapRequestSettings,
    updateMapRequestsSettings,
    selectedCard, 
    setSelectedCard
  } = props
  const lowerBoundDate = FormatDate(mapRequestInfo.duration?.lowerBound!)
  const upperBoundDate = FormatDate(mapRequestInfo.duration?.upperBound!)

  return (
    <CardWithPopup
      keyID={'map-request' + String(mapRequestInfo.id)}
      latitude={mapRequestInfo!.centroid!.latitude as number}
      longitude={mapRequestInfo!.centroid!.longitude as number}
      className={classes.card}
      map={map}
      setMapHoverState={setMapHoverState}
      spiderLayerIds={spiderLayerIds}
      id={mapRequestInfo.id}
      spiderifierRef={spiderifierRef}
      type={EntityType.MAP_REQUEST}
      selectedCard={selectedCard}
      setSelectedCard={setSelectedCard}
    >
      <CardContent>
        <div className={classes.headerBlock}>
          <div>
            <Box component="div" display="inline-block">
              <Typography gutterBottom variant="h5" component="h2" style={{ marginBottom: '0px' }}>
                {mapRequestInfo.title}
              </Typography>
              <Typography gutterBottom variant="h6" component="h3" style={{ marginBottom: '0px' }}>
                {mapRequestInfo.code}
              </Typography>
            </Box>
          </div>
          <div>
            <IconButton onClick={() => props.fetchRequestById(mapRequestInfo.id)}>
              <FileCopyIcon />
            </IconButton>
            {mapRequestInfo.status != MapRequestStatusType.CANCELED ? (
              <IconButton onClick={() => props.deleteMR(mapRequestInfo.code)}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </div>
        </div>
        <div className={classes.pos}>
          <div>
            <Typography
              component={'span'}
              variant="caption"
              color="textSecondary"
              style={{ textTransform: 'uppercase' }}
            >
              {t('labels:type')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {mapRequestInfo.mapRequestType}
            </Typography>
            <br />
          </div>
        </div>
        <div className={classes.pos}>
          <div>
            <Typography
              component={'span'}
              variant="caption"
              color="textSecondary"
              style={{ textTransform: 'uppercase' }}
            >
              {t('labels:creator')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {mapRequestInfo.displayName}
            </Typography>
            <br />
          </div>
        </div>
        {/* <div className={classes.pos}>
          <div>
            <Typography
              component={'span'}
              variant="caption"
              color="textSecondary"
              style={{ textTransform: 'uppercase' }}
            >
              {t('common:Frequency')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {mapRequestInfo.frequency}
            </Typography>
            <br />
          </div>
        </div> */}
        {/* <div className={classes.pos}>
          <div>
            <Typography
              component={'span'}
              variant="caption"
              color="textSecondary"
              style={{ textTransform: 'uppercase' }}
            >
              {t('common:Resolution')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {mapRequestInfo.resolution}
            </Typography>
            <br />
          </div>
        </div> */}
        <div className={classes.pos}>
          {['layer', 'status'].map((type, index) => {
            if (mapRequestInfo[type]) {
              return (
                <div key={'label_status_' + index}>
                  <Typography
                    component={'span'}
                    variant="caption"
                    color="textSecondary"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('maps:' + type)}:&nbsp;
                  </Typography>
                  <Typography component={'span'} variant="body1">
                    {t('labels:' + mapRequestInfo[type].toLowerCase())}
                  </Typography>
                  <br />
                </div>
              )
            }
            return null
          })}
        </div>
        <div className={classes.pos}>
          {mapRequestInfo.status === MapRequestStatusType.CONTENT_AVAILABLE && (
            <MapRequestAccordion
              getMeta={getMeta}
              getLegend={getLegend}
              map={map}
              mapRequestSettings={mapRequestSettings}
              updateMapRequestsSettings={updateMapRequestsSettings}
            />
          )}
        </div>
      </CardContent>
      <CardActions className={classes.cardAction}>
        <Typography color="textSecondary" variant="body2">
          {' '}
          {lowerBoundDate} - {upperBoundDate}
        </Typography>
        <IconButton
          size="small"
          onClick={() =>
            setGoToCoord({
              latitude: mapRequestInfo.centroid?.latitude as number,
              longitude: mapRequestInfo.centroid?.longitude as number
            })
          }
          className={classes.viewInMap}
        >
          <LocationOnIcon htmlColor={EmergencyColorMap.MapRequest} />
        </IconButton>
      </CardActions>
    </CardWithPopup>
  )
}

export default MapRequestCard