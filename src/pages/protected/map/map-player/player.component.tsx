import React, { useCallback, useEffect, useState } from 'react'
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
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    width: '90%',
    display: 'inline-block',
    paddingLeft: 32,
    paddingTop: 11,
    paddingBottom: 11,
    marginRight: 32
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

  const layerProps = props.layerId2Tiles[props.selectedLayerId]

  const [playing, setPlaying] = useState(false)
  const { t, i18n } = useTranslation(['maps'])

  const insideData = {
    subGroup: props.layerId2Tiles[props.selectedLayerId]
      ? props.layerId2Tiles[props.selectedLayerId].subGroup
      : 'No layer selected',
    labels: props.layerId2Tiles[props.selectedLayerId]
      ? props.layerId2Tiles[props.selectedLayerId].names
      : [],
    timestamps: props.layerId2Tiles[props.selectedLayerId]
      ? props.layerId2Tiles[props.selectedLayerId].timestamps
      : []
  }
  console.log('LayersPlayer', props.layerId2Tiles)
  console.log('LayerID', props.selectedLayerId, 'visibility', props.visibility)
  
  function valuetext(value) {
    return insideData.timestamps[value]
  }

  const skipNext = useCallback(async (dateIndex: number, timestampsLength: number, setDateIndex) => {
    if (dateIndex < timestampsLength - 1) {
      setDateIndex(dateIndex + 1)
    } else {
      setDateIndex(0)
    }
  }, [])

  async function playPause() {
    setPlaying(!playing)
  }

  function formatDate(date: string) {

    return formatter.format(new Date(date as string))//.toLocaleString(dateFormat)
  }

  useEffect(() => {
    if (playing) {
      let timer = setTimeout(() => skipNext(props.dateIndex, insideData.timestamps.length, props.setDateIndex), 5000)
      return () => clearTimeout(timer)
    }
  }, [playing, props.dateIndex, props.setDateIndex, insideData.timestamps, skipNext])

  useEffect(() => {
    // do whatever you want to do here
    console.log("FIRST RENDER HERE")
    props.setDateIndex(0)
  }, [])

  function testResize(w:number, h:number){
    console.log('onresizeend',  w, h )
  }

  return (
    <FloatingCardContainer
      bounds={'parent'}
      defaultPosition={props.defaultPosition}
      position={props.position}
      onPositionChange={props.onPositionChange}
      toggleActiveFilterTab={props.visibility}
      dim={{
        width: 500,
        height: 250
      }}
      onResize={null}
      onResizeStop={(_, { size: { width, height } }) => {
        testResize(width, height )
      }}
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
          <Typography align="left" variant="h4" style={{ fontSize: '2rem'}} >
            {insideData.subGroup}
          </Typography>
        </span>
        <span>
          <IconButton
            style={{ marginTop: '10px', position: 'absolute', right: '10px' }}
            onClick={() => {
              props.setVisibility(false)
            }}
          >
            <CloseIcon />
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
          {layerProps ? formatDate(layerProps['timestamps'][props.dateIndex]) : null}
        </Typography>
        <div className={classes.playerContainer}>
          {insideData.timestamps.length > 1 ?
            <span className={classes.spanContainer}>
              <div className={classes.sliderContainer}>
                <Slider
                  className={classes.slider}
                  aria-label="Temperature"
                  defaultValue={0}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="on"
                  step={1}
                  value={props.dateIndex}
                  // marks
                  min={0}
                  max={insideData.timestamps.length}
                  color="secondary"
                  onChange={(event, value) => {
                    props.setDateIndex(value)
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
                <IconButton aria-label="next" onClick={() => skipNext(props.dateIndex, insideData.timestamps.length, props.setDateIndex)}>
                  <SkipNextIcon />
                </IconButton>
              </div>
            </span> : <div className={classes.oneDatapoint} > {t('maps:one_datapoint')} </div>}
        </div>
      </CardContent>
    </FloatingCardContainer>
  )
}
