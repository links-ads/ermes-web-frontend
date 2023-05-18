import React from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import styled from 'styled-components'
// import LayersIcon from '@mui/icons-material/LayersIcon'
// import {Layers} from '@mui/icons-material'
import { PlayArrow } from '@mui/icons-material';

const LayersButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  position: absolute;
  top: 182px;
  left: 0px;
  margin: 10px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }
// Button which enables the filter on the top left part of the map to filter the types
export function PlayerButton(props) {

  const color = props.visibility ? 'secondary' : 'inherit'


  function onClick(e: React.MouseEvent) {
    props.setVisibility(!props.visibility)
  }

  return (
    <LayersButtonContainer>
      <Tooltip title={'UPDATE TITLE HERE'}>
        <span>
          <IconButton
            onClick={onClick}
            aria-label="toggle-selection"
            className="mapboxgl-ctrl-icon"
          // disabled={disabled}
          >
            <PlayArrow style={ICON_STYLE} color={color} />
          </IconButton>
        </span>
      </Tooltip>
    </LayersButtonContainer>
  )
}
