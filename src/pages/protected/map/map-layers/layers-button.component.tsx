import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import styled from 'styled-components'
// import LayersIcon from '@material-ui/icons/LayersIcon'
import {Layers} from '@material-ui/icons'


const LayersButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  position: absolute;
  top: 67px;
  left: 0px;
  margin: 10px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }
// Button which enables the filter on the top left part of the map to filter the types
export function LayersButton(props) {

  const color = props.visibility ? 'secondary' : 'inherit'
//   const color = 'inherit'


  function onClickHandler(e: React.MouseEvent) {
    props.setVisibility(!props.visibility)
  }

  return (
    <LayersButtonContainer>
      <Tooltip title={'Map layers'}>
        <span>
          <IconButton
            onClick={onClickHandler}
            aria-label="toggle-selection"
            className="mapboxgl-ctrl-icon"
          // disabled={disabled}
          >
            <Layers style={ICON_STYLE} color={color} />
          </IconButton>
        </span>
      </Tooltip>
    </LayersButtonContainer>
  )
}
