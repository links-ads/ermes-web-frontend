import React from 'react'
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
import { makeStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});



/**
Different types of ["ReportRequest", "Communication", "Mission", "Report", "Person"]
 */

export type EmergencyType =
  | 'ReportRequest'
  | 'Communication'
  | 'Mission'
  | 'Report'
  | 'Person'


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
  const classes = useStyles();
  return (
    // <Card className={classes.root} variant="outlined">
    <CardContent>
      <div style={{ marginBottom: 10 }}>
        <Typography component={'span'} variant="caption" color="textSecondary" style={{ textTransform: 'uppercase' }}>
          Categoria:
        </Typography>
        <br />
        <Typography variant="h6" color="inherit" component={'span'}>
          {type} <Dot type={type} />
        </Typography>
      </div>
      <div style={{ marginBottom: 10 }}>
        <Typography component={'span'} variant="caption" className={classes.pos} color="textSecondary" style={{ textTransform: 'uppercase' }}>
          Descrizione:
        </Typography>
        <br />
        <Typography component={'span'} variant="body1">
          {details}
        </Typography>
      </div>
      <div>
        <Typography component={'span'} variant="caption" className={classes.pos} color="textSecondary" style={{ textTransform: 'uppercase' }}>
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
  descrizione,
  thumb,
  image,
  type,
  latitude,
  longitude,
  creator,
  ...rest
}: EmergencyPropsWithLocation) {
  return (
    <>
      <Typography gutterBottom variant="h4" component="h2" style={{ wordBreak: 'break-all' }}>
      <Dot type={type} /> &nbsp; {type}
        
      </Typography>
      {/* <Typography
        variant="body2"
        color="textSecondary"
        component="p"
        style={{ wordBreak: 'break-all' }}
      > */}
      <TableContainer component={Paper} className="insideTable">
        <Table>
          <TableBody>
            {Object.entries(rest).map(([key, value]) => (
              <TableRow key={key} >
                <TableCell align="right" scope="row" width="30%" style={{ padding: 3, paddingRight: 8 }}>
                  <b>{key}</b>
                </TableCell>
                <TableCell align="left" style={{ padding: 3 }}>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* {Object.entries(rest).map(([key, value]) => (
          <span key={key}>
            <b>{key}</b>:&nbsp;<span>{value as string}</span>&nbsp; <br />
          </span>
        ))} */}
      {/* </Typography> */}
    </>
  )
}

export function EmergencyInfo(props: EmergencyPropsWithLocation) {
  const { /*  descrizione,  thumb,  */latitude, longitude } = props

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
      <Typography
        variant="body2"
        color="textSecondary"
        component="p"
        style={{ wordBreak: 'break-all', marginTop: 20 }}
      >
        Latitude: {latitude}, Longitude: {longitude}
      </Typography>
      {/* Improve styles and add links and controls */}
    </div>
  )
}
