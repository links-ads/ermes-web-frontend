import React from 'react'
import { IconButton, styled, Tooltip, TooltipProps } from '@material-ui/core'
import HelpIcon from '@material-ui/icons/Help'
import { MapRequestLayerErrorDto } from 'ermes-ts-sdk'

const ErrorMessagesTooltip: React.FC<{
  errors: MapRequestLayerErrorDto[]
}> = (props) => {
  const disabled = props.errors.length === 0
  const title =
    props.errors && props.errors.length > 0
      ? props.errors.map((item) => item.message).join(' ')
      : ''
  return (
    <Tooltip title={title} disableFocusListener={disabled}>
      <IconButton disabled={disabled}>
        <HelpIcon />
      </IconButton>
    </Tooltip>
  )
}

export default ErrorMessagesTooltip
