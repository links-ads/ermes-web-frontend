import React, { useEffect, useMemo, useState } from 'react'
import Typography from '@material-ui/core/Typography'
import { Button, CardHeader, Chip, Grid, IconButton, useTheme } from '@material-ui/core'
import styled from 'styled-components'
import green from '@material-ui/core/colors/green'
import { makeStyles } from '@material-ui/core/styles'
import CardContent from '@material-ui/core/CardContent'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardMedia from '@material-ui/core/CardMedia'
import useReportById from '../../../../hooks/use-report-by-id.hook'
import Carousel from 'react-material-ui-carousel'
import CircularProgress from '@material-ui/core/CircularProgress'
import { HAZARD_SOCIAL_ICONS } from '../../../../utils/utils.common'
import { useTranslation } from 'react-i18next'
import { Avatar } from '@material-ui/core'
import useCategoriesList from '../../../../hooks/use-categories-list.hook'
import useCommById from '../../../../hooks/use-comm-by-id.hook'
import useMissionsById from '../../../../hooks/use-missions-by-id.hooks'
import Box from '@material-ui/core/Box'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import Modal from '@material-ui/core/Modal'
import useMapRequestById from '../../../../hooks/use-map-requests-by-id'
import { CommunicationScopeType, EntityType } from 'ermes-ts-sdk'
import usePeopleList from '../../../../hooks/use-people-list.hook'
import { yellow } from '@material-ui/core/colors'
import useAlertList from '../../../../hooks/use-alerts.hook'
import { FormatDate } from '../../../../utils/date.utils'
import useCameraList from '../../../../hooks/use-cameras.hook'
import { MapRequestType } from 'ermes-backoffice-ts-sdk'
import { getSensorsLastUpdate } from '../../../../utils/get-sensors-last-update.util'
import ccmClasses from '../map-drawer/drawer-cards/communication-card.module.scss'
import { useDispatch } from 'react-redux'
import { setSelectedCamera } from '../../../../state/selected-camera.state'
import {
  CameraValidationStatus,
  getCameraValidationStatus
} from '../../../../utils/get-camera-validation-status.util'
import { DiscardedIcon, ValidatedIcon } from '../map-drawer/camera-chip-icons.component'
import { getCameraState } from '../../../../utils/get-camera-state.util'

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)'
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  cardAction: {
    justifyContent: 'space-between',
    padding: 16
  },
  media: {
    height: 240
  },
  card: {
    width: '400px',
    height: 'auto'
  },
  chipCommContainer: {
    width: '100%'
  },
  chipCommStyle: {
    marginBottom: 10,
    marginRight: '10px',
    backgroundColor: theme.palette.primary.dark,
    borderColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText
  },
  paper: {
    position: 'absolute',
    width: 800,
    // backgroundColor: theme.palette.background.paper,
    // border: '2px solid #000',
    // boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  },
  chipContainer: {
    display: 'block',
    height: '12px',
    marginTop: '10px'
  },
  chipStyle: {
    marginBottom: 3,
    position: 'relative',
    float: 'left',
    marginRight: '5px'
  }
}))
const mapRequestCard = (
  details,
  classes,
  formatter,
  t,
  description,
  creator,
  latitude,
  longitude
) => {
  const { isLoading, data } = details

  if (isLoading) {
    return <p>...</p>
  } else {
    const mapRequestDetails = data.feature.properties
    return (
      <Card elevation={0} style={{ overflowX: 'auto' }}>
        <CardContent style={{ paddingTop: '10px' }}>
          <div className={classes.headerBlock}>
            <Box component="div" display="inline-block">
              <Typography gutterBottom variant="h5" component="h2" style={{ marginBottom: '0px' }}>
                {mapRequestDetails.title}
              </Typography>
              <Typography gutterBottom variant="h6" component="h3" style={{ marginBottom: '0px' }}>
                {mapRequestDetails.code}
              </Typography>
            </Box>
          </div>
          <br />
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:status')}:&nbsp;
          </Typography>
          <Typography component={'span'} variant="body1">
            {t('labels:' + mapRequestDetails.status.toLowerCase())}
          </Typography>
          <br />
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:organizationName')}:&nbsp;
          </Typography>
          <Typography component={'span'} variant="body1">
            {t('labels:' + mapRequestDetails.organization.name.toLowerCase())}
          </Typography>
          <br />
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:creator')}:&nbsp;
          </Typography>
          <Typography component={'span'} variant="body1">
            {t('labels:' + mapRequestDetails.displayName.toLowerCase())}
          </Typography>
          <br />
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('labels:type')}:&nbsp;
          </Typography>
          {mapRequestDetails.mapRequestType === MapRequestType.FIRE_AND_BURNED_AREA ||
          mapRequestDetails.mapRequestType === MapRequestType.FLOODED_AREA ? (
            <>
              <Typography component={'span'} variant="body1">
                {t('labels:' + mapRequestDetails.mapRequestType.toLowerCase())}
              </Typography>
              <br />
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('labels:mapRequestFrequency')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {mapRequestDetails.frequency}
              </Typography>
              <br />
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('labels:mapRequestResolution')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {mapRequestDetails.resolution}
              </Typography>
              <br />
            </>
          ) : undefined}
          {mapRequestDetails.mapRequestType === MapRequestType.POST_EVENT_MONITORING ? (
            <>
              <Typography component={'span'} variant="body1">
                {t('maps:postEventMonitoring')}
              </Typography>
              <br />
            </>
          ) : undefined}
          {mapRequestDetails.mapRequestType === MapRequestType.WILDFIRE_SIMULATION ? (
            <>
              <Typography component={'span'} variant="body1">
                {t('maps:wildfireSimulation')}
              </Typography>
              <br />
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:hoursOfProjectionLabel')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {mapRequestDetails.timeLimit}
              </Typography>
              <br />
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:probabilityRangeLabel')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {mapRequestDetails.probabilityRange * 100 + '%'}
              </Typography>
              <br />
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:simulationFireSpottingLabel')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {mapRequestDetails.doSpotting ? t('maps:yes') : t('maps:no')}
              </Typography>
              <br />
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:boundaryConditionsLabel')}:&nbsp;
              </Typography>
              <Table className={classes.table} aria-label="simple table">
                <TableHead></TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{t('maps:timeOffsetLabel')}</TableCell>
                    {mapRequestDetails.boundaryConditions.map((row, idx) => (
                      <TableCell key={'time-' + idx} align="left">
                        {row.time}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('maps:windDirectionLabel')}</TableCell>
                    {mapRequestDetails.boundaryConditions.map((row, idx) => (
                      <TableCell key={'wind-direction-' + idx} align="left">
                        {row.windDirection}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('maps:windSpeedLabel')}</TableCell>
                    {mapRequestDetails.boundaryConditions.map((row, idx) => (
                      <TableCell key={'wind-speed-' + idx} align="left">
                        {row.windSpeed}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('maps:fuelMoistureContentLabel')}</TableCell>
                    {mapRequestDetails.boundaryConditions.map((row, idx) => (
                      <TableCell key={'moisture-' + idx} align="left">
                        {row.moisture}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('maps:fireBreakLabel')}</TableCell>
                    {mapRequestDetails.boundaryConditions.map((row, idx) => (
                      <TableCell key={'firebreak-' + idx} align="left">
                        {row.fireBreak ? Object.keys(row.fireBreak)[0] : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
              <br />
            </>
          ) : undefined}
        </CardContent>
        <CardActions className={classes.cardAction}>
          <Typography color="textSecondary">
            {formatter.format(new Date(mapRequestDetails.duration.lowerBound as string))} - <br />{' '}
            {formatter.format(new Date(mapRequestDetails.duration.upperBound as string))}
          </Typography>

          <Typography color="textSecondary">
            {(latitude as number).toFixed(4) + ' , ' + (longitude as number).toFixed(4)}
          </Typography>
        </CardActions>
      </Card>
    )
  }
}
const personCard = (details, classes, formatter, t, description, creator, latitude, longitude) => {
  let extensionData = details['extensionData'] ? JSON.parse(details['extensionData']) : undefined
  console.log('DETTAGLI', details)
  //console.log('DESCRIPTION', description)
  return (
    <>
      <Card elevation={0}>
        <CardContent style={{ paddingTop: '0px' }}>
          <Box component="div" display="inline-block">
            <Typography gutterBottom variant="h5" component="h2" style={{ marginBottom: '0px' }}>
              {creator}
            </Typography>
          </Box>
          <div style={{ marginBottom: 10 }}>
            <Typography component={'span'} variant="h5">
              {description}
            </Typography>
          </div>
          {['status', 'details', 'organizationName', 'teamName'].map((type) => {
            if (details[type] && details[type] !== 'null') {
              return (
                <>
                  <Typography
                    component={'span'}
                    variant="caption"
                    color="textSecondary"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('maps:' + (type !== 'details' ? type : 'activityName'))}:&nbsp;
                    {/* {elem.replace(/([A-Z])/g, ' $1').trim()}: &nbsp; */}
                  </Typography>
                  <Typography component={'span'} variant="body1">
                    {details[type]}
                  </Typography>
                  <br />
                </>
              )
            }
            return null
          })}

          {extensionData ? (
            <>
              <div>
                <Typography
                  component={'span'}
                  variant="caption"
                  color="textSecondary"
                  style={{ textTransform: 'uppercase' }}
                >
                  {'Extension data'}:&nbsp;
                </Typography>
                {Object.keys(extensionData).map((key) => {
                  return (
                    <span
                      style={{
                        width: '100%',
                        display: 'block',
                        height: '20px',
                        marginLeft: '35px'
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant="caption"
                        color="textSecondary"
                        style={{ textTransform: 'uppercase' }}
                      >
                        {key}:&nbsp;
                      </Typography>
                      <Typography component={'span'} variant="body1">
                        {'\t' + String(extensionData[key])}
                      </Typography>
                    </span>
                  )
                })}
              </div>
              {/* {"on": true, "oxygen": "40%", "heartbeat": "96bpm", "timestamp": "2021-02-04T11:45:00Z"} */}
              {/* <TableContainer component={Paper}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">
                        <b>{t('maps:on')}</b>
                      </TableCell>
                      <TableCell align="left">
                        <b>{t('maps:oxygen')}</b>
                      </TableCell>
                      <TableCell align="left">
                        <b>{t('maps:heartbeat')}</b>
                      </TableCell>
                      <TableCell align="left">
                        <b>{t('maps:timestamp')}</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" align="left" scope="row">
                        {extensionData['on'] ? t('maps:yes') : t('maps:no')}
                      </TableCell>
                      <TableCell align="center">{extensionData['oxygen']}</TableCell>
                      <TableCell align="center">{extensionData['heartbeat']}</TableCell>
                      <TableCell align="center">
                        {formatter.format(new Date(extensionData['timestamp'] as string))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer> */}
              <br />
            </>
          ) : null}
        </CardContent>
        <CardActions className={classes.cardAction}>
          <Typography color="textSecondary">
            {formatter.format(new Date(details.startDate as string))}
          </Typography>

          <Typography color="textSecondary">
            {(latitude as number).toFixed(4) + ' , ' + (longitude as number).toFixed(4)}
          </Typography>
        </CardActions>
      </Card>
    </>
  )
}

const missCard = (data, classes, t, formatter, latitude, longitude, flyToCoords) => {
  const details: {
    title: null | 'coord_person' | 'coord_team' | 'coord_org'
    content: null | string
  } = { title: null, content: null }

  if (data.data?.feature?.properties?.coordinatorPersonId) {
    details.title = 'coord_person'
    details.content = data.data?.feature?.properties?.coordinatorPersonId
  } else if (data.data?.feature?.properties?.coordinatorTeamId) {
    details.title = 'coord_team'
    details.content = data.data?.feature?.properties?.coordinatorTeamId
  } else if (data.data?.feature?.properties?.organization) {
    details.title = 'coord_org'
    details.content = data.data?.feature?.properties?.organization.name
  }
  if (!data.isLoading) {
    return (
      <>
        <Card elevation={0}>
          <CardContent style={{ paddingTop: '0px' }}>
            <div style={{ marginBottom: 10 }}>
              <Typography component={'span'} variant="h5">
                {data.data?.feature?.properties?.title}
              </Typography>
            </div>
            <div style={{ marginBottom: 10 }}>
              <Typography component={'span'} variant="body1">
                {data.data?.feature?.properties?.description}
              </Typography>
            </div>
            <div>
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:' + details.title)}:&nbsp;
                {/* {elem.replace(/([A-Z])/g, ' $1').trim()}: &nbsp; */}
              </Typography>
              <Typography component={'span'} variant="body1">
                {details.content}
              </Typography>
              <br />
            </div>
            <div>
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:mission_state')}:&nbsp;
                {/* {elem.replace(/([A-Z])/g, ' $1').trim()}: &nbsp; */}
              </Typography>
              <Typography component={'span'} variant="body1">
                {t('labels:' + data.data.feature.properties.currentStatus)}
              </Typography>
              <br />
            </div>
            <div>
              {data.data?.feature?.properties?.reports?.length > 0 ? (
                <>
                  <Typography
                    component={'span'}
                    variant="caption"
                    color="textSecondary"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('maps:associated_report_list')}:&nbsp;
                    {/* {elem.replace(/([A-Z])/g, ' $1').trim()}: &nbsp; */}
                  </Typography>

                  <Typography component={'span'} variant="body1">
                    {/* {'\t' + String(extensionData[key])} */}
                    <TableContainer component={Paper}>
                      <Table className={classes.table} size="small" aria-label="a dense table">
                        <TableHead>
                          <TableRow>
                            <TableCell align="left">
                              <b>{t('maps:hazard')}</b>
                            </TableCell>
                            <TableCell align="left">
                              <b>{t('maps:organizationName')}</b>
                            </TableCell>
                            <TableCell align="left">
                              <b>{t('maps:timestamp')}</b>
                            </TableCell>
                            <TableCell align="left"></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.data?.feature?.properties?.reports.map((elem) => {
                            return (
                              <TableRow>
                                <TableCell component="th" align="left" scope="row">
                                  {elem.hazard}
                                </TableCell>
                                <TableCell align="center">{elem.organizationName}</TableCell>
                                <TableCell align="center">
                                  {formatter.format(new Date(elem.timestamp as string))}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      flyToCoords({
                                        latitude: elem?.location?.latitude as number,
                                        longitude: elem?.location?.longitude as number
                                      })
                                    }
                                  >
                                    <LocationOnIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Typography>
                </>
              ) : null}
            </div>
          </CardContent>

          <CardActions className={classes.cardAction}>
            <Typography color="textSecondary">
              {formatter.format(
                new Date(data.data?.feature?.properties?.duration?.lowerBound as string)
              ) + ' - '}
              <br />
              {formatter.format(
                new Date(data.data?.feature?.properties?.duration?.upperBound as string)
              )}
            </Typography>

            <Typography color="textSecondary">
              {(latitude as number).toFixed(4) + ' , ' + (longitude as number).toFixed(4)}
            </Typography>
          </CardActions>
        </Card>
      </>
    )
  }
  return (
    <div>
      <CircularProgress />
    </div>
  )
}

const commCard = (data, classes, t, formatter, latitude, longitude, commInfo) => {
  if (!data.isLoading) {
    return (
      <>
        <Card elevation={0}>
          <CardContent>
            <div style={{ marginBottom: 10 }}>
              <Typography
                variant="body2"
                component="h2"
                gutterBottom
                dangerouslySetInnerHTML={{ __html: data.data?.feature?.properties?.message }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <Typography
                component={'span'}
                variant="caption"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:organization')}:&nbsp;
                {/* {elem.replace(/([A-Z])/g, ' $1').trim()}: &nbsp; */}
              </Typography>
              <Typography component={'span'} variant="body1">
                {commInfo.organizationName}
              </Typography>
            </div>

            <div className={classes.chipCommContainer}>
              <Chip
                label={
                  data.data?.feature?.properties?.scope === CommunicationScopeType.RESTRICTED
                    ? t('labels:restricted')
                    : t('labels:public')
                }
                color="primary"
                size="small"
                className={classes.chipCommStyle}
              />

              <>
                {' '}
                {data.data?.feature?.properties?.scope === CommunicationScopeType.RESTRICTED ? (
                  <Chip
                    label={t('labels:' + data.data?.feature?.properties?.restriction.toLowerCase())}
                    color="primary"
                    size="small"
                    className={classes.chipCommStyle}
                  />
                ) : null}
              </>
            </div>

            <Typography color="textSecondary">
              {formatter.format(
                new Date(data.data?.feature?.properties?.duration?.lowerBound as string)
              )}{' '}
              -{' '}
              {formatter.format(
                new Date(data.data?.feature?.properties?.duration?.upperBound as string)
              )}
            </Typography>
          </CardContent>
          <CardActions className={classes.cardAction}>
            <Typography color="textSecondary">
              {(latitude as number).toFixed(4) + ' , ' + (longitude as number).toFixed(4)}
            </Typography>
          </CardActions>
        </Card>
      </>
    )
  }
  return (
    <div>
      <CircularProgress />
    </div>
  )
}

const reportCard = (data, t, classes, catDetails, formatter, openModal, setOpenModal, theme) => {
  // function getModalStyle() {
  //   const top = 50
  //   const left = 50

  //   return {
  //     top: `${top}%`,
  //     left: `${left}%`,
  //     transform: `translate(-${top}%, -${left}%)`
  //   }
  // }

  const details = data?.data?.feature?.properties

  function guessMediaType(mediaType) {
    const extension = mediaType.split('.').pop()
    console.log('MEDIA TYPE', extension)
    if (
      extension === 'jpeg' ||
      extension === 'jpg' ||
      extension === 'png' ||
      extension === 'gif' ||
      extension === 'PNG'
    ) {
      return 'img'
    } else if (extension === 'mp4' || extension === 'webm') {
      return 'video'
    } else {
      return 'audio'
    }
  }
  console.debug('REP DATA DATUM', data)
  console.debug('REP DATA DATUM DETA', catDetails)
  if (!data.isLoading) {
    return (
      <>
        <Card elevation={0}>
          <Carousel
            animation="slide"
            autoPlay={false}
            // timeout={800}
            fullHeightHover={false}
            activeIndicatorIconButtonProps={{
              className: '',
              style: {
                color: theme.palette.secondary.main
              }
            }}
            navButtonsAlwaysInvisible={details.mediaURIs.length < 2}
          >
            {details.mediaURIs.map((media, idx) => {
              return (
                <CardMedia
                  key={idx}
                  className={classes.media}
                  src={media.mediaURI}
                  component={guessMediaType(media.mediaURI)}
                  style={{ minHeight: '250px', borderRadius: 6 }}
                  // autoPlay={true}
                  controls={true}
                  onClick={() => {
                    setOpenModal(true)
                  }}
                />
              )
            })}
          </Carousel>
          <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            {
              <Card
                elevation={0}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                className={classes.paper}
              >
                <Carousel
                  animation="slide"
                  autoPlay={false}
                  // timeout={800}

                  fullHeightHover={false}
                  activeIndicatorIconButtonProps={{
                    className: '',
                    style: {
                      color: theme.palette.secondary.main
                    }
                  }}
                  navButtonsAlwaysInvisible={details.mediaURIs.length < 2}
                >
                  {details.mediaURIs.map((media, idx) => {
                    return (
                      <CardMedia
                        key={idx}
                        // className={classes.media}
                        autoPlay={true}
                        controls={true}
                        src={media.mediaURI} //media.mediaURI
                        style={{ maxHeight: '750px', minHeight: '250px' }}
                        component={guessMediaType(media.mediaURI)}
                        onClick={() => {
                          setOpenModal(true)
                        }}
                      />
                    )
                  })}
                </Carousel>
              </Card>
            }
          </Modal>
          <CardContent style={{ paddingTop: '0px' }}>
            <div style={{ marginBottom: 10 }}>
              <Typography component={'span'} variant="h5">
                {details.description}
              </Typography>
            </div>
            <Typography gutterBottom variant="h4" component="h2" style={{ wordBreak: 'break-all' }}>
              <Chip
                avatar={<Avatar>{HAZARD_SOCIAL_ICONS[details.hazard.toLowerCase()]}</Avatar>}
                label={t('maps:' + details.hazard.toLowerCase())}
              />
            </Typography>

            {['address', 'notes', 'organizationName', 'status', 'username'].map((elem) => {
              if (details[elem]) {
                return (
                  <>
                    <Typography
                      component={'span'}
                      variant="caption"
                      className={classes.pos}
                      color="textSecondary"
                      style={{ textTransform: 'uppercase' }}
                    >
                      {t('maps:' + elem)}:&nbsp;
                      {/* {elem.replace(/([A-Z])/g, ' $1').trim()}: &nbsp; */}
                    </Typography>
                    <Typography component={'span'} variant="body1">
                      {details[elem]}
                    </Typography>
                    <br />
                  </>
                )
              }
              return null
            })}
            <div className={classes.chipContainer}>
              <Chip
                label={details.isPublic ? t('common:public') : t('common:private')}
                color="primary"
                size="small"
                className={classes.chipStyle}
              />
              <Chip
                label={t('common:' + details.content.toLowerCase())}
                color="primary"
                size="small"
                className={classes.chipStyle}
                style={{
                  backgroundColor: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.dark,
                  color: theme.palette.primary.dark
                }}
              />
            </div>
          </CardContent>
          {details?.extensionData.length > 0 ? (
            <TableContainer component={Paper}>
              <Table className={classes.table} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left" width="35%">
                      <b>{t('maps:group')}</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>{t('maps:name')}</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>{t('maps:target')}</b>
                    </TableCell>

                    <TableCell align="left">
                      <b>{t('maps:value')}</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details!.extensionData.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell align="left" width="35%">
                        {catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.groupIcon}{' '}
                        {catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.group}
                      </TableCell>
                      <TableCell component="th" align="left" scope="row">
                        {catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.name}
                      </TableCell>
                      <TableCell align="center">
                        {t(
                          'maps:' +
                            catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.target
                        )}
                      </TableCell>
                      <TableCell align="left">
                        {row.value}{' '}
                        {catDetails?.data?.find((x) => x.categoryId === row.categoryId)
                          ?.unitOfMeasure
                          ? catDetails?.data?.find((x) => x.categoryId === row.categoryId)
                              ?.unitOfMeasure
                          : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
          <CardActions className={classes.cardAction}>
            <Typography color="textSecondary">
              {' '}
              {formatter.format(new Date(details.timestamp as string))}
            </Typography>

            <Typography color="textSecondary">
              {(details!.location!.latitude as number).toFixed(4) +
                ' , ' +
                (details!.location!.longitude as number).toFixed(4)}
            </Typography>
          </CardActions>
        </Card>

        <Typography
          variant="body2"
          color="textSecondary"
          component="p"
          style={{ wordBreak: 'break-all' }}
        >
          {/* Latitude: {latitude.toFixed(4)}, Longitude: {longitude.toFixed(4)} */}
          {/* {details!.extensionData.map((elem) => {
            return elem.categoryId + ' '
          })} */}
        </Typography>
      </>
    )
  }
  return (
    <div>
      <CircularProgress />
    </div>
  )
}

const alertCard = (data, classes, t, formatter, latitude, longitude, alertInfo) => {
  const lowerBoundDate = formatter.format(new Date(alertInfo.startDate)) //FormatDate(alertInfo.startDate)
  const upperBoundDate = formatter.format(new Date(alertInfo.endDate)) //FormatDate(alertInfo.endDate)
  if (!data.isLoading) {
    return (
      <>
        <Card elevation={0}>
          <CardContent>
            <Typography
              variant="body2"
              component="h2"
              gutterBottom
              dangerouslySetInnerHTML={{ __html: alertInfo.details }}
            ></Typography>
            <div>
              <Typography color="textSecondary">
                {' '}
                {lowerBoundDate} - {upperBoundDate}
              </Typography>
            </div>
          </CardContent>
          <CardActions className={classes.cardAction}>
            <Typography color="textSecondary">
              {(latitude as number).toFixed(4) + ' , ' + (longitude as number).toFixed(4)}
            </Typography>
          </CardActions>
        </Card>
      </>
    )
  }
  return (
    <div>
      <CircularProgress />
    </div>
  )
}

function StationCard({ data, latitude, longitude }) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const [
    hasFire,
    hasAtLeastOneFireValidation,
    hasAllFireValidationsDiscarded,
    hasSmoke,
    hasAtLeastOneSmokeValidation,
    hasAllSmokeValidationsDiscarded
  ] = useMemo(() => {
    const allMeasurements = data?.sensors?.flatMap((sensor) => sensor.measurements) ?? []

    const [hasFire, hasAtLeastOneFireValidation, hasAllFireValidationsDiscarded] = getCameraState(
      'fire',
      allMeasurements
    )
    const [hasSmoke, hasAtLeastOneSmokeValidation, hasAllSmokeValidationsDiscarded] =
      getCameraState('smoke', allMeasurements)

    return [
      hasFire,
      hasAtLeastOneFireValidation,
      hasAllFireValidationsDiscarded,
      hasSmoke,
      hasAtLeastOneSmokeValidation,
      hasAllSmokeValidationsDiscarded
    ]
  }, [data])

  if (!data) {
    return (
      <Grid container style={{ height: 200 }} justifyContent="center" alignItems="center">
        <Grid item>
          <CircularProgress color="secondary" size={32} />
        </Grid>
      </Grid>
    )
  }

  const lastUpdate = getSensorsLastUpdate(data?.sensors ?? [])

  function handleShowDetails(event) {
    event.stopPropagation()

    dispatch(setSelectedCamera(data))
  }

  return (
    <>
      <Card elevation={0}>
        <CardContent>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="body2" component="span" gutterBottom style={{ marginRight: 5 }}>
                {data.name}
              </Typography>
              <Typography variant="caption" component="span" gutterBottom>
                ({(latitude as number).toFixed(4) + ' , ' + (longitude as number).toFixed(4)})
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" component="h2" gutterBottom>
                {data.sensors?.length ?? 0} {t('maps:orientations')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions className={ccmClasses.cardAction}>
          <Typography color="textSecondary" variant="caption">
            Last update: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'N/A'}
          </Typography>
        </CardActions>
        <CardActions className={ccmClasses.cardAction}>
          <div className={ccmClasses.chipContainer}>
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
                className={ccmClasses.chipStyle}
                label={t('maps:fire')}
              />
            )}
            {hasSmoke && (
              <Chip
                avatar={
                  hasAllSmokeValidationsDiscarded ? (
                    <DiscardedIcon type="smoke" avatar />
                  ) : hasAtLeastOneSmokeValidation ? (
                    <ValidatedIcon type="smoke" avatar />
                  ) : undefined
                }
                color="primary"
                size="small"
                style={{
                  backgroundColor: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.dark,
                  color: theme.palette.primary.dark
                }}
                className={ccmClasses.chipStyle}
                label={t('maps:smoke')}
              />
            )}
          </div>
          <Button variant="contained" color="primary" size="small" onClick={handleShowDetails}>
            {t('common:details')}
          </Button>
        </CardActions>
      </Card>
    </>
  )
}
/**
Different types of ["ReportRequest", "Communication", "Mission", "Report", "Person", "Alert"]
 */

export type EmergencyType =
  // | 'ReportRequest'
  | 'MapRequest'
  | 'Communication'
  | 'Mission'
  | 'Report'
  | 'Person'
  | 'SelectedPosition'
  | 'Alert'
  | 'Station'

type ColorMapType = {
  [k in EmergencyType]: string
}

export const EmergencyColorMap: ColorMapType = {
  // ReportRequest: green[800],
  Person: '#f9e900', //lightBlue[800],
  Report: '#ffd2cc', //brown[800],
  Mission: '#f797d2', //green[400],
  Station: '#4072f1',
  Alert: '#cc90e8', //'green[800]',
  Communication: '#83cfce', //blueGrey[800],
  MapRequest: '#f56c5c', //orange[800],
  SelectedPosition: yellow[800]
}

interface IEmergencyProps {
  id: string
  thumb: string
  image: string
  type: EmergencyType
  description: string
}

interface SimplePointLocation {
  longitude: number
  latitude: number
}

export type EmergencyProps = IEmergencyProps & { [k: string]: any }
export type EmergencyPropsWithLocation = EmergencyProps & SimplePointLocation

interface DotProps {
  type: EmergencyType
}

const Dot = styled.div<DotProps>`
  background-color: ${(props) => EmergencyColorMap[props.type]};
  width: 1em;
  height: 1em;
  display: inline-block;
  border: 1px solid ${(props) => props.theme.palette.text.primary};
  border-radius: 50%;
  box-sizing: border-box;
`

export function EmergencyHoverCardContent({
  creator,
  details,
  type,
  organizationName,
  mapRequestTypeFilter,
  status
}: EmergencyProps) {
  const classes = useStyles()
  const { t } = useTranslation(['maps', 'labels'])
  let detailComponent = <div />
  if (type === EntityType.ALERT)
    detailComponent = (
      <Typography
        variant="body2"
        component="h2"
        gutterBottom
        dangerouslySetInnerHTML={{ __html: details }}
      />
    )
  else if (type === EntityType.COMMUNICATION)
    detailComponent = (
      <Typography
        variant="body2"
        component="h2"
        gutterBottom
        dangerouslySetInnerHTML={{ __html: details }}
      />
    )
  else
    detailComponent = (
      <Typography variant="body2" component="h2" gutterBottom>
        {details}
      </Typography>
    )
  return (
    // <Card className={classes.root} variant="outlined">
    <CardContent>
      <div style={{ marginBottom: 10 }}>
        <Typography
          component={'span'}
          variant="caption"
          color="textSecondary"
          style={{ textTransform: 'uppercase' }}
        >
          {t('maps:category')}
        </Typography>
        <br />
        <Typography variant="h6" color="inherit" component={'span'}>
          {t('maps:legend_' + type.toLowerCase())} <Dot type={type} />
        </Typography>
      </div>

      {details !== 'null' && details ? (
        <div style={{ marginBottom: 10 }}>
          <Typography
            component={'span'}
            variant="caption"
            className={classes.pos}
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:description')}
          </Typography>
          <br />
          {detailComponent}
        </div>
      ) : null}
      {creator !== 'null' && creator ? (
        <div style={{ marginBottom: 10 }}>
          <Typography
            component={'span'}
            variant="caption"
            className={classes.pos}
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:author')}
          </Typography>
          <br />
          <Typography component={'span'} variant="body1">
            {creator}
          </Typography>
        </div>
      ) : null}
      {organizationName !== 'null' && organizationName ? (
        <div>
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:organization')}
          </Typography>
          <br />
          <Typography component={'span'} variant="body1">
            {organizationName}
          </Typography>
        </div>
      ) : null}
      {mapRequestTypeFilter && mapRequestTypeFilter !== 'null' ? (
        <div>
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('labels:type')}
          </Typography>
          <br />
          <Typography component={'span'} variant="body1">
            {t('labels:' + mapRequestTypeFilter.toLowerCase())}
          </Typography>
        </div>
      ) : undefined}
      {status && status !== 'null' ? (
        <div>
          <Typography
            component={'span'}
            variant="caption"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            {t('maps:status')}
          </Typography>
          <br />
          <Typography component={'span'} variant="body1">
            {t('labels:' + status.toLowerCase())}
          </Typography>
        </div>
      ) : undefined}
    </CardContent>
  )
}

export function EmergencyContent({
  description,
  thumb,
  image,
  type,
  latitude,
  longitude,
  creator,
  ...rest
}: EmergencyPropsWithLocation) {
  const classes = useStyles()
  const theme = useTheme()
  const { t } = useTranslation(['common', 'maps', 'labels'])
  const [repDetails, fetchRepDetails] = useReportById()
  const [catDetails, fetchCategoriesList] = useCategoriesList()
  const [commDetails, fetchCommDetails] = useCommById()
  const [missDetails, fetchMissDetails] = useMissionsById()
  const [alertDetails, b, c, fetchAlertDetails] = useAlertList()
  const [cameras, fetchCameras] = useCameraList()
  //OLD: must be sobstituted with useMapRequestList -> fetchMapRequestById
  const [mapReqDetails, fetchMapReqDetails] = useMapRequestById()
  const [openModal, setOpenModal] = useState(false)
  const [peopData, getPeopData, applyFilterByText] = usePeopleList()

  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  useEffect(() => {
    switch (type) {
      case 'Mission':
        fetchMissDetails(
          rest.id,
          (data) => {
            return data
          },
          {},
          (data) => {
            return data
          }
        )
        break
      case 'Communication':
        fetchCommDetails(
          rest.id,
          (data) => {
            return data
          },
          {},
          (data) => {
            return data
          }
        )
        break
      case 'Report':
        fetchRepDetails(
          rest.id,
          (data) => {
            return data
          },
          {},
          (data) => {
            return data
          }
        )
        fetchCategoriesList(
          (data) => {
            return data
          },
          {},
          (data) => {
            return data
          }
        )
        break
      case 'MapRequest':
        fetchMapReqDetails(
          rest.id,
          (data) => {
            return data
          },
          {},
          (data) => {
            return data
          }
        )
        break
      case 'Person':
        getPeopData(
          0,
          rest.id,
          undefined,
          (data) => {
            return data
          },
          {},
          (data) => {
            return data
          }
        )
        break
      case 'Alert':
        fetchAlertDetails(
          rest.id,
          (data) => {
            return data
          },
          {},
          (data) => {
            return data
          }
        )
        break
      case 'Station':
        fetchCameras()
        break
      default:
        break
    }
  }, [
    rest.id,
    fetchRepDetails,
    fetchCategoriesList,
    fetchCommDetails,
    fetchMissDetails,
    fetchMapReqDetails,
    fetchAlertDetails,
    type
  ])

  const dispatch = useDispatch()

  // useEffect(() => {
  //   console.log('REP DETAILS', repDetails)
  // }, [repDetails])
  useEffect(() => {
    if (!missDetails.isLoading) {
      rest.setPolyToMap({
        feature: missDetails.data.feature
      })
    }
  }, [missDetails])

  useEffect(() => {
    if (!peopData.isLoading) {
      let teamTemp = peopData.data.filter((e) => e.id === rest.id)
      if (!!teamTemp && teamTemp.length > 0)
        rest.setPersonTeam(peopData.data.filter((e) => e.id === rest.id)[0].teamName)
    }
  }, [peopData])

  useEffect(() => {
    if (!commDetails.isLoading) {
      rest.setPolyToMap({
        feature: commDetails.data.feature
      })
    }
  }, [commDetails])

  useEffect(() => {
    if (!mapReqDetails.isLoading) {
      rest.setPolyToMap({
        feature: mapReqDetails.data.feature
      })
    }
  }, [mapReqDetails])

  useEffect(() => {
    if (!alertDetails.isLoading) {
      rest.setPolyToMap({
        feature: alertDetails.selectedAlert.feature
      })
    }
  }, [alertDetails])

  let todisplay = <></>
  switch (type) {
    case 'Report': {
      todisplay = reportCard(
        repDetails,
        t,
        classes,
        catDetails,
        formatter,
        openModal,
        setOpenModal,
        theme
      )
      break
    }
    case 'Person': {
      todisplay = personCard(rest, classes, formatter, t, description, creator, latitude, longitude)
      break
    }
    case 'Communication': {
      // data, classes, t, formatter, latitude, longitude
      todisplay = commCard(commDetails, classes, t, formatter, latitude, longitude, rest)
      break
    }
    case 'Mission':
      todisplay = missCard(
        missDetails,
        classes,
        t,
        formatter,
        latitude,
        longitude,
        rest.setGoToCoord
      )
      break
    case 'MapRequest':
      console.debug('MAP REQUEST DETAILS', mapReqDetails)
      todisplay = mapRequestCard(
        mapReqDetails,
        classes,
        formatter,
        t,
        description,
        creator,
        latitude,
        longitude
      )
      break
    case 'Alert':
      todisplay = alertCard(alertDetails, classes, t, formatter, latitude, longitude, rest)
      break
    case 'Station':
      const camera = cameras.data?.find((e) => e.id === rest.details)
      todisplay = <StationCard data={camera} latitude={latitude} longitude={longitude} />
      break
    default: {
      todisplay = <div>Work in progress...</div>
      break
    }
  }

  return todisplay
}

export function EmergencyDrawerDetails(props) {
  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column' }}>
      {/* <ImageContainer imageUrl={item?.image || ''} imgWidth={240} imgHeight={240} /> */}
      {props.item && (
        <EmergencyContent
          {...props.item}
          latitude={props.latitude}
          longitude={props.longitude}
          setPolyToMap={props.setPolyToMap}
          setGoToCoord={props.setGoToCoord}
          setPersonTeam={props.setPersonTeam}
          teamName={props.teamName}
        />
      )}
    </div>
  )
}
