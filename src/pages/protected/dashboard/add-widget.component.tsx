import React, { useState } from 'react'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import styled from 'styled-components'
import Tooltip from '@material-ui/core/Tooltip'
import { WidgetType } from './dashboard.config'

const HiddenControls = styled.div`
  position: absolute;
  right: 16px;
  bottom: 16px;
  transition: opacity ${props => props.theme.transitions.easing.sharp};
  opacity: 0.2;
  &:hover {
    opacity: 1;
  }
`

export function AddWidgetComponent({ addWidget }: { addWidget: (type: WidgetType) => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (type?: WidgetType) => {
    if (type) {
      addWidget(type)
    }
    setAnchorEl(null)
  }

  return (
    <HiddenControls>
      <Tooltip title={'Add widgets'}>
        <Fab color="secondary" size="small" aria-label="add" onClick={handleClick}>
          <AddIcon />
        </Fab>
      </Tooltip>
      <Menu
        id="add-items-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => handleClose()}
      >
        <MenuItem onClick={() => handleClose('empty')}>Empty</MenuItem>
        <MenuItem onClick={() => handleClose('test')}>Test</MenuItem>
        <MenuItem onClick={() => handleClose('piechart')}>Pie Chart</MenuItem>
      </Menu>
    </HiddenControls>
  )
}
