import React from "react"
import { LayerSettingsState } from "../../../../models/layers/LayerState"
import {
  Radio,
  AccordionDetails,
  FormControlLabel,
  makeStyles,
} from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  accordionDetails: {
    display: 'block',
    padding: '0px 16px'
  }
}))

const LayersAccordionDetails: React.FC<{
  dataTypeId: string
  layer: LayerSettingsState
  selectedLayer: LayerSettingsState | undefined
  setSelectedLayer: any
  setLayerSelection: any
}> = (props) => {
  const classes = useStyles()
  const radioClickHandler = (event: any) => {
    if (props.selectedLayer && props.layer.dataTypeId === props.selectedLayer.dataTypeId) {
      props.setSelectedLayer(undefined)
      //TODO: to be removed after optimization
      props.setLayerSelection({
        isMapRequest: '-1',
        mapRequestCode: '-1',
        dataTypeId: '-1',
        multipleLayersAllowed: false
      })
    } else {
      props.setSelectedLayer(props.layer)
      props.setLayerSelection({
        isMapRequest: 0,
        mapRequestCode: -1,
        dataTypeId: props.layer.dataTypeId + '',
        multipleLayersAllowed: false
      })
    }
  }
  const { selectedLayer, dataTypeId, layer } = props
  const isChecked = selectedLayer && selectedLayer.dataTypeId.toString() === dataTypeId

  const layerComponent = (
    <FormControlLabel
      control={<Radio onClick={radioClickHandler} checked={isChecked} />}
      label={layer.name}
    />
  )
  return (
    <AccordionDetails
      key={dataTypeId + layer.name}
      className={classes.accordionDetails}
    >
      {layerComponent}
    </AccordionDetails>
  )
}

export default LayersAccordionDetails