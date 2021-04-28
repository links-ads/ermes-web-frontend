import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'
import ColorLens from '@material-ui/icons/ColorLens'
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
