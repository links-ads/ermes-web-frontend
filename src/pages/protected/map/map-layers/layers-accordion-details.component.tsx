import React, { useContext, useEffect } from "react"
import { LayerSettingsState } from "../../../../models/layers/LayerState"
import {
  Radio,
  AccordionDetails,
  FormControlLabel,
  makeStyles,
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
  selectedLayer: LayerSettingsState | undefined
  setLayerSelection: any
  updateLayersSetting: any
  map: any
}> = (props) => {
  const classes = useStyles()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const geoServerConfig = appConfig.geoServer
  const { updateLayersSetting, layerSettings, map, selectedLayer } = props
  
  const radioClickHandler = (event: any) => {
    //TODO: to be removed after optimization
    if (layerSettings && layerSettings.isChecked) {
      props.setLayerSelection({
        isMapRequest: '-1',
        mapRequestCode: '-1',
        dataTypeId: '-1',
        multipleLayersAllowed: false
      })
    } else {
      props.setLayerSelection({
        isMapRequest: 0,
        mapRequestCode: -1,
        dataTypeId: layerSettings.dataTypeId + '',
        multipleLayersAllowed: false
      })
    }
    //////////////////////////////////////////
    updateLayersSetting(
      layerSettings.group,
      layerSettings.subGroup,
      layerSettings.dataTypeId,
      !layerSettings.isChecked,
      'ISCHECKED'
    )
  }

  useEffect(() => {
    if (!selectedLayer) return
    if (selectedLayer?.toBeRemovedLayer !== '' && map.getLayer(selectedLayer?.toBeRemovedLayer)) {
      map.removeLayer(selectedLayer?.toBeRemovedLayer)
      map.removeSource(selectedLayer?.toBeRemovedLayer)
    }
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
  }, [selectedLayer?.activeLayer])

  const layerComponent = (
    <FormControlLabel
      control={<Radio onClick={radioClickHandler} checked={layerSettings.isChecked} />}
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