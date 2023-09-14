import React, { useState } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Tooltip from '@material-ui/core/Tooltip'
import { useMapPreferences } from '../../../state/preferences/preferences.hooks'
import SpeedDial, { SpeedDialProps } from '@material-ui/lab/SpeedDial'
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon'
import SpeedDialAction from '@material-ui/lab/SpeedDialAction'
import { Spiderifier } from '../../../utils/map-spiderifier.utils'
import { InteractiveMap } from 'react-map-gl'
import { Theme, createStyles, makeStyles, withStyles } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

const MapStyleSpeedDial = (props) => {
  return <div className={props.classes.root}>{props.children}</div>
}

const MapStyleButtonContainer = withStyles(
  (theme) => ({
    root: {
      position: 'absolute',
      top: 164,
      right: 0,
      [theme.breakpoints.down('sm')]: {
        top: 340
      },
      [theme.breakpoints.between('sm', 'md')]: {
        top: 164
      }
    }
  }),
  { withTheme: true }
)(MapStyleSpeedDial)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    speedDialParent: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    speedDial: {
      position: 'absolute',
      bottom: 16,
      right: 0
    },
    speedDialAction: {
      borderRadius: 0,
      height: 27,
      width: 27,
      minHeight: 27
    },
    speedDialIconRoot: {
      border: `2px solid ${theme.palette.background.paper}`,
      borderRadius: 0,
      boxSizing: 'border-box',
      height: 27,
      width: 27,
      minHeight: 27,
      '& .MuiAvatar-root': { height: 23, width: 23, minHeight: 23 },
      '& .MuiSpeedDialIcon-iconOpen': { transitionDuration: '0s!important', transform: 'none' }
    },
    speedDialFab: {
      borderRadius: 0,
      border: `2px solid ${theme.palette.background.paper}`,
      height: 27,
      width: 27,
      minHeight: 27
    }
  })
)

interface RefProps {
  mapViewRef: React.RefObject<InteractiveMap>
  spiderifierRef: React.MutableRefObject<Spiderifier | null>
  onMapStyleChange
  mapChangeSource: number
}

export function MapStyleToggle({
  mapViewRef,
  spiderifierRef,
  onMapStyleChange,
  mapChangeSource,
  hidden = false,
  direction = 'left'
}: Pick<SpeedDialProps, 'hidden' | 'direction'> & RefProps) {
  const { t } = useTranslation(['maps'])
  const title = t('maps:layers')
  const [open, setOpen] = useState(false)
  const { mapTheme, availableMapThemes, changeMapTheme } = useMapPreferences()
  const classes = useStyles()

  const handleClose = (name?: string) => {
    setOpen(false)
    if (name) {
      if(mapChangeSource==0) //check if the style change comes from main map
        onMapStyleChange()
      if (spiderifierRef.current && mapViewRef.current) {
        //spiderifierRef.current.clearSpiders(mapViewRef.current.getMap())
      }
      requestAnimationFrame(() => changeMapTheme(name))
    }
  }

  const handleOpen = () => {
    setOpen(true)
  }

  return (
    <MapStyleButtonContainer>
      <Tooltip title={title} placement="left">
        <div className={classes.speedDialParent}>
          <SpeedDial
            ariaLabel={title}
            className={"map-style " + classes.speedDial}
            hidden={hidden}
            icon={<SpeedDialIcon className={classes.speedDialIconRoot} icon={<Avatar variant="square" src={mapTheme?.preview}></Avatar>} />}
            onClose={() => handleClose()}
            onOpen={handleOpen}
            open={open}
            direction={direction}
            FabProps={{ size: 'small', className: classes.speedDialFab }}
          >
            {availableMapThemes
              .filter((mt) => mt.name !== mapTheme?.name)
              .map((mt, i) => (
                <SpeedDialAction
                  tooltipTitle={mt.label}
                  tooltipPlacement="top"
                  //tooltipOpen
                  className={classes.speedDialAction}
                  key={i}
                  onClick={() => handleClose(mt.name)}
                  icon={<SpeedDialIcon className={classes.speedDialIconRoot} icon={<Avatar variant="square" src={mt?.preview}></Avatar>}></SpeedDialIcon>}
                ></SpeedDialAction>
              ))}
          </SpeedDial>
        </div>
      </Tooltip>
    </MapStyleButtonContainer>
  )
}