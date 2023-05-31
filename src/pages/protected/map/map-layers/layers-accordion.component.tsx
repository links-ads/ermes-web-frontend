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
  setLayerSelection: any
  updateLayersSetting: any
  map: any
  selectedLayer: LayerSettingsState | undefined
}> = (props) => {
  const theme = useTheme()
  const classes = useStyles()
  const { groupName, updateLayersSetting, setLayerSelection, layerSubGroups, map, selectedLayer } =
    props
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
          setLayerSelection={setLayerSelection}
          updateLayersSetting={updateLayersSetting}
          map={map}
          selectedLayer={selectedLayer}
        />
      ))}
    </Accordion>
  )
}

export default LayersAccordion