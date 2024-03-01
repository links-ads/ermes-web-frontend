import React from 'react'
import { Chip, useTheme } from '@material-ui/core'
import classes from './communication-card.module.scss'

type CameraChipProps = {
  status: boolean
  label: string
}

export function CameraChip({ status, label }: CameraChipProps) {
  const theme = useTheme()

  if (!status) {
    return null
  }

  return (
    <Chip
      color="primary"
      size="small"
      style={{
        backgroundColor: theme.palette.grey[100],
        borderColor: theme.palette.grey[100],
        color: theme.palette.grey[900],
        marginRight: 4
      }}
      className={classes.chipStyle}
      label={label}
    />
  )
}
