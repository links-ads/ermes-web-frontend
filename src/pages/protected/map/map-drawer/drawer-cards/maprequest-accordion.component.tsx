import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  FormGroup,
  Typography,
  makeStyles
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MapRequestAccordionItem from './maprequest-accordion-item.component'
import { MapRequestLayerState } from '../../../../../models/mapRequest/MapRequestState'

const useStyles = makeStyles((theme) => ({
  highlightBorder: {
    borderColor: theme.palette.secondary.main,
    borderStyle: 'solid'
  }
}))

const MapRequestAccordion: React.FC<{
  getMeta
  getLegend
  map
  mapRequestSettings: MapRequestLayerState
  updateMapRequestsSettings
}> = (props) => {
  const { getMeta, getLegend, map, mapRequestSettings, updateMapRequestsSettings } = props
  const classes = useStyles()
  if (!mapRequestSettings) return <div />
  const atLeastOneLayerChecked =
    Object.keys(mapRequestSettings)
      .map((key) => mapRequestSettings[key].isChecked)
      .filter((e) => e).length > 0
  return (
    <Accordion className={atLeastOneLayerChecked ? classes.highlightBorder : undefined}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>Layers</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControl component="fieldset" fullWidth={true}>
          <FormGroup aria-label="gender">
            {Object.keys(mapRequestSettings).map((key) => (
              <MapRequestAccordionItem
                key={'layers_' + key}
                getMeta={getMeta}
                getLegend={getLegend}
                map={map}
                currentLayer={mapRequestSettings[key]}
                updateMapRequestsSettings={updateMapRequestsSettings}
              />
            ))}
          </FormGroup>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  )
}

export default MapRequestAccordion
