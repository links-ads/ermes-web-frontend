// Toggle button to get the left drawer
import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import ViewCompactIcon from '@material-ui/icons/ViewCompact'
import Tooltip from '@material-ui/core/Tooltip'

import styled from 'styled-components'

const DrawerToggleContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  position: absolute;
  top: 78px;
  left: 0px;
  margin: 10px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }

export function DrawerToggle(props) {
  const color = props.toggleDrawerTab? 'secondary' : 'inherit'
  function onClick(e: React.MouseEvent) {
    props.setToggleDrawerTab(!props.toggleDrawerTab)
  }

  return (
    <DrawerToggleContainer>
      <Tooltip title={'Open/close drawer'}>
        <span>
          <IconButton
            onClick={onClick}
            aria-label="toggle-drawer"
            className="mapboxgl-ctrl-icon"
            disabled={false}
          >
            <ViewCompactIcon style={ICON_STYLE} color={color} />
          </IconButton>
        </span>
      </Tooltip>
    </DrawerToggleContainer>
  )
}
