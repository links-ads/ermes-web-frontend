import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import styled from 'styled-components'
import ReplayIcon from '@material-ui/icons/Replay'
import { useTranslation } from 'react-i18next'

// const { theme} = useUITheme()

export const AdministrationContainer = styled.div.attrs({ className: 'full column centered' })`
  flex-grow: 1;
  justify-content: space-evenly;
  .card-root {
    width: 300px;
    min-width: 300px;
  }
  .table-container {
    position: relative;
    width: calc(100% - ${(props) => props.theme.spacing(4)}px);
    height: calc(100% - ${(props) => props.theme.spacing(4)}px);
    tfoot {
      position: absolute;
      bottom: 0;
      width: 100%;
    }
  }
  .not-column-centered {
    flex-direction: row !important;
    width: calc(100% - ${(props) => props.theme.spacing(4)}px);
    height: calc(100% - ${(props) => props.theme.spacing(4)}px);
  }
  .table-container-half {
    display: inline-flex;
    height: 100%;
    .MuiPaper-elevation2 {
      box-shadow: none !important;
    }
  }
  .table-container-half-left {
    width: 65% !important;
    border-right: 1px rgba(255, 255, 255, 0.4) solid;
  }
  .table-container-half-right {
    width: 35% !important;
  }
`

export function RefreshButton({ onClick, disabled = false, icon = <ReplayIcon /> }) {
  const { t } = useTranslation()
  const title = t('common:refresh')
  return onClick ? (
    <Tooltip title={title}>
      <span>
        <IconButton
          disabled={disabled}
          edge="end"
          aria-label="comments"
          size="small"
          onClick={onClick}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  ) : null
}
