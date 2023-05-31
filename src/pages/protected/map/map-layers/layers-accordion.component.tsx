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
  selectedLayer: LayerSettingsState | undefined
  setSelectedLayer: any
  setLayerSelection: any
}> = (props) => {
  const theme = useTheme()
  const classes = useStyles()
  return (
    <Accordion
      key={props.groupName}
      color="primary"
      style={{ backgroundColor: theme.palette.primary.dark, width: '100%' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} id={props.groupName}>
        <Typography className={classes.heading}>{props.groupName}</Typography>
      </AccordionSummary>

      {Object.keys(props.layerSubGroups).map((key, index) => (
        <LayersSubgroupAccordion
          key={props.groupName + key + index}
          subGroupName={key}
          layers={props.layerSubGroups[key]}
          setSelectedLayer={props.setSelectedLayer}
          selectedLayer={props.selectedLayer}
          setLayerSelection={props.setLayerSelection}
        />
      ))}
    </Accordion>
  )
}

export default LayersAccordion