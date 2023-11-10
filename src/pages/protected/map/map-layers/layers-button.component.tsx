import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import styled from 'styled-components'
import { SvgIcon } from '@material-ui/core'

const LayersButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  border-bottom: 1px solid #fff;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`

const CustomLayersIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M75 198 c-52 -27 -53 -28 -31 -40 19 -11 19 -11 1 -24 -18 -14 -18
-14 1 -28 18 -14 18 -15 2 -21 -27 -11 -22 -19 27 -43 l45 -22 45 22 c49 24
54 32 28 43 -17 6 -17 7 1 21 20 14 20 14 0 28 -18 14 -18 15 -1 21 9 4 17 10
17 14 0 6 -85 52 -93 51 -1 -1 -20 -10 -42 -22z m70 -10 c31 -14 32 -22 0 -36
-19 -9 -31 -9 -50 0 -14 6 -25 14 -25 18 0 5 29 23 47 29 1 1 14 -4 28 -11z
m25 -68 c0 -4 -11 -12 -25 -18 -19 -9 -31 -9 -50 0 -38 17 -30 26 25 26 28 0
50 -4 50 -8z m0 -50 c0 -4 -11 -12 -25 -18 -19 -9 -31 -9 -50 0 -38 17 -30 26
25 26 28 0 50 -4 50 -8z"
        />
      </g>
    </SvgIcon>
  )
}

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
            <CustomLayersIcon style={ICON_STYLE} color={color} />
          </IconButton>
        </span>
      </Tooltip>
    </LayersButtonContainer>
  )
}
