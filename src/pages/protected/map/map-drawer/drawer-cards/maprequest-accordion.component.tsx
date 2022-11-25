import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  FormGroup,
  Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MapRequestAccordionItem from './maprequest-accordion-item.component'

const MapRequestAccordion: React.FC<{
  layers
  getMeta
  getLegend
  map
  mapRequestSettings
  updateMapRequestsSettings
}> = (props) => {
  const {
    layers,
    getMeta,
    getLegend,
    map,
    mapRequestSettings,
    updateMapRequestsSettings,
  } = props

  return (
    <Accordion>
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
            {
              Object.keys(mapRequestSettings).map(key => (
              //layers.map((item, index) => (
                <MapRequestAccordionItem
                  key={'layers_' + key}
                  getMeta={getMeta}
                  getLegend={getLegend}
                  map={map}
                  currentLayer={mapRequestSettings[key]}
                  updateMapRequestsSettings={updateMapRequestsSettings}
                />
              ))
            }
          </FormGroup>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  )
}

export default MapRequestAccordion
