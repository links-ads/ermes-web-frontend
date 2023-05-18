import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import ColorLens from '@mui/icons-material/ColorLens'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useUITheme } from '../../state/preferences/preferences.hooks'

export default function ThemeSelect() {
  const { t } = useTranslation()
  const { themeName, availableThemes, changeTheme } = useUITheme()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const title: string = t('common:switch_theme')
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (themeName: string) => {
    setAnchorEl(null)
    changeTheme(themeName)
  }
  return (
    <div>
      <Tooltip title={title}>
        <IconButton aria-controls="theme-menu" aria-haspopup="true" onClick={handleClick}>
          <ColorLens />
        </IconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {availableThemes.map((themeNameInList) => (
          <MenuItem
            key={themeNameInList}
            onClick={() => handleClose(themeNameInList)}
            selected={themeNameInList === themeName}
            style={{ textTransform: 'capitalize' }}
          >
            {themeNameInList}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
