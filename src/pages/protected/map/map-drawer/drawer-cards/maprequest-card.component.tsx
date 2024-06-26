import { Box, CardActions, CardContent, IconButton, Tooltip, Typography } from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FormatDate } from '../../../../../utils/date.utils'
import CardWithPopup from './card-with-popup.component'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import DeleteIcon from '@material-ui/icons/Delete'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import classes from './maprequest-card.module.scss'
import { EntityType, MapRequestDto, MapRequestStatusType, MapRequestType } from 'ermes-ts-sdk'
import MapRequestAccordion from './maprequest-accordion.component'
import { MapRequestLayerState } from '../../../../../models/mapRequest/MapRequestState'
import { EmergencyColorMap } from '../../api-data/emergency.component'
import { useUserPermission } from '../../../../../state/auth/auth.hooks'
import { PermissionAction, PermissionEntity } from '../../../../../state/auth/auth.consts'

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
  const { t } = useTranslation(['common', 'maps', 'labels'])

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
  const canCreateMapRequest = useUserPermission(
    PermissionEntity.MAP_REQUEST,
    PermissionAction.CREATE
  )
  const canDeleteMapRequest = useUserPermission(
    PermissionEntity.MAP_REQUEST,
    PermissionAction.DELETE
  )
  return (
    <CardWithPopup
      keyID={EntityType.MAP_REQUEST + '-' + String(mapRequestInfo.id)}
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
            {canCreateMapRequest ? (
              <Tooltip title={t('maps:operation_duplicate') ?? ''}>
                <IconButton
                  onClick={(evt) => {
                    evt.stopPropagation()
                    props.fetchRequestById(mapRequestInfo.id)
                  }}
                >
                  <FileCopyIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
            {canDeleteMapRequest && mapRequestInfo.status != MapRequestStatusType.CANCELED ? (
              <Tooltip title={t('maps:operation_delete') ?? ''}>
                <IconButton
                  onClick={(evt) => {
                    evt.stopPropagation()
                    props.deleteMR(mapRequestInfo.code, mapRequestInfo.id)
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
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
              {t('labels:' + mapRequestInfo.mapRequestType?.toLowerCase())}
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
        <div onClick={(evt) => evt.stopPropagation()} className={classes.pos}>
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
        <Tooltip title={t('maps:seeOnMap') ?? 'See on map'}>
          <IconButton
            size="small"
            onClick={(evt) => {
              evt.stopPropagation()
              setGoToCoord({
                latitude: mapRequestInfo.centroid?.latitude as number,
                longitude: mapRequestInfo.centroid?.longitude as number
              })
            }}
            className={classes.viewInMap}
          >
            <LocationOnIcon htmlColor={EmergencyColorMap.MapRequest} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </CardWithPopup>
  )
}

export default MapRequestCard
