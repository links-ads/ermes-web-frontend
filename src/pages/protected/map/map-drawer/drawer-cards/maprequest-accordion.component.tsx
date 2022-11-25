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
  getMeta
  getLegend
  map
  mapRequestSettings
  updateMapRequestsSettings
}> = (props) => {
  const { getMeta, getLegend, map, mapRequestSettings, updateMapRequestsSettings } = props

  if (!mapRequestSettings) return <div />
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