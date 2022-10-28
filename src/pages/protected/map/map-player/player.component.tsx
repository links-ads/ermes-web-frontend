import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  makeStyles,
  AppBar,
  useTheme,
  Typography,
  IconButton,
  CardContent,
  Slider
} from '@material-ui/core'
import FloatingCardContainer from '../../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import LegendIcon from '@material-ui/icons/FilterNone'
import MetaIcon from '@material-ui/icons/InfoOutlined'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import { NO_LAYER_SELECTED } from '../map-layers/layers-select.component'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    width: '75%',
    display: 'inline-block',
    paddingLeft: 32,
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


export function LayersPlayer(props) {
  const classes = useStyles()
  const theme = useTheme()
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const {layerSelection,layerId2Tiles,setDateIndex,dateIndex,visibility,setVisibility, updateCurrentLayer} = props

  const [playing, setPlaying] = useState(false)
  const [opacity, setOpacity] = useState<number>(100);
  const { t } = useTranslation(['maps'])
  const [ layerName, setLayerName ] = useState('')

  const layerProps = useMemo(()=>{
    switch(layerSelection.isMapRequest){
      case NO_LAYER_SELECTED:
        return null
      case 0: //it's not a maprequestlayer, picking layerId2Tiles[0][dataypeId of the layer selected]
        return layerId2Tiles[layerSelection.isMapRequest][layerSelection.dataTypeId]
      case 1: //it's a maprequestlayer, picking layerId2Tiles[1][id of the maprequest element clicked][dataypeId of the layer selected]

        setLayerName(layerId2Tiles[layerSelection.isMapRequest][layerSelection.mapRequestCode][layerSelection.dataTypeId].names[0])
        return layerId2Tiles[layerSelection.isMapRequest][layerSelection.mapRequestCode][layerSelection.dataTypeId]
    }
  },[layerSelection])

  const insideData = {
    name: layerProps
      ? layerProps.name
      : 'No layer selected',
    labels: layerProps
      ? layerProps.names
      : [],
    timestamps: layerProps
      ? layerProps.timestamps
      : [],
      metadatas: layerProps
      ? layerProps.metadataId
      : []
  }
  useMemo(() => updateCurrentLayer(layerName), [layerName]);
  // console.log('LayersPlayer', props.layerId2Tiles)
  // console.log('LayerID', props.layerSelection)

  /**
   * updates the values then the slider is moved
   * at the moment metadatas and labels are the same for each timestamp
   * @param value the index of the slider
   * @returns the timestamp to visualize as title
   */
  function valuetext(value) {
    setLayerName(insideData.labels[value])
    props.onPlayerChange(insideData.labels[value], insideData.metadatas[value], insideData.name)
    //setSelectedName(insideData.labels[value])
    return insideData.timestamps[value]
  }

 

  const handleOpacityChange = (event: ChangeEvent<{}>, newValue: number | number[]) => {
    event.stopPropagation();
    const opacity: number = newValue as number
    setOpacity(opacity)
    props.map.setPaintProperty(
      layerName,
      'raster-opacity',
      opacity / 100
    )
  }


  const skipNext = useCallback(async (dateIndex:number,timestampsLength:number,setDateIndex) => {
    if (dateIndex < timestampsLength - 1) {
      setDateIndex(dateIndex + 1)
    } else {
      setDateIndex(0)
    }

  },[])

  async function playPause() {
    setPlaying(!playing)
  }
  
  function formatDate(date: string){
    if(!!date)
      return formatter.format(new Date(date as string))//.toLocaleString(dateFormat)
    else return undefined
  }

  useEffect(() => {
    setDateIndex(0)
  }, [layerSelection])

  useEffect(() => {
    if (playing) {
      let timer = setTimeout(() => skipNext(dateIndex,insideData.timestamps.length,setDateIndex), 5000)
      return () => clearTimeout(timer)
    }
  }, [playing, dateIndex,setDateIndex,insideData.timestamps,skipNext])

  //console.log("DATE",dateIndex,layerProps,layerProps && layerProps['timestamps'][dateIndex],layerProps && typeof layerProps['timestamps'][dateIndex])

  return (
    <FloatingCardContainer
      bounds={'parent'}
      defaultPosition={props.defaultPosition}
      position={props.position}
      onPositionChange={props.onPositionChange}
      toggleActiveFilterTab={visibility}
      dim={{
        width: 500,
        height: 275
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
          <Typography align="left" variant="h4" style={{ fontSize: '2rem' }}>
            {insideData.name}
          </Typography>
        </span>
        <span>
          <IconButton
            style={{ marginTop: '10px', position: 'absolute', right: '10px' }}
            onClick={() => {
              setVisibility(false)
            }}
          >
            <CloseIcon />
          </IconButton>
          <IconButton
            style={{ marginTop: '10px', position: 'absolute', right: '60px' }}
            onClick={() => {
              props.getLegend(layerName)
            }}
          >
            <LegendIcon />
          </IconButton>
          <IconButton
            style={{ marginTop: '10px', position: 'absolute', right: '110px' }}
            onClick={() => {
              if(typeof(insideData.metadatas) == 'object')
                props.getMeta(insideData.metadatas[dateIndex])
              else if (typeof(insideData.metadatas) == 'string')
                props.getMeta(insideData.metadatas)
              else 
                console.log('no metadata procedure implemented for type', typeof(insideData.metadatas))
            }}
          >
            <MetaIcon />
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
          {layerProps ? (!!formatDate(layerProps['timestamps'][dateIndex]) ? formatDate(layerProps['timestamps'][dateIndex]) : formatDate(layerProps['timestamps'][0])) : null}
        </Typography>
        <div className={classes.playerContainer}>
          {insideData.timestamps.length > 1 ? (
            <span className={classes.spanContainer}>
              <div className={classes.sliderContainer}>
                <Slider
                  className={classes.slider}
                  aria-label="Temperature"
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="on"
                  step={1}
                  value={dateIndex}
                  // marks
                  min={0}
                  max={insideData.timestamps.length - 1}
                  color="secondary"
                  onChange={(event, value) => {
                    setDateIndex(value)
                    setOpacity(100)     
                  }}
                />
              </div>
              <div className={classes.buttonsContainer}>
                <IconButton aria-label="play/pause" onClick={playPause}>
                  {playing ? (
                    <PauseIcon style={{ height: 45, width: 45 }} />
                  ) : (
                    <PlayArrowIcon style={{ height: 45, width: 45 }} />
                  )}
                </IconButton>
                <IconButton
                  aria-label="next"
                  onClick={() => skipNext(dateIndex, insideData.timestamps.length, setDateIndex)}
                >
                  <SkipNextIcon />
                </IconButton>
              </div>
            </span>
          ) : (
            <div className={classes.oneDatapoint}> {t('maps:one_datapoint')} 
            
            </div>
            
          )}
        </div>
        <div className={classes.sliderContainer}>
          <label htmlFor="opacity-slider">
            {t('maps:opacity')} {opacity}%
          </label>
            <Slider
              id="layer-slider"
              defaultValue={100}
              valueLabelDisplay="off"
              step={1}
              value={opacity}
              min={0}
              max={100}
              color="secondary"
              onChange={handleOpacityChange}
            />
        </div>
      </CardContent>
    </FloatingCardContainer>
  )
}