import React, { useEffect } from 'react'
import Typography from '@material-ui/core/Typography'
// import { ImageContainer } from '../common.components'
import styled from 'styled-components'
import green from '@material-ui/core/colors/green'
import brown from '@material-ui/core/colors/brown'
// import grey from '@material-ui/core/colors/grey'
import lightBlue from '@material-ui/core/colors/lightBlue'
import blueGrey from '@material-ui/core/colors/blueGrey'
// import pink from '@material-ui/core/colors/pink'
// import purple from '@material-ui/core/colors/purple'
// import orange from '@material-ui/core/colors/orange'
import { ItemWithLatLng } from '../map.contest'
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
import CardActionArea from '@material-ui/core/CardActionArea'
import CardMedia from '@material-ui/core/CardMedia'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import useReportById from '../../../../hooks/use-report-by-id.hook'
import Carousel from 'react-material-ui-carousel'
import CircularProgress from '@material-ui/core/CircularProgress'
import Chip from '@material-ui/core/Chip'
import { HAZARD_SOCIAL_ICONS } from '../../common/utils/utils.common'
import { useTranslation } from 'react-i18next'
import { Avatar } from '@material-ui/core'
import useCategoriesList from '../../../../hooks/use-categories-list.hook'
import Box from '@material-ui/core/Box'

const useStyles = makeStyles({
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
  }
})
const personCard = (details, classes, formatter, t, description, creator, latitude, longitude) => {
  console.log(details)

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
          {['status', 'activityName', 'organizationName', 'extensionData'].map((type) => {
            if (details[type]) {
              return (
                <>
                  <Typography
                    component={'span'}
                    variant="caption"
                    color="textSecondary"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('maps:' + type)}:&nbsp;
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

const reportCard = (data, t, classes, catDetails, formatter) => {
  const details = data?.data?.feature?.properties

  if (!data.isLoading) {
    return (
      <>
        <Card elevation={0}>
          {/* <CardMedia
                        className={classes.media}
                        image={'https://via.placeholder.com/400x200.png?text=' + t('common:image_not_available')}
                        // image="https://via.placeholder.com/150C/O"
                        title="Contemplative Reptile"
                      /> */}
          <Carousel
            animation="slide"
            autoPlay={false}
            // timeout={800}
            fullHeightHover={false}
          >
            {details.mediaURIs.map((media, idx) => {
              return (
                <CardMedia
                  key={idx}
                  className={classes.media}
                  image={media.mediaURI}
                  style={{ borderRadius: 6 }}
                />
              )
            })}
          </Carousel>
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
          </CardContent>
          {details?.extensionData.length > 0 ? (
            <TableContainer component={Paper}>
              <Table className={classes.table} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">
                      <b>{t('maps:name')}</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>{t('maps:group')}</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>{t('maps:status')}</b>
                    </TableCell>
                    <TableCell align="left">
                      <b>{t('maps:value')}</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details!.extensionData.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell component="th" align="left" scope="row">
                        {catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.name}
                      </TableCell>
                      <TableCell align="center">
                        {catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.groupIcon}
                      </TableCell>
                      <TableCell align="left">{t('maps:' + row.status.toLowerCase())}</TableCell>
                      <TableCell align="left">
                        {row.value}
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
/**
Different types of ["ReportRequest", "Communication", "Mission", "Report", "Person"]
 */

export type EmergencyType = 'ReportRequest' | 'Communication' | 'Mission' | 'Report' | 'Person'

type ColorMapType = {
  [k in EmergencyType]: string
}

export const EmergencyColorMap: ColorMapType = {
  ReportRequest: green[800],
  Communication: blueGrey[800],
  Mission: green[400],
  Report: brown[800],
  Person: lightBlue[800]
}

interface IEmergencyProps {
  id: string
  thumb: string
  image: string
  type: EmergencyType
  descrizione: string
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

export function EmergencyHoverCardContent({ creator, details, type }: EmergencyProps) {
  const classes = useStyles()
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
          Categoria:
        </Typography>
        <br />
        <Typography variant="h6" color="inherit" component={'span'}>
          {type} <Dot type={type} />
        </Typography>
      </div>
      <div style={{ marginBottom: 10 }}>
        <Typography
          component={'span'}
          variant="caption"
          className={classes.pos}
          color="textSecondary"
          style={{ textTransform: 'uppercase' }}
        >
          Descrizione:
        </Typography>
        <br />
        <Typography component={'span'} variant="body1">
          {details}
        </Typography>
      </div>
      <div>
        <Typography
          component={'span'}
          variant="caption"
          className={classes.pos}
          color="textSecondary"
          style={{ textTransform: 'uppercase' }}
        >
          Autore:
        </Typography>
        <br />
        <Typography component={'span'} variant="body1">
          {creator}
        </Typography>
      </div>
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
  const { t } = useTranslation(['common', 'maps'])
  const [repDetails, fetchRepDetails] = useReportById()
  const [catDetails, fetchCategoriesList] = useCategoriesList()
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)
  useEffect(() => {
    switch (type) {
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
      default:
        break
    }
  }, [rest.id, fetchRepDetails])

  // useEffect(() => {
  //   console.log('REP DETAILS', repDetails)
  // }, [repDetails])

  // useEffect(() => {
  //   console.log('CAT DETAILS', catDetails)
  // }, [catDetails])

  let todisplay = <></>
  switch (type) {
    // Report request
    case 'Report': {
      todisplay = reportCard(repDetails, t, classes, catDetails, formatter)
      break
    }
    case 'Person': {
      todisplay = personCard(rest, classes, formatter, t, description, creator, latitude, longitude)
      break
    }
    default: {
      todisplay = <div>Work in progress...</div>
      break
    }
  }

  return todisplay
}

export function EmergencyInfo(props: EmergencyPropsWithLocation) {
  const { /*  descrizione,  thumb,  */ latitude, longitude } = props

  return (
    <>
      {/* <ImageContainer imageUrl={thumb} imgWidth={200}  /> */}
      <EmergencyContent {...props} />
      <Typography
        variant="body2"
        color="textSecondary"
        component="p"
        style={{ wordBreak: 'break-all' }}
      >
        Latitude: {latitude}, Longitude: {longitude}
      </Typography>
    </>
  )
}

export function EmergencyDrawerDetails({
  item,
  latitude,
  longitude
}: ItemWithLatLng<EmergencyProps>) {
  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column' }}>
      {/* <ImageContainer imageUrl={item?.image || ''} imgWidth={240} imgHeight={240} /> */}
      {item && <EmergencyContent {...item} latitude={latitude} longitude={longitude} />}
      {/* <Typography
        variant="body2"
        color="textSecondary"
        component="p"
        style={{ wordBreak: 'break-all', marginTop: 20 }}
      >
        Latitude: {latitude}, Longitude: {longitude}
      </Typography> */}
      {/* Improve styles and add links and controls */}
    </div>
  )
}
