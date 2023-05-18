import {
  Checkbox,
  FormControlLabel,
  IconButton,
  makeStyles,
  Slider,
  Typography
} from '@mui/material'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import LegendIcon from '@mui/icons-material/FilterNone'
import MetaIcon from '@mui/icons-material/InfoOutlined'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import GetAppIcon from '@mui/icons-material/GetApp'
import PauseIcon from '@mui/icons-material/Pause'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { useTranslation } from 'react-i18next'
import classes from './maprequest-card.module.scss'
import { FormatDate } from '../../../../../utils/date.utils'
import { LayerSettingsState } from '../../../../../models/mapRequest/MapRequestState'
import { tileJSONIfy } from '../../../../../utils/map.utils'
import { AppConfigContext, AppConfig } from '../../../../../config'
import ErrorMessagesTooltip from '../../../../../common/tooltips/error-messages-tooltip.component'
import { useAPIConfiguration } from '../../../../../hooks/api-hooks'
import { useSnackbars } from '../../../../../hooks/use-snackbars.hook'

const useStyles = makeStyles((theme) => ({
  buttonsContainer: {
    width: '25%',

    alignItems: 'center',
    textAlign: 'end',
    display: 'flex',
    '& .MuiButtonBase-root': {
      display: 'inline-block',
      padding: 0,
      marginTop: '12px'
    }
  },
  slider: {
    width: '100%',
    display: 'inline-block',
    '& .MuiSlider-thumb': {
      backgroundColor: '#fff',
      width: '16px',
      height: '16px'
    },
    '& .MuiSlider-track': {
      border: 'none',
      height: '6px',
      borderRadius: '3px'
    },
    '& .MuiSlider-rail': {
      opacity: 0.5,
      backgroundColor: '#fff',
      height: '6px',
      borderRadius: '3px'
    },
    '& .MuiSlider-mark ': {
      color: '#fff',
      display: 'none'
    }
  },
  separator: {
    backgroundColor: theme.palette.primary.contrastText,
    height: '1px'
  }
}))

