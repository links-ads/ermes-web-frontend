import React, { ChangeEvent, useContext, useEffect, useMemo, useState } from 'react'
import {
  makeStyles,
  AppBar,
  useTheme,
  Typography,
  IconButton,
  CardContent,
  Slider,
  CircularProgress,
  Grid
} from '@material-ui/core'
import FloatingCardContainer from '../../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import LegendIcon from '@material-ui/icons/FilterNone'
import MetaIcon from '@material-ui/icons/InfoOutlined'
import { useTranslation } from 'react-i18next'
import { useAPIConfiguration } from '../../../../hooks/api-hooks'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { AppConfig, AppConfigContext } from '../../../../config'
import { useSnackbars } from '../../../../hooks/use-snackbars.hook'
import GetAppIcon from '@material-ui/icons/GetApp'
import { tileJSONIfy } from '../../../../utils/map.utils'
import { LayerSettingsState } from '../../../../models/layers/LayerState'
import { PixelPostion } from '../../../../models/common/PixelPosition'
import { PauseCircleFilled, PlayCircleFilled, SkipNextOutlined } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
  slider: {
    width: '100%',
    display: 'inline-block',
    '& .MuiSlider-thumb': {
      backgroundColor: '#fff',
      width: '8px',
      height: '8px',
      marginTop: 0,
      marginLeft: 0
    },
    '& .MuiSlider-track': {
      height: '8px',
      borderRadius: '4px'
    },
    '& .MuiSlider-rail': {
      opacity: 0.5,
      backgroundColor: '#fff',
      height: '8px',
      borderRadius: '4px'
    },
    '& .MuiSlider-mark': {
      color: '#fff',
      height: 8,
      width: 1,
    }
  },
  oneDatapoint: {
    width: '100%',
    textAlign: 'center',
    color: theme.palette.text.disabled
  }
}))

const LayersPlayer: React.FC<{
  map: any
  selectedLayer: LayerSettingsState | undefined
  toBeRemovedLayers: string[]
  changeLayerOpacity: any
  updateLayerTimestamp: any
  onPositionChange: any
  updateVisibility: any
  getLegend: any
  getMeta: any
}> = (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const { updateVisibility, selectedLayer, changeLayerOpacity, updateLayerTimestamp, map, toBeRemovedLayers, getMeta, getLegend } = props
  const { activeLayer: layerName, availableTimestamps } = selectedLayer!!
  const [playing, setPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation(['maps', 'labels'])
  const { displayErrorSnackbar } = useSnackbars()
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const geoServerConfig = appConfig.geoServer
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])
  const importerBaseUrl = appConfig.importerBaseUrl

  const defaultPosition = useMemo<PixelPostion>(() => {
    return { x: 60, y: Math.max(90, window.innerHeight - 350) }
  }, [])

  const handleOpacityChange = (event: ChangeEvent<{}>, newValue: number | number[]) => {
    event.stopPropagation()
    const opacity: number = newValue as number
    const updatedLayer = selectedLayer ? { ...selectedLayer } : { opacity: 0, activeLayer: '' }
    updatedLayer.opacity = opacity
    props.map.setPaintProperty(updatedLayer.activeLayer, 'raster-opacity', opacity / 100)
    changeLayerOpacity(
      selectedLayer?.group,
      selectedLayer?.subGroup,
      selectedLayer?.dataTypeId,
      opacity
    )
  }

  const onDownloadHandler = async (event) => {
    event.stopPropagation()
    if (layerName && layerName.length > 0) {
      setIsLoading(true)
      const splittedlayerName = layerName.split(':')[1]
      const response = await layersApiFactory.layersGetFilename(splittedlayerName)
      if (response.status === 200) {
        const { filename } = response.data
        if (filename && filename.length > 0)
          window.location.href = importerBaseUrl + '/download?filename=' + filename
      }
    } else displayErrorSnackbar(t('contentnotavailable'))

    setIsLoading(false)
  }

  const removeLayerFromMap = (toRemoveLayer) => {
    if (map.getLayer(toRemoveLayer)) {
      map.removeLayer(toRemoveLayer)
      map.removeSource(toRemoveLayer)
    }    
  }

  useEffect(() => {
    if (toBeRemovedLayers && toBeRemovedLayers.length > 0) {
      for(let i = 0; i < toBeRemovedLayers.length; i++) {
        removeLayerFromMap(toBeRemovedLayers[i])
      }      
    }
  }, [toBeRemovedLayers])

  useEffect(() => {
    if (!selectedLayer) return

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
  }, [selectedLayer?.dateIndex])

  useEffect(() => {
    if (!selectedLayer) return
    map.setPaintProperty(selectedLayer.activeLayer, 'raster-opacity', selectedLayer.opacity / 100)
  }, [selectedLayer?.opacity])

  const skipNext = (newValue) => {
    const timestampsLength = selectedLayer?.availableTimestamps.length
    updateLayerTimestamp(
      selectedLayer?.group,
      selectedLayer?.subGroup,
      selectedLayer?.dataTypeId,
      newValue <= timestampsLength - 1 ? newValue : 0
    )
  }

  async function playPause() {
    setPlaying(!playing)
  }

  function formatDate(date: string) {
    if (!!date) {
      const formattedDate = formatter.format(new Date(date as string)) //.toLocaleString(dateFormat)
      const formatComp = formattedDate.split(',')
      const onlyHour = formatComp[1].trim()
      return onlyHour
    }
    else return ''
  }

  const onClickDateHandler = (event) => {
    event.stopPropagation()
    skipNext(selectedLayer ? selectedLayer.dateIndex + 1 : 0)
  }
  const changeDateHandler = (event, value) => {
    event.stopPropagation()
    skipNext(value)
  }
  useEffect(() => {
    if (playing) {
      const timer = setTimeout(
        () => skipNext(selectedLayer ? selectedLayer.dateIndex + 1 : 0),
        3000
      )
      return () => clearTimeout(timer)
    }
  }, [playing, changeDateHandler])

  if (!selectedLayer) return <div></div>

  const onPositionUpdate = (updatedPosition) => {
    props.onPositionChange(
      updatedPosition.x,
      updatedPosition.y,
      selectedLayer.group,
      selectedLayer.subGroup,
      selectedLayer.dataTypeId
    )
  }

  const getMetadata = () => {
    getMeta(selectedLayer.metadataId, selectedLayer.group, selectedLayer.subGroup, selectedLayer.dataTypeId)
  }

  const getLayerLegend = () => {
    getLegend(selectedLayer.activeLayer, selectedLayer.group, selectedLayer.subGroup, selectedLayer.dataTypeId)
  }

  const createLayerMarks = (timestamps) => {
    if (!timestamps || timestamps.length === 0) return []

    const layerDates = [
      ...new Set(
        timestamps.map((e) => {
          const dateValue = new Date(e)
          return dateValue.getDate()
        })
      )
    ]

    const layerFullDates = [
      ...new Set(
        timestamps.map((e) => {
          const dateValue = new Date(e)
          return dateValue.getDate() + '/' + (dateValue.getMonth() + 1)
        })
      )
    ]

    const calcHours = (hourValues, upTo) => {
      let totHours = 0
      for (let i = 0; i < upTo; i++) {
        totHours += hourValues[i]
      }
      return totHours
    }

    const lastHour = new Date(
      timestamps[selectedLayer.availableTimestamps.length - 1]
    ).getHours()

    const additionalLastValue = layerFullDates[layerFullDates.length - 1] + ' - ' + lastHour

    const layerHoursPerDate = layerDates.map(
      (e) => timestamps.filter((d) => new Date(d).getDate() === e).length
    )

    const layerMarks = [...layerFullDates].map((e, idx) => {
      if (idx === 0) {
        return {
          value: 0,
          label: e as string
        }
      }
      const hourValue = calcHours(layerHoursPerDate, idx)
      // if (idx === layerFullDates.length) {
      //   return {
      //     value: hourValue - 1,
      //     label: e as string
      //   }
      // }
      return {
        value: hourValue,
        label: e as string
      }      
    })

    return layerMarks
  }

  const layerMarks = createLayerMarks(availableTimestamps)

  const valuetext = (value, index) => {
    const formatted = formatDate(selectedLayer.availableTimestamps[value])
    return formatted
  }

  return (
    <FloatingCardContainer
      bounds={'parent'}
      defaultPosition={defaultPosition}
      selectedLayer={selectedLayer}
      position={selectedLayer.position}
      onPositionChange={onPositionUpdate}
      toggleActiveFilterTab={selectedLayer.isPlayerVisible}
      dim={{
        width: selectedLayer.dimension.w,
        height: selectedLayer.dimension.h
      }}
      onResize={null}
      resizable={true}
    >
      <AppBar
        position="static"
        color="default"
        style={{
          backgroundColor: theme.palette.primary.dark,
          boxShadow: 'none',
          display: 'block'
        }}
        className="handle handleResize"
      >
        <Grid
          container
          spacing={1}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 4 }}
        >
          <Grid item xs={7}>
            <Typography
              align="left"
              variant="h4"
              style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}
            >
              {selectedLayer.group + ' | ' + selectedLayer.name}
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            container
            spacing={2}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <label htmlFor="opacity-slider">
                {t('maps:opacity') + ': ' + selectedLayer.opacity + '%'}
              </label>
            </Grid>
            <Grid item xs>
              <Slider
                id="opacity-slider"
                defaultValue={100}
                valueLabelDisplay="off"
                step={1}
                value={selectedLayer.opacity}
                min={0}
                max={100}
                color="secondary"
                onChange={handleOpacityChange}
              />
            </Grid>
          </Grid>
          <Grid
            item
            xs={2}
            container
            spacing={2}
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <IconButton
              onClick={getLayerLegend}
              size="small"
            >
              <LegendIcon />
            </IconButton>
            <IconButton
              onClick={getMetadata}
              size="small"
            >
              <MetaIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                updateVisibility(
                  false,
                  selectedLayer.group,
                  selectedLayer.subGroup,
                  selectedLayer.dataTypeId
                )
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </AppBar>
      <CardContent>
        {selectedLayer.availableTimestamps.length > 1 ? (
          <Grid
            container
            spacing={1}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <IconButton aria-label="play/pause" onClick={playPause}>
                {playing ? (
                  <PauseCircleFilled fontSize="large" />
                ) : (
                  <PlayCircleFilled fontSize="large" />
                )}
              </IconButton>
              <IconButton aria-label="next" onClick={onClickDateHandler}>
                <SkipNextOutlined />
              </IconButton>
            </Grid>
            <Grid item xs={9}>
              <Slider
                aria-labelledby="discrete-slider-custom"
                className={classes.slider}
                defaultValue={0}
                getAriaValueText={valuetext}
                valueLabelFormat={valuetext}
                valueLabelDisplay="on"
                //step={1}
                value={selectedLayer.dateIndex}
                min={0}
                max={selectedLayer.availableTimestamps.length}
                color="secondary"
                onChange={(event, value) => {
                  changeDateHandler(event, value)
                }}
                marks={layerMarks}
              />
            </Grid>
            <Grid item xs={1} container direction="row"
            justifyContent="flex-end"
            alignItems="center">
              {!isLoading ? (
                <IconButton
                  aria-label="download"
                  onClick={onDownloadHandler}
                >
                  <GetAppIcon />
                </IconButton>
              ) : (
                <CircularProgress color="secondary" size={20} />
              )}
            </Grid>
          </Grid>
        ) : (
          <div className={classes.oneDatapoint}> {t('maps:one_datapoint')}</div>
        )}
      </CardContent>
    </FloatingCardContainer>
  )
}

export default LayersPlayer
