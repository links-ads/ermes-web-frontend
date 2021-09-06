import React from 'react'
import styled from 'styled-components'

const FilterTooltipContainer = styled.div.attrs({
    className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  position: absolute;
  top: 112px;
  left: 0px;
  margin: 10px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }
// Button which enables the filter on the top left part of the map to filter the types
export function FilterTooltip(props) {


    return (
        <FilterTooltipContainer>
            <div>Hello something here</div>
        </FilterTooltipContainer>
    )
}
