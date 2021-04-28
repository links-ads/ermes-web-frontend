import React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import AccountCircle from '@material-ui/icons/AccountCircle'
import { useLogout, useUser } from '../../state/auth/auth.hooks'
import { useTranslation } from 'react-i18next'
import { Avatar } from '@material-ui/core'

export function AccountWidget() {
  const logout = useLogout()
  const { profile } = useUser()
  const { t } = useTranslation()
  const title = profile
    ? t('common:authenticated_as', { displayName: profile.user.displayName })
    : ''

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (action: string) => {
    setAnchorEl(null)
    if (action === 'logout') {
      logout()
    }
  }

  return profile ? (
    <div>
      <Tooltip title={title}>
        <IconButton aria-controls="account-menu" aria-haspopup="true" onClick={handleClick}>
          {profile.user.imageUrl ? (
            <Avatar
              src={profile.user.imageUrl}
              alt="user-profile"
              style={{ width: 24, height: 24 }}
            />
          ) : (
            <AccountCircle />
          )}
        </IconButton>
      </Tooltip>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleClose('logout')}>{t('common:logout')}</MenuItem>
        {/* {languages.map(l => (
          <MenuItem key={l.code} onClick={() => handleClose(l.code)}>
            {l.itemLabel}
          </MenuItem>
        ))} */}
      </Menu>
    </div>
  ) : null
}
