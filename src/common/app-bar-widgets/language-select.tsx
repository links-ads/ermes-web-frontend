import React from 'react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { Twemoji as Emoji } from 'react-emoji-render'
import { useTranslation } from 'react-i18next'

export default function LanguageSelect() {
  const { t, i18n } = useTranslation()

  const languages = Object.keys(i18n.services.resourceStore.data).map((l) => {
    return {
      code: l,
      itemLabel: (
        <span key={l}>
          <span>{i18n.getFixedT(l)('common:language_full')}</span>&nbsp;
          <Emoji svg={true} text={i18n.getFixedT(l)('common:language')}></Emoji>
          {/* <span className="emoji">{i18n.getFixedT(l)('common:language')}</span> */}
        </span>
      )
    }
  })
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (languageCode: string) => {
    setAnchorEl(null)
    if (typeof languageCode === 'string') {
      i18n.changeLanguage(languageCode)
    }
  }

  const title: string = t('common:switch_language')

  return (
    <div>
      <Tooltip title={title}>
        <IconButton aria-controls="language-menu" aria-haspopup="true" onClick={handleClick}>
          {/* <span className="emoji">{t('common:language')}</span> */}
          <Emoji svg={true} text={'' + t('common:language')}></Emoji>
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {languages.map((l) => (
          <MenuItem
            key={l.code}
            selected={l.code === i18n.language}
            onClick={() => handleClose(l.code)}
          >
            {l.itemLabel}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
