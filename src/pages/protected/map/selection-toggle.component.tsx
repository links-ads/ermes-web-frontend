import React from 'react'
import IconButton from '@mui/material/IconButton'
import TabUnselected from '@mui/icons-material/TabUnselected'
import Tooltip from '@mui/material/Tooltip'
import { useMapStateContext } from './map.contest'
import { CulturalProps } from './provisional-data/cultural.component'
import styled from 'styled-components'

const SelectionToggleContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  position: absolute;
  top: 78px;
  left: 0px;
  margin: 10px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }

export function SelectionToggle() {
  const [{ mapMode }, { setMapMode }] = useMapStateContext<CulturalProps>()

  const color = mapMode === 'select' ? 'secondary' : 'inherit'
  const title = mapMode === 'browse' ? 'Select items drawing a box' : 'Click to remove selection'
  const disabled = mapMode === 'edit'

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const mode = mapMode === 'select' ? 'browse' : 'select'
    console.debug(mode, mapMode)
    setMapMode(mode)
  }

  return (
    <SelectionToggleContainer>
      <Tooltip title={title}>
        <span>
          <IconButton
            onClick={onClick}
            aria-label="toggle-selection"
            className="mapboxgl-ctrl-icon"
            disabled={disabled}
          >
            <TabUnselected style={ICON_STYLE} color={color} />
          </IconButton>
        </span>
      </Tooltip>
    </SelectionToggleContainer>
  )
}
