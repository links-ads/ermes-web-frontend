import React from 'react'
import { useTheme } from '@material-ui/core'
import { Cancel, CheckCircle } from '@material-ui/icons'
import { useTranslation } from 'react-i18next'

export function ValidatedIcon({ type, avatar = false }) {
  const theme = useTheme()
  const { t } = useTranslation()

  const containerColor = theme.palette.grey[100]
  const iconColor = 'rgb(248, 168, 36)'

  return (
    <div
      style={{
        ...localStyles.iconContainer,
        backgroundColor: containerColor
      }}
    >
      {t(`maps:${type}`)}
      <CheckCircle
        style={{ fill: iconColor, backgroundColor: 'black', borderRadius: '50%', fontSize: 14 }}
      />
    </div>
  )
}

export function DiscardedIcon({ type, avatar = false }) {
  const theme = useTheme()
  const { t } = useTranslation()

  const containerColor = theme.palette.grey[100]
  const iconColor = theme.palette.grey[600]

  return (
    <div
      style={{
        ...localStyles.iconContainer,
        backgroundColor: containerColor
      }}
    >
      {t(`maps:${type}`)}
      <Cancel style={{ fill: iconColor, fontSize: 14 }} />
    </div>
  )
}

export function DetectedIcon({ type }) {
  const theme = useTheme()
  const { t } = useTranslation()

  const containerColor = theme.palette.grey[100]
  const iconColor = theme.palette.grey[100]

  return (
    <div
      style={{
        ...localStyles.iconContainer,
        backgroundColor: containerColor
      }}
    >
      {t(`maps:${type}`)}
      <Cancel
        style={{
          fill: iconColor,
          backgroundColor: iconColor,
          border: '1px solid #000',
          fontSize: 14,
          borderRadius: '50%'
        }}
      />
    </div>
  )
}

const localStyles = {
  iconContainer: {
    borderRadius: 12,
    height: 20,
    width: '45%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 12,
    color: 'black'
  }
}
