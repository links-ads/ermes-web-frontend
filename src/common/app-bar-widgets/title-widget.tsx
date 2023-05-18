import React from 'react'

import { useUser } from '../../state/auth/auth.hooks'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

export function TitleWidget() {
  const { profile } = useUser()
  const { t } = useTranslation('common')
  const location = useLocation()
  const path = location.pathname.split('/')
  path.shift()

  return profile ? (
    <div>
      <Breadcrumbs separator="•" aria-label="breadcrumb">
        {path.map((e, i) => {
          return (
            <Link
            key={i}
              color={i === path.length - 1 ? 'textPrimary' : 'inherit'}
              aria-current="page"
              href={'/' + path.slice(0, i + 1).join('/')}
            >
              <Typography variant="h5" gutterBottom>
                {t('common:breadcrumb_' + e) === 'breadcrumb_' + e
                  ? e
                  : t('common:breadcrumb_' + e)}
              </Typography>
            </Link>
          )
        })}
      </Breadcrumbs>
    </div>
  ) : null
}
