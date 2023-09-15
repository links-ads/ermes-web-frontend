import React from 'react'
import Typography from '@material-ui/core/Typography'
import { ImageContainer } from '../common.components'
import styled from 'styled-components'
import green from '@material-ui/core/colors/green'
import brown from '@material-ui/core/colors/brown'
import grey from '@material-ui/core/colors/grey'
import lightBlue from '@material-ui/core/colors/lightBlue'
import blueGrey from '@material-ui/core/colors/blueGrey'
import pink from '@material-ui/core/colors/pink'
import purple from '@material-ui/core/colors/purple'
import orange from '@material-ui/core/colors/orange'
import { ItemWithLatLng } from '../map.context'

/**
 * Works with Open Data
 * from http://www.datiopen.it/it/opendata/Regione_Piemonte_Beni_culturali_ambientali_SITA_Beni_ambientali_architettonici?t=Mappa
 * Remastered
 */

export type BeniType =
  | 'nucleo_alpino'
  | 'villaggio_alpino'
  | 'nucleo_rurale'
  | 'ritrovamento_isolato'
  | 'centro_storico_di_tipo_f4'
  | 'area_di_ritrovamento_di_tipo_diverso'
  | 'centro_storico_di_tipo_f3'
  | 'via_eo_piazza_porticata'
  | 'resti_di_strutture'
  | 'belvedere'
  | 'strade_eo_piazza_di_valore_ambientale'
  | 'centro_storico_di_tipo_f2'
  | 'centro_storico_di_tipo_f1'
  | 'sistema_di_vie_porticate'
  | 'recetto'
  | 'citta_romana_con_resti_consistenti'
  | 'citta_romana_con_presenza_segnalata'
  | 'ghetto_ebraico'
  | 'opera_di_ingegneria'

type ColorMapType = {
  [k in BeniType]: string
}

export const CulturalColorMap: ColorMapType = {
  nucleo_alpino: green[900],
  villaggio_alpino: green[600],
  nucleo_rurale: green[400],
  ritrovamento_isolato: brown[900],
  centro_storico_di_tipo_f4: brown[400],
  area_di_ritrovamento_di_tipo_diverso: grey[500],
  centro_storico_di_tipo_f3: brown[300],
  via_eo_piazza_porticata: grey[800],
  resti_di_strutture: grey[600],
  belvedere: lightBlue[900],
  strade_eo_piazza_di_valore_ambientale: green[200],
  centro_storico_di_tipo_f2: brown[200],
  centro_storico_di_tipo_f1: brown[100],
  sistema_di_vie_porticate: blueGrey[600],
  recetto: blueGrey[800],
  citta_romana_con_resti_consistenti: pink[600],
  citta_romana_con_presenza_segnalata: pink[900],
  ghetto_ebraico: purple[900],
  opera_di_ingegneria: orange[900]
}

interface ICulturalProps {
  id: string
  thumb: string
  image: string
  type: BeniType
  description: string
}

interface SimplePointLocation {
  longitude: number
  latitude: number
}

export type CulturalProps = ICulturalProps & { [k: string]: any }
export type CulturalPropsWithLocation = CulturalProps & SimplePointLocation

interface DotProps {
  type: BeniType
}

const Dot = styled.div<DotProps>`
  background-color: ${(props) => CulturalColorMap[props.type]};
  width: 1em;
  height: 1em;
  display: inline-block;
  border: 1px solid ${(props) => props.theme.palette.text.primary};
  border-radius: 50%;
  box-sizing: border-box;
`

export function CulturalHoverCardContent({ cat, type }: CulturalProps) {
  return (
    <Typography gutterBottom variant="caption" style={{ wordBreak: 'break-all' }}>
      Categoria: {cat}&nbsp; <Dot type={type} />
    </Typography>
  )
}

export function CulturalContent({
  description,
  thumb,
  image,
  type,
  latitude,
  longitude,
  ...rest
}: CulturalPropsWithLocation) {
  return (
    <>
      <Typography gutterBottom variant="h5" component="h2" style={{ wordBreak: 'break-all' }}>
        Descrizione: {description}&nbsp;
        <Dot type={type} />
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
        component="p"
        style={{ wordBreak: 'break-all' }}
      >
        {Object.entries(rest).map(([key, value]) => (
          <span key={key}>
            <b>{key}</b>:&nbsp;<span>{value as string}</span>&nbsp;
          </span>
        ))}
      </Typography>
    </>
  )
}

export function CulturalInfo(props: CulturalPropsWithLocation) {
  const { thumb, latitude, longitude } = props

  return (
    <>
      <ImageContainer imageUrl={thumb} imgWidth={200} imgHeight={200} />
      <CulturalContent {...props} />
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

export function CulturalDrawerDetails({
  item,
  latitude,
  longitude
}: ItemWithLatLng<CulturalProps>) {
  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column' }}>
      <ImageContainer imageUrl={item?.image || ''} imgWidth={240} imgHeight={240} />
      {item && <CulturalContent {...item} latitude={latitude} longitude={longitude} />}
      <Typography
        variant="body2"
        color="textSecondary"
        component="p"
        style={{ wordBreak: 'break-all' }}
      >
        Latitude: {latitude}, Longitude: {longitude}
      </Typography>
      {/* Improve styles and add links and controls */}
    </div>
  )
}
