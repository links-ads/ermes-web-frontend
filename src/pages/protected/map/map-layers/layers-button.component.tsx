import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import styled from 'styled-components'
import { Layers } from '@material-ui/icons'

const LayersButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  border-bottom: 1px solid #fff;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }
// Button which enables the filter on the top left part of the map to filter the types
export function LayersButton(props) {
  const color = props.visibility ? 'secondary' : 'inherit'

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
          >
            <Layers style={ICON_STYLE} color={color} />
          </IconButton>
        </span>
      </Tooltip>
    </LayersButtonContainer>
  )
}
