import { Box, CardActions, CardContent, IconButton, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { FormatDate } from "../../../../../utils/date.utils";
import CardWithPopup from "./card-with-popup.component";
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DeleteIcon from '@mui/icons-material/Delete'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import classes from './maprequest-card.module.scss'
import { MapRequestDto, MapRequestStatusType } from "ermes-ts-sdk";
import MapRequestAccordion from "./maprequest-accordion.component";
import { MapRequestLayerState } from "../../../../../models/mapRequest/MapRequestState";

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
    updateMapRequestsSettings
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
    >
      <CardContent>
        <div className={classes.headerBlock}>
          <div>
            <Box component="div" display="inline-block">
              <Typography gutterBottom variant="h5" component="h2" style={{ marginBottom: '0px' }}>
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
              {t('labels:creator')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {mapRequestInfo.displayName}
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
              {t('common:Frequency')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {mapRequestInfo.frequency}
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
              {t('common:Resolution')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {mapRequestInfo.resolution}
            </Typography>
            <br />
          </div>
        </div>
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
          <LocationOnIcon />
        </IconButton>
      </CardActions>
    </CardWithPopup>
  )
}

export default MapRequestCard