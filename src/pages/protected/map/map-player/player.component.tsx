import React, { ChangeEvent, useContext, useEffect, useMemo, useState } from 'react'
import {
  makeStyles,
  AppBar,
  useTheme,
  Typography,
  IconButton,
  CardContent,
  Slider,
  CircularProgress
} from '@material-ui/core'
import FloatingCardContainer from '../../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import LegendIcon from '@material-ui/icons/FilterNone'
import MetaIcon from '@material-ui/icons/InfoOutlined'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import { useTranslation } from 'react-i18next'
import { useAPIConfiguration } from '../../../../hooks/api-hooks'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { AppConfig, AppConfigContext } from '../../../../config'
import { useSnackbars } from '../../../../hooks/use-snackbars.hook'
import GetAppIcon from '@material-ui/icons/GetApp'
import { tileJSONIfy } from '../../../../utils/map.utils'
import { LayerSettingsState } from '../../../../models/layers/LayerState'
import { PixelPostion } from '../../../../models/common/PixelPosition'

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    width: '60%',
    display: 'inline-block',
    paddingLeft: 11,
    paddingTop: 11,
    paddingBottom: 11
  },
  heading: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: theme.typography.fontWeightRegular
  },
  accordionDetails: {
    display: 'block'
  },
  sliderContainer: {
    display: 'flex',
    width: '75%',
    height: '50px',
    verticalAlign: '-moz-middle-with-baseline',  
    alignItems:'flex-end'
  },
  transparencyContainer: {
    display: 'inline-flex',
    width: '25%',
    // height: '50px',
    verticalAlign: '-moz-middle-with-baseline',  
    alignItems:'flex-end'
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
  transparencySlider: {
    width: '45%',
    marginLeft: 10
    // display: 'inline-block',
    // '& .MuiSlider-thumb': {
    //   backgroundColor: '#fff',
    //   width: '16px',
    //   height: '16px'
    // },
    // '& .MuiSlider-track': {
    //   border: 'none',
    //   height: '6px',
    //   borderRadius: '3px'
    // },
    // '& .MuiSlider-rail': {
    //   opacity: 0.5,
    //   backgroundColor: '#fff',
    //   height: '6px',
    //   borderRadius: '3px'
    // },
    // '& .MuiSlider-mark ': {
    //   color: '#fff',
    //   display: 'none'
    // }
  },
  buttonsContainer: {
    width: '25%',
    
    alignItems:'center',
    textAlign: 'end',
    display: 'flex',
    '& .MuiButtonBase-root': {
      display: 'inline-block',
      padding: 0,
      marginTop: '12px'
    }
  },
  playerContainer: {
    paddingTop: '25px',
    width: '90%',
  },
  spanContainer:{
    display: 'flex',
    flexDirection: 'row',
    width: '100%'
    
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
  updateLayersSetting: any
  visibility: boolean
  setVisibility: any
  position: any
  onPositionChange: any
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

  const { visibility, setVisibility, selectedLayer, updateLayersSetting, map } = props

  const [playing, setPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation(['maps', 'labels'])
  const layerName = selectedLayer?.activeLayer
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
    const updatedLayer = selectedLayer ? { ...selectedLayer } : { opacity : 0, activeLayer: ''}
    updatedLayer.opacity = opacity
    props.map.setPaintProperty(updatedLayer.activeLayer, 'raster-opacity', opacity / 100)
    updateLayersSetting(
      selectedLayer?.group,
      selectedLayer?.subGroup,
      selectedLayer?.dataTypeId,
      opacity,
      'OPACITY'
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

  useEffect(() => {
    if (!selectedLayer) return
    if (selectedLayer.toBeRemovedLayer !== '' && map.getLayer(selectedLayer.toBeRemovedLayer)) {
      map.removeLayer(selectedLayer.toBeRemovedLayer)
      map.removeSource(selectedLayer.toBeRemovedLayer)
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
  }, [selectedLayer?.dateIndex])

  useEffect(() => {
    if (!selectedLayer) return
    map.setPaintProperty(selectedLayer.activeLayer, 'raster-opacity', selectedLayer.opacity / 100)
  }, [selectedLayer?.opacity])

  const skipNext = (newValue) => {
    const timestampsLength = selectedLayer?.availableTimestamps.length
    updateLayersSetting(
      selectedLayer?.group,
      selectedLayer?.subGroup,
      selectedLayer?.dataTypeId,
      newValue <= timestampsLength - 1 ? newValue : 0,
      'TIMESTAMP'
    )
  }

  async function playPause() {
    setPlaying(!playing)
  }

  function formatDate(date: string) {
    if (!!date) return formatter.format(new Date(date as string)) //.toLocaleString(dateFormat)
    else return undefined
  }

  const onClickDateHandler = (event) => {
    event.stopPropagation()
    skipNext(selectedLayer? selectedLayer.dateIndex + 1 : 0)
  }
  const changeDateHandler = (event, value) => {
    event.stopPropagation()
    skipNext(value)
  }
  useEffect(() => {
    if (playing) {
      const timer = setTimeout(() => skipNext(selectedLayer ? selectedLayer.dateIndex + 1 : 0), 3000)
      return () => clearTimeout(timer)
    }
  }, [playing, changeDateHandler])

  if (!selectedLayer) return <div></div>

  const onPositionUpdate = (updatedPosition) => {
    props.onPositionChange(updatedPosition.x, updatedPosition.y, selectedLayer.group, selectedLayer.subGroup, selectedLayer.dataTypeId)
  }

  const createLayerMarks = () => {
    const layerDates = [...new Set(selectedLayer.availableTimestamps.map((e) => {
      const dateValue = new Date(e)
      return dateValue.getDate()
    }))]
  
    const layerFullDates = [...new Set(selectedLayer.availableTimestamps.map((e) => {
      const dateValue = new Date(e)
      return dateValue.getDate() + '/' + (dateValue.getMonth() + 1)
    }))]
  
    const calcHours = (hourValues, upTo) => {
      let totHours = 0
      for(let i = 0; i < upTo; i ++){
        totHours += hourValues[i]
      }
      return totHours
    }
  
    const lastHour = new Date(selectedLayer.availableTimestamps[selectedLayer.availableTimestamps.length - 1]).getHours()
  
    const additionalLastValue = layerFullDates[layerFullDates.length - 1] + ' ' + lastHour
  
    const layerHoursPerDate = layerDates.map(e => selectedLayer.availableTimestamps.filter(d => new Date(d).getDate() === e).length)
  
    const layerMarks = [...layerFullDates, additionalLastValue].map((e, idx) => {
      if (idx === 0) {
        return {
          value: 0, 
          label: e as string
        }
      }
      const hourValue = calcHours(layerHoursPerDate, idx)
      return {
        value: hourValue, 
        label: e as string
      }
    })

    return layerMarks
  }

  const layerMarks = createLayerMarks()

  const valuetext = (value, index) => {
    return 'h' //String(hour)
  }

  return (
    <FloatingCardContainer
      bounds={'parent'}
      defaultPosition={defaultPosition}
      selectedLayer={selectedLayer}
      position={props.position}
      onPositionChange={onPositionUpdate}
      toggleActiveFilterTab={visibility}
      dim={{
        width: 1000,
        height: 190
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
        <span className={classes.titleContainer}>
          <Typography align="left" variant="h4" style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>
            {selectedLayer.group + ' | ' +selectedLayer.name}
          </Typography>
        </span>
        <span className={classes.transparencyContainer}>
          <label htmlFor="opacity-slider">
            {t('maps:opacity') + ': ' +  selectedLayer.opacity + '%'}
          </label>
          <Slider
            id="opacity-slider"
            className={classes.transparencySlider}
            defaultValue={100}
            valueLabelDisplay="off"
            step={1}
            value={selectedLayer.opacity}
            min={0}
            max={100}
            color="secondary"
            onChange={handleOpacityChange}
          />
        </span>
        <span>
          <IconButton
            style={{ marginTop: '10px', position: 'absolute', right: '10px' }}
            onClick={() => {
              setVisibility(false)
            }}
            size='small'
          >
            <CloseIcon />
          </IconButton>
          <IconButton
            style={{ marginTop: '10px', position: 'absolute', right: '45px' }}
            onClick={() => {
              if (selectedLayer)
                props.getMeta(selectedLayer.metadataId)
            }}
            size='small'
          >
            <MetaIcon />
          </IconButton>
          <IconButton
            style={{ marginTop: '10px', position: 'absolute', right: '85px' }}
            onClick={() => {
              props.getLegend(layerName)
            }}
            size='small'
          >
            <LegendIcon />
          </IconButton>
        </span>
      </AppBar>
      <CardContent
        style={{
          backgroundColor: theme.palette.primary.dark,
          paddingRight: '26px',
          paddingLeft: '34px',
          paddingTop: '0px',
          overflowY: 'hidden',
          overflowX: 'hidden',
          height: '100%'
        }}
      >
        <Typography align="left" variant="h5">
          {formatDate(selectedLayer.availableTimestamps[selectedLayer.dateIndex])}
        </Typography>
        <div className={classes.playerContainer}>
          {selectedLayer.availableTimestamps.length > 1 ? (
            <span className={classes.spanContainer}>
              <div className={classes.buttonsContainer}>
                <IconButton aria-label="play/pause" onClick={playPause}>
                  {playing ? (
                    <PauseIcon style={{ height: 45, width: 45 }} />
                  ) : (
                    <PlayArrowIcon style={{ height: 45, width: 45 }} />
                  )}
                </IconButton>
                <IconButton aria-label="next" onClick={onClickDateHandler}>
                  <SkipNextIcon />
                </IconButton>
              </div>
              <div className={classes.sliderContainer}>
                <Slider
                  aria-labelledby="discrete-slider-custom"
                  // aria-label="Temperature"
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="on"
                  //step={1}
                  value={selectedLayer.dateIndex}
                  // marks
                  min={0}
                  max={selectedLayer.availableTimestamps.length}
                  // max={selectedLayer.availableTimestamps.length - 1}
                  color="secondary"
                  onChange={(event, value) => {
                    changeDateHandler(event, value)
                  }}
                  marks={layerMarks}
                />
              </div>
              <div className={classes.buttonsContainer}>
                {!isLoading ? (
                  <IconButton
                    aria-label="download"
                    onClick={onDownloadHandler}
                    style={{ marginLeft: 10 }}
                  >
                    <GetAppIcon />
                  </IconButton>
                ) : (
                  <CircularProgress color="secondary" size={20} />
                )}
              </div>
            </span>
          ) : (
            <div className={classes.oneDatapoint}> {t('maps:one_datapoint')}</div>
          )}
        </div>
        {/* <div className={classes.sliderContainer}>
          <label htmlFor="opacity-slider">
            {t('maps:opacity')} {selectedLayer.opacity}%
          </label>
          <Slider
            id="layer-slider"
            defaultValue={100}
            valueLabelDisplay="off"
            step={1}
            value={selectedLayer.opacity}
            min={0}
            max={100}
            color="secondary"
            onChange={handleOpacityChange}
          />
        </div> */}
      </CardContent>
    </FloatingCardContainer>
  )
}

export default LayersPlayer;