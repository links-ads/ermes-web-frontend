import React, { useEffect, useState } from 'react'
import {
  Card,
  makeStyles,
  AppBar,
  useTheme,
  Typography,
  IconButton,
  CardContent,
  Slider,
  Box
} from '@material-ui/core'
import FloatingCardContainer from '../../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import SkipNextIcon from '@material-ui/icons/SkipNext'

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
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  accordionDetails: {
    display: 'block'
  },
  sliderContainer: {
    display: 'inline-block',
    width: '75%',
    height: '50px',
    verticalAlign: '-moz-middle-with-baseline',
    marginTop: '21px'
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
    textAlign: 'end',
    display: 'inline-block',
    '& .MuiButtonBase-root': {
      display: 'inline-block',
      padding: 0,
      marginTop: '12px'
    }
  },
  playerContainer: {
    paddingTop: '25px'
  }
}))

export function LayersPlayer(props) {
  const classes = useStyles()
  const theme = useTheme()
  const layerProps = props.layerId2Tiles[props.selectedLayerId]

  const [playing, setPlaying] = useState(false)

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
  console.log('LayerID', props.selectedLayerId)

  function valuetext(value) {
    console.log('valuetext', insideData.labels[value])
    return insideData.timestamps[value]
  }

  async function skipNext() {
    if (props.dateIndex < insideData.timestamps.length - 1) {
      props.setDateIndex(props.dateIndex + 1)
    } else {
      props.setDateIndex(0)
    }
  }

  async function playPause() {
    setPlaying(!playing)
  }

  useEffect(() => {
    if (playing) {
      let timer = setTimeout(() => skipNext(), 5000)
      return () => clearTimeout(timer)
    }
  }, [playing, props.dateIndex])

  return (
    <FloatingCardContainer
      bounds={'parent'}
      defaultPosition={{ x: 140, y: 500 }}
      toggleActiveFilterTab={props.visibility}
      dim={{
        width: 400,
        height: 200
      }}
      onResize={null}
      resizable={false}
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
          <Typography align="left" variant="h4">
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
          height: 138
        }}
      >
        <Typography align="left" variant="h5">
          {layerProps ? layerProps['timestamps'][props.dateIndex] : null}
        </Typography>
        <div className={classes.playerContainer}>
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
            <IconButton aria-label="next" onClick={skipNext}>
              <SkipNextIcon />
            </IconButton>
          </div>
        </div>
      </CardContent>
    </FloatingCardContainer>
  )
}
