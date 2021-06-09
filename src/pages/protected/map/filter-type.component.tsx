import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import styled from 'styled-components'
import FilterListIcon from '@material-ui/icons/FilterList'

const FilterTypeContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  position: absolute;
  top: 112px;
  left: 0px;
  margin: 10px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }
// Button which enables the filter on the top left part of the map to filter the types
export function FilterType(props) {

  const color = props.toggleActiveFilterTab? 'secondary' : 'inherit'


  function onClick(e: React.MouseEvent) {
    props.setToggleActiveFilterTab(!props.toggleActiveFilterTab)
  }

  return (
    <FilterTypeContainer>
      <Tooltip title={'UPDATE TITLE HERE'}>
        <span>
          <IconButton
            onClick={onClick}
            aria-label="toggle-selection"
            className="mapboxgl-ctrl-icon"
            // disabled={disabled}
          >
            <FilterListIcon style={ICON_STYLE} color={color} />
          </IconButton>
        </span>
      </Tooltip>
    </FilterTypeContainer>
  )
}
