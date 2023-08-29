import React from "react"
import { LayerSettingsState, LayerState } from "../../../../models/layers/LayerState"
import { Accordion, AccordionSummary, FormControl, FormGroup, Typography, makeStyles, useTheme } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import LayersAccordionDetails from "./layers-accordion-details.component"

const useStyles = makeStyles((theme) => ({
  accordionDetails: {
    display: 'block'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
}))

const LayersSubgroupAccordion: React.FC<{
  subGroupName: string
  layers: LayerState
  setLayerSelection: any
  updateLayerSelection: any
  map: any
  selectedLayers: LayerSettingsState[] | undefined
  checkboxDisabled: boolean
  toBeRemovedLayer: string
}> = (props) => {
  const theme = useTheme()
  const classes = useStyles()
  const { subGroupName, setLayerSelection, updateLayerSelection, layers, map, selectedLayers, checkboxDisabled, toBeRemovedLayer } = props
  const value = Object.keys(layers).forEach((layer) => {
    if (layers[layer].isChecked) return layers[layer].dataTypeId
    else return 0
  })
  return (
    <Accordion
      key={props.subGroupName}
      color="primary"
      style={{ backgroundColor: theme.palette.primary.dark, width: '100%' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id={subGroupName}>
        <Typography className={classes.heading}>{subGroupName}</Typography>
      </AccordionSummary>
      <FormControl>
        <FormGroup
          aria-labelledby="demo-checkbox-buttons-group-label"
          // name="radio-buttons-group"
          // value={value}
        >
          {Object.keys(props.layers).map((key, index) => (
            <LayersAccordionDetails
              key={props.subGroupName + key + index}
              layerSettings={props.layers[key]}
              setLayerSelection={setLayerSelection}
              updateLayerSelection={updateLayerSelection}
              map={map}
              selectedLayers={selectedLayers}
              checkboxDisabled={checkboxDisabled}
              toBeRemovedLayer={toBeRemovedLayer}
            />
          ))}
        </FormGroup>
      </FormControl>
    </Accordion>
  )
}

export default LayersSubgroupAccordion