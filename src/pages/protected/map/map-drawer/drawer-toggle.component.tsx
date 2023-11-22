// Toggle button to get the left drawer
import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import { SvgIcon } from '@material-ui/core'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

const DrawerToggleContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  border-bottom: 1px solid #fff;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }

const DrawerIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M34 207 c-2 -7 -4 -52 -2 -98 l3 -84 85 0 85 0 0 95 0 95 -83 3 c-63
2 -84 0 -88 -11z m156 -27 c0 -18 -7 -20 -70 -20 -63 0 -70 2 -70 20 0 18 7
20 70 20 63 0 70 -2 70 -20z m0 -60 c0 -18 -7 -20 -70 -20 -63 0 -70 2 -70 20
0 18 7 20 70 20 63 0 70 -2 70 -20z m0 -60 c0 -18 -7 -20 -70 -20 -63 0 -70 2
-70 20 0 18 7 20 70 20 63 0 70 -2 70 -20z"
        />
        <path
          d="M100 180 c0 -5 9 -10 20 -10 11 0 20 5 20 10 0 6 -9 10 -20 10 -11 0
-20 -4 -20 -10z"
        />
        <path
          d="M100 120 c0 -5 9 -10 20 -10 11 0 20 5 20 10 0 6 -9 10 -20 10 -11 0
-20 -4 -20 -10z"
        />
        <path
          d="M100 60 c0 -5 9 -10 20 -10 11 0 20 5 20 10 0 6 -9 10 -20 10 -11 0
-20 -4 -20 -10z"
        />
      </g>
    </SvgIcon>
  )
}

export function DrawerToggle(props) {
  const { t } = useTranslation(['maps', 'labels'])
  const color = props.toggleDrawerTab ? 'secondary' : 'inherit'
  function onClick(e: React.MouseEvent) {
    props.setToggleDrawerTab(!props.toggleDrawerTab)
  }

  return (
    <DrawerToggleContainer>
      <Tooltip title={t('labels:mapDrawer') ?? ''} placement="left-start">
        <span>
          <IconButton
            onClick={onClick}
            aria-label="toggle-drawer"
            className="mapboxgl-ctrl-icon"
            disabled={false}
          >
            <DrawerIcon style={ICON_STYLE} color={color} />
          </IconButton>
        </span>
      </Tooltip>
    </DrawerToggleContainer>
  )
}
