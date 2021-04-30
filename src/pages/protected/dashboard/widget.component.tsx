import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import Close from '@material-ui/icons/Close'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { EmptyWidget, TestWidget } from './test-widgets'
import { PieWidget } from './pie-widget'
import { WidgetType } from './dashboard.config'
import { BarWidget } from './bar-widget'

const WidgetBar = styled.div`
  width: 100%;
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 8px;
`
const WidgetBody = styled.div`
  width: 100%;
  height: calc(100% - 16px);
`

export function Widget({
  wid,
  title,
  type = 'empty',
  description,
  removeWidget = (i: string) => {}
}: {
  wid: string
  type?: WidgetType
  removeWidget?: (i: string) => void
  title?: string
  description?: string
}) {
  const fallbackTitle = `Widget ${wid}`
  const { t } = useTranslation()
  let WidgetChild: JSX.Element
  switch (type) {
    case 'piechart':
      WidgetChild = <PieWidget wid={wid} />
      break
    case 'test':
      WidgetChild = <TestWidget wid={wid} />
      break
    case 'barchart':
      WidgetChild = <BarWidget wid={wid} />
      break
    case 'empty':
    default:
      WidgetChild = <EmptyWidget text={fallbackTitle} wid={wid} />
      break

  }
  // const WidgetChild =
  //   type === 'test' ? <TestWidget wid={wid} /> : <EmptyWidget text={fallbackTitle} wid={wid} />
  const closeTooltip = t('common:close')
  return (
    <Paper
      key={wid}
      elevation={3}
      //   variant="outlined"
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      <WidgetBar>
        <Tooltip title={description || fallbackTitle}>
          <span>{title || fallbackTitle}</span>
        </Tooltip>
        <Tooltip title={closeTooltip}>
          <IconButton
            size="small"
            edge="end"
            aria-label="close-widget"
            onClick={() => removeWidget(wid)}
          >
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </WidgetBar>
      <WidgetBody>{WidgetChild}</WidgetBody>
    </Paper>
  )
}