const MapRequestAccordionItem: React.FC<{
  getMeta: any
  getLegend: any
  map: any
  currentLayer: LayerSettingsState
  updateMapRequestsSettings: any
}> = (props) => {
  const { getMeta, getLegend, currentLayer, map, updateMapRequestsSettings } = props
  const { t } = useTranslation(['common', 'maps', 'labels'])
  const style = useStyles()
  const [playing, setPlaying] = useState(false)
  const { displayErrorSnackbar } = useSnackbars()
  const { opacity, dateIndex, isChecked, mapRequestCode, dataTypeId, status } = currentLayer
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const geoServerConfig = appConfig.geoServer

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])
  const importerBaseUrl = appConfig.importerBaseUrl

  const isCheckedHandler = (event: any) => {
    if (!event.target.checked) setPlaying(false)
    updateMapRequestsSettings(mapRequestCode, dataTypeId, !isChecked, 'ISCHECKED')
  }

  const changeDateHandler = (event, value) => {
    event.stopPropagation()
    skipNext(value)
  }

  const onClickDateHandler = (event) => {
    event.stopPropagation()
    skipNext(dateIndex + 1)
  }

  const onDownloadHandler = async (event) => {
    event.stopPropagation()
    if (currentLayer.activeLayer && currentLayer.activeLayer.length > 0){
        const layerName = currentLayer.activeLayer.split(':')[1]
      const response = await layersApiFactory.layersGetFilename(layerName)
      if(response.status === 200){
        const { filename } = response.data;
        if (filename && filename.length > 0)
          window.location.href = importerBaseUrl + '/download?filename=' + filename
      }
    }
    else
      displayErrorSnackbar(t('contentnotavailable'))
  }

  const skipNext = (newValue) => {
    const timestampsLength = currentLayer.availableTimestamps.length
    updateMapRequestsSettings(
      mapRequestCode,
      dataTypeId,
      newValue <= timestampsLength - 1 ? newValue : 0,
      'TIMESTAMP'
    )
  }

  const onButtonPlayerHandler = (event) => {
    setPlaying(!playing)
  }

  const changeOpacityHandler = (event, value) => {
    event.stopPropagation()
    updateMapRequestsSettings(mapRequestCode, dataTypeId, value, 'OPACITY')

    map.setPaintProperty(currentLayer.activeLayer, 'raster-opacity', value / 100)
  }

  useEffect(() => {
    if (!currentLayer) return
    if (currentLayer.toBeRemovedLayer !== '' && map.getLayer(currentLayer.toBeRemovedLayer)) {
      map.removeLayer(currentLayer.toBeRemovedLayer)
      map.removeSource(currentLayer.toBeRemovedLayer)
    }

    const layerName = currentLayer.activeLayer
    if (layerName != '' && !map.getLayer(layerName)) {
      const source = tileJSONIfy(
        map,
        layerName,
        currentLayer.availableTimestamps[currentLayer.dateIndex],
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
      map.setPaintProperty(currentLayer.activeLayer, 'raster-opacity', currentLayer.opacity / 100)
    }
  }, [currentLayer.isChecked, currentLayer.dateIndex])

  useEffect(() => {
    if (playing) {
      const timer = setTimeout(() => skipNext(dateIndex + 1), 3000)
      return () => clearTimeout(timer)
    }
  }, [playing, changeDateHandler])

  if (!currentLayer || currentLayer.mapRequestCode === '') return <div></div>

  const errorTooltip = <ErrorMessagesTooltip errors={currentLayer.errorMessages} />

  const valueLabelFormat = (dateIndex: number) => {
    return FormatDate(currentLayer.availableTimestamps[dateIndex])
  }

  return (
    <div style={{ marginTop: '5px', marginBottom: '5px' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <FormControlLabel
          style={{ flex: 2 }}
          key={dataTypeId}
          value={mapRequestCode + '_' + dataTypeId}
          control={
            <Checkbox
              onClick={isCheckedHandler}
              checked={isChecked}
              disabled={currentLayer.availableTimestamps.length === 0}
            />
          }
          label={currentLayer.name}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
          {errorTooltip}
          <IconButton
            disabled={!currentLayer.isChecked}
            onClick={() => {
              if (typeof currentLayer.metadataId == 'object') console.log('TODOOOOOOOOOOOOOOO')
              //getMeta(layerDetails.metadataId[currentLayer.layerSettings.dateIndex])
              else if (typeof currentLayer.metadataId == 'string') getMeta(currentLayer.metadataId)
              else
                console.log(
                  'no metadata procedure implemented for type',
                  typeof currentLayer.metadataId
                )
            }}
          >
            <MetaIcon />
          </IconButton>
          <IconButton
            disabled={!currentLayer.isChecked}
            onClick={() => {
              getLegend(currentLayer.activeLayer)
            }}
          >
            <LegendIcon />
          </IconButton>
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Typography>{t('labels:status')}:&nbsp;</Typography>
          <Typography>{t('labels:' + status.toLowerCase())}</Typography>
        </div>
        <div>
          {currentLayer.availableTimestamps.length >= 1 ? (
            <div>
              {currentLayer.availableTimestamps.length > 1 ? (
                <div className={classes.playerContainer}>
                  <span className={classes.spanContainer}>
                    <div
                      className={classes.sliderContainer}
                      style={{ marginTop: '10px', marginLeft: '5px' }}
                    >
                      <Slider
                        aria-label="Temperature"
                        defaultValue={0}
                        //getAriaValueText={valuetext}
                        valueLabelDisplay="auto"
                        valueLabelFormat={valueLabelFormat}
                        step={1}
                        value={dateIndex}
                        disabled={!isChecked}
                        min={0}
                        max={currentLayer.availableTimestamps.length - 1}
                        color="secondary"
                        onChange={(event, value) => {
                          changeDateHandler(event, value)
                        }}
                      />
                    </div>
                    <div className={style.buttonsContainer} style={{ paddingTop: '10px' }}>
                      <IconButton
                        aria-label="play/pause"
                        onClick={onButtonPlayerHandler}
                        disabled={!isChecked}
                      >
                        {playing ? (
                          <PauseIcon style={{ height: 45, width: 45 }} />
                        ) : (
                          <PlayArrowIcon style={{ height: 45, width: 45 }} />
                        )}
                      </IconButton>
                      <IconButton
                        aria-label="next"
                        onClick={onClickDateHandler}
                        disabled={!isChecked}
                      >
                        <SkipNextIcon />
                      </IconButton>
                      <IconButton
                        aria-label="download"
                        onClick={onDownloadHandler}
                        disabled={!isChecked}
                        style={{ marginLeft: 10 }}
                      >
                        <GetAppIcon />
                      </IconButton>
                    </div>
                  </span>
                </div>
              ) : (
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Typography>
                    {'Timestamp: ' + FormatDate(currentLayer.availableTimestamps[0])}
                  </Typography>
                  <IconButton
                    aria-label="download"
                    onClick={onDownloadHandler}
                    disabled={!isChecked}
                    style={{ marginLeft: 10 }}
                  >
                    <GetAppIcon />
                  </IconButton>
                </div>
              )}
              <div
                className={classes.sliderContainer}
                style={{ paddingTop: '5px', alignItems: 'flex-start' }}
              >
                <label htmlFor="opacity-slider" style={{ marginRight: '10px' }}>
                  <Typography>{t('maps:opacity')}:&nbsp;</Typography>
                </label>
                <Slider
                  id={currentLayer.name}
                  defaultValue={100}
                  //valueLabelDisplay="on"
                  step={1}
                  value={opacity}
                  min={0}
                  max={100}
                  aria-label={currentLayer.name}
                  color="secondary"
                  disabled={!isChecked}
                  onChange={(event, value) => {
                    changeOpacityHandler(event, value)
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        <div className={style.separator} />
      </div>
    </div>
  )
}

export default MapRequestAccordionItem
