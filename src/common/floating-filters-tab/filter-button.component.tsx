import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import styled from 'styled-components'
import FilterListIcon from '@material-ui/icons/FilterList'
import { useTranslation } from 'react-i18next'


const FilterButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  position: absolute;
  top: 67px;
  left: 0px;
  margin: 10px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }
// Button which enables the filter on the top left part of the map to filter the types
export function FilterButton(props) {
  const { t } = useTranslation('filters')
  const color = props.toggleActiveFilterTab ? 'secondary' : 'inherit'


  function onClick(e: React.MouseEvent) {
    props.setToggleActiveFilterTab(!props.toggleActiveFilterTab)
  }

  return (
    <FilterButtonContainer>
      <Tooltip title={t('filters:filters') ?? 'Filters'}>
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
      {/* <FilterTooltip />  */}
    </FilterButtonContainer>
  )
}
