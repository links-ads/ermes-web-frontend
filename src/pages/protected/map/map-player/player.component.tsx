import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import { NO_LAYER_SELECTED } from '../map-layers/layers-select.component'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    width: '80%',
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

  const {layerSelection,layerId2Tiles,setDateIndex,dateIndex,visibility,setVisibility} = props

  const layerProps = useMemo(()=>{
    switch(layerSelection.isMapRequest){
      case NO_LAYER_SELECTED:
        return null
      case 0:
        return layerId2Tiles[layerSelection.isMapRequest][layerSelection.dataTypeId]
      case 1:
        return layerId2Tiles[layerSelection.isMapRequest][layerSelection.mapRequestCode][layerSelection.dataTypeId]
    }
  },[layerSelection])


  const [playing, setPlaying] = useState(false)
  const { t, i18n } = useTranslation(['maps'])
  const [ layerName, setLayerName ] = useState('')

  const insideData = {
    name: layerProps
      ? layerProps.name
      : 'No layer selected',
    labels: layerProps
      ? layerProps.names
      : [],
    timestamps: layerProps
      ? layerProps.timestamps
      : []
  }
  // console.log('LayersPlayer', props.layerId2Tiles)
  // console.log('LayerID', props.layerSelection)

  function valuetext(value) {
    console.log('valuetext', insideData.labels[value])
    setLayerName(insideData.labels[value])
    props.onPlayerChange(insideData.labels[value])
    //setSelectedName(insideData.labels[value])
    return insideData.timestamps[value]
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
    
    return formatter.format(new Date(date as string))//.toLocaleString(dateFormat)
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

  console.log("DATE",dateIndex,layerProps,layerProps && layerProps['timestamps'][dateIndex],layerProps && typeof layerProps['timestamps'][dateIndex])

  return (
    <FloatingCardContainer
      bounds={'parent'}
      defaultPosition={props.defaultPosition}
      position={props.position}
      onPositionChange={props.onPositionChange}
      toggleActiveFilterTab={visibility}
      dim={{
        width: 500,
        height: 250
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
          <Typography align="left" variant="h4" style={{ fontSize: '2rem'}}>
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
          {layerProps ?  formatDate(layerProps['timestamps'][dateIndex]) : null}
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
              max={insideData.timestamps.length}
              color="secondary"
              onChange={(event, value) => {
                setDateIndex(value)
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
            <IconButton aria-label="next" onClick={()=>skipNext(dateIndex,insideData.timestamps.length,setDateIndex)}>
              <SkipNextIcon />
            </IconButton>
          </div>
          </span>
          ) : (
            <div className={classes.oneDatapoint}> {t('maps:one_datapoint')} </div>
          )}
        </div>
      </CardContent>
    </FloatingCardContainer>
  )
}