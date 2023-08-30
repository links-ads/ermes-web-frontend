import React from "react"
import { LayerSettingsState, SubGroupLayerState } from "../../../../models/layers/LayerState"
import { Accordion, AccordionSummary, Typography, makeStyles, useTheme } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import LayersSubgroupAccordion from "./layers-subgroup-accordion.component"

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
}))

const LayersAccordion: React.FC<{
  groupName: string
  layerSubGroups: SubGroupLayerState
  updateLayerSelection: any
  map: any
  selectedLayers: LayerSettingsState[] | undefined
  toBeRemovedLayer: string
}> = (props) => {
  const theme = useTheme()
  const classes = useStyles()
  const { groupName, updateLayerSelection, layerSubGroups, map, selectedLayers, toBeRemovedLayer } =
    props
  const checkboxDisabled = Object.values(layerSubGroups).map(e => Object.values(e).map(d => d.isChecked)).flat().filter((v) => v).length > 3;
  // console.log('Layers checked: ' + Object.values(layerSubGroups).map(e => Object.values(e).map(d => d.isChecked)).flat().filter((v) => v).length)
  return (
    <Accordion
      key={props.groupName}
      color="primary"
      style={{ backgroundColor: theme.palette.primary.dark, width: '100%' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id={groupName}>
        <Typography className={classes.heading}>{groupName}</Typography>
      </AccordionSummary>

      {Object.keys(props.layerSubGroups).map((key, index) => (
        <LayersSubgroupAccordion
          key={props.groupName + key + index}
          subGroupName={key}
          layers={layerSubGroups[key]}
          updateLayerSelection={updateLayerSelection}
          map={map}
          selectedLayers={selectedLayers}
          checkboxDisabled={checkboxDisabled}
          toBeRemovedLayer={toBeRemovedLayer}
        />
      ))}
    </Accordion>
  )
}

export default LayersAccordion