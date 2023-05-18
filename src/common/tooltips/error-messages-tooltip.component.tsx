import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import { MapRequestLayerErrorDto } from 'ermes-ts-sdk'

const ErrorMessagesTooltip: React.FC<{
  errors: MapRequestLayerErrorDto[]
}> = (props) => {
  const { errors } = props
  const disabled = errors.length === 0
  const sortedList = errors && errors.length > 0 ? errors.map(item => { return { timestamp: new Date(item.acquisitionDate!), message: item.message!}}).sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1) : []
  const title = sortedList.length > 0 ? sortedList.map((item) => item.message).join(' ') : ''
  return (
    <Tooltip title={title} disableFocusListener={disabled}>
      <IconButton disabled={disabled}>
        <HelpIcon />
      </IconButton>
    </Tooltip>
  )
}

export default ErrorMessagesTooltip
