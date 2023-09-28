import React, { useContext, useEffect } from 'react'
import { LayerSettingsState } from '../../../../models/layers/LayerState'
import { AccordionDetails, FormControlLabel, makeStyles, Checkbox } from '@material-ui/core'
import { AppConfig, AppConfigContext } from '../../../../config'
import { removeLayerFromMap, paintMapWithLayer } from '../../../../common/map/map-common'

const useStyles = makeStyles((theme) => ({
  accordionDetails: {
    display: 'block',
    padding: '0px 16px'
  }
}))

const LayersAccordionDetails: React.FC<{
  layerSettings: LayerSettingsState
  selectedLayers: LayerSettingsState[] | undefined
  updateLayerSelection: any
  map: any
  checkboxDisabled: boolean
  toBeRemovedLayers: string[]
}> = (props) => {
  const classes = useStyles()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const geoServerConfig = appConfig.geoServer
  const {
    updateLayerSelection,
    layerSettings,
    map,
    selectedLayers,
    checkboxDisabled,
    toBeRemovedLayers
  } = props

  const checkboxClickHandler = (event: any) => {
    updateLayerSelection(
      layerSettings.group,
      layerSettings.subGroup,
      layerSettings.dataTypeId,
      !layerSettings.isChecked
    )
  }

  useEffect(() => {
    if (toBeRemovedLayers && toBeRemovedLayers.length > 0) {
      for (let i = 0; i < toBeRemovedLayers.length; i++) {
        removeLayerFromMap(map, toBeRemovedLayers[i])
      }
    }
    if (selectedLayers && selectedLayers.length > 0) {
      for (let i = 0; i < selectedLayers.length; i++) {
        paintMapWithLayer(map, selectedLayers[i], geoServerConfig)
      }
    }
  }, [selectedLayers, toBeRemovedLayers])

  const layerComponent = (
    <FormControlLabel
      control={
        <Checkbox
          onChange={checkboxClickHandler}
          checked={layerSettings.isChecked}
          disabled={checkboxDisabled && !layerSettings.isChecked}
        />
      }
      label={layerSettings.name}
    />
  )
  return (
    <AccordionDetails
      key={layerSettings.dataTypeId + layerSettings.name}
      className={classes.accordionDetails}
    >
      {layerComponent}
    </AccordionDetails>
  )
}

export default LayersAccordionDetails