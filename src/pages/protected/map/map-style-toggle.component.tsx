import React, { useState } from 'react'
import Avatar from '@material-ui/core/Avatar'
import styled from 'styled-components'
import Tooltip from '@material-ui/core/Tooltip'
import { useMapPreferences } from '../../../state/preferences/preferences.hooks'
import SpeedDial, { SpeedDialProps } from '@material-ui/lab/SpeedDial'
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon'
import SpeedDialAction from '@material-ui/lab/SpeedDialAction'
import { Spiderifier } from '../../../utils/map-spiderifier.utils'
import { InteractiveMap } from 'react-map-gl'

const MapStyleToggleContainer = styled.div.attrs({
  className: 'map-style-toggle-container'
})`
  position: absolute;
  bottom: 0px;
  left: 0px;
  margin: 10px;
  width: 56px;
  z-index: 10;

  .speed-dial-parent {
    position: relative;
    display: flex;
    align-items: center;

    .MuiSpeedDialIcon-root {
      height: 100%;
      border: 2px solid ${(props) => props.theme.palette.background.paper};
      border-radius: 50%;
      box-sizing: border-box;
    }
  }
`

interface RefProps {
  mapViewRef: React.RefObject<InteractiveMap>
  spiderifierRef: React.MutableRefObject<Spiderifier | null>
}

export function MapStyleToggle({
  mapViewRef,
  spiderifierRef,
  hidden = false,
  direction = 'right'
}: Pick<SpeedDialProps, 'hidden' | 'direction'> & RefProps) {
  const title = 'Change Map Style'
  const [open, setOpen] = useState(false)
  const { mapTheme, availableMapThemes, changeMapTheme } = useMapPreferences()

  const handleClose = (name?: string) => {
    setOpen(false)
    if (name) {
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
    <MapStyleToggleContainer style={{ bottom: "0px"}}>
      <Tooltip title={title} placement="top">
        <div className="speed-dial-parent">
          <SpeedDial
            ariaLabel={title}
            className="map-style speed-dial"
            hidden={hidden}
            icon={<SpeedDialIcon icon={<Avatar src={mapTheme?.preview}></Avatar>} />}
            onClose={() => handleClose()}
            onOpen={handleOpen}
            open={open}
            direction={direction}
            FabProps={{ size: 'small' }}
          >
            {availableMapThemes
              .filter((mt) => mt.name !== mapTheme?.name)
              .map((mt, i) => (
                <SpeedDialAction
                  tooltipTitle={mt.label}
                  tooltipPlacement="top"
                  //tooltipOpen
                  key={i}
                  onClick={() => handleClose(mt.name)}
                  icon={<SpeedDialIcon icon={<Avatar src={mt?.preview}></Avatar>}></SpeedDialIcon>}
                ></SpeedDialAction>
              ))}
          </SpeedDial>
        </div>
      </Tooltip>
    </MapStyleToggleContainer>
  )
}
