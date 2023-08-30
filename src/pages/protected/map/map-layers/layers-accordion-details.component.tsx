import React, { useContext, useEffect } from "react"
import { LayerSettingsState } from "../../../../models/layers/LayerState"
import {
  AccordionDetails,
  FormControlLabel,
  makeStyles,
  Checkbox,
} from '@material-ui/core'
import { tileJSONIfy } from "../../../../utils/map.utils"
import { AppConfig, AppConfigContext } from "../../../../config"

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
  toBeRemovedLayer: string
}> = (props) => {
  const classes = useStyles()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const geoServerConfig = appConfig.geoServer
  const { updateLayerSelection, layerSettings, map, selectedLayers, checkboxDisabled, toBeRemovedLayer } = props
  
  const checkboxClickHandler = (event: any) => {
    updateLayerSelection(
      layerSettings.group,
      layerSettings.subGroup,
      layerSettings.dataTypeId,
      !layerSettings.isChecked
    )
  }

  useEffect(() => {
    if (toBeRemovedLayer !== '' && map.getLayer(toBeRemovedLayer)) {
      map.removeLayer(toBeRemovedLayer)
      map.removeSource(toBeRemovedLayer)
    }
  }, [toBeRemovedLayer])

  const paintMap = (map, selectedLayer) => {
    const layerName = selectedLayer.activeLayer
    if (layerName != '' && !map.getLayer(layerName)) {
      const source = tileJSONIfy(
        map,
        layerName,
        selectedLayer.availableTimestamps[selectedLayer.dateIndex],
        geoServerConfig,
        map.getBounds()
      )
      source['properties'] = {
        format: undefined,
        fromTime: undefined,
        toTime: undefined
      }
      map.addSource(layerName, source as mapboxgl.RasterSource)
      map.addLayer(
        {
          id: layerName,
          type: 'raster',
          source: layerName
        },
        'clusters'
      )
      map.setPaintProperty(selectedLayer.activeLayer, 'raster-opacity', selectedLayer.opacity / 100)
    }
  }

  useEffect(() => {
    if (selectedLayers && selectedLayers.length > 0) {
      for (let i; i < selectedLayers.length; i++) {
        paintMap(map, selectedLayers[i])
      }
    }
  }, [selectedLayers])
  
  const layerComponent = (
    <FormControlLabel
      control={<Checkbox onChange={checkboxClickHandler} checked={layerSettings.isChecked} disabled={checkboxDisabled && !layerSettings.isChecked} />}
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