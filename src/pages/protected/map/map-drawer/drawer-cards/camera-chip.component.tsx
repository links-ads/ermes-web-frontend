import React from 'react'
import { Chip, useTheme } from '@material-ui/core'
import classes from './communication-card.module.scss'

type CameraChipProps = {
  status: boolean
  label: string
}

export function CameraChip({ status, label }: CameraChipProps) {
  const theme = useTheme()

  return (
    <Chip
      color="primary"
      size="small"
      style={{
        backgroundColor: status ? theme.palette.error.dark : theme.palette.grey[600],
        borderColor: status ? theme.palette.error.dark : theme.palette.grey[600],
        color: status ? theme.palette.error.contrastText : '#fff',
        marginRight: 4
      }}
      className={classes.chipStyle}
      label={label}
    />
  )
}
