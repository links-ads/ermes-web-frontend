import React from 'react'
import { useTheme } from '@material-ui/core'
import { Cancel, CheckCircle } from '@material-ui/icons'

export function ValidatedIcon({ type, avatar = false }) {
  const theme = useTheme()

  const containerColor = type === 'fire' ? 'white' : 'black'
  const iconColor = type === 'fire' ? theme.palette.error.dark : theme.palette.primary.contrastText

  return (
    <div
      style={{
        borderRadius: '50%',
        marginLeft: avatar ? 4 : 0,
        backgroundColor: containerColor,
        width: avatar ? 'auto' : 16,
        height: avatar ? 'auto' : 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CheckCircle style={{ fill: iconColor, fontSize: 20 }} />
    </div>
  )
}

export function DiscardedIcon({ type, avatar = false }) {
  const theme = useTheme()

  const containerColor = type === 'fire' ? 'white' : 'black'
  const iconColor = type === 'fire' ? theme.palette.error.dark : theme.palette.primary.contrastText

  return (
    <div
      style={{
        borderRadius: '50%',
        marginLeft: avatar ? 4 : 0,
        backgroundColor: containerColor,
        width: avatar ? 'auto' : 16,
        height: avatar ? 'auto' : 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Cancel style={{ fill: iconColor, fontSize: 20 }} />
    </div>
  )
}
