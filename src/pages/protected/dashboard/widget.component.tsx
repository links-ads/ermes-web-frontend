import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import Close from '@material-ui/icons/Close'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { EmptyWidget, TestWidget } from './test-widgets'
import { WidgetType } from './dashboard.config'
import { useTheme } from '@material-ui/core/styles';
import { BarWidget } from './bar-widget'
import { CircularProgress, Grid, Typography } from '@material-ui/core'
import { PieChartStats } from '../common/stats-cards.components'
import { TableWidget } from './table-widget.component'
import { LineChartWidget } from './line-chart-widge.component'
import { ReactReduxContextValue } from 'react-redux'

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
  padding: 8px 8px;
`
const WidgetBody = styled.div`
  width: 100%;
  height: calc(100% - 16px);
`

const FallbackComponent = (isLoading: boolean, isError: boolean, data: any, child: JSX.Element): JSX.Element => {
  const { t } = useTranslation(['social'])
  return isLoading ?
    (<Grid container justify='center' >
      <CircularProgress size={80} />
    </Grid >) :
    isError ?
      (<Grid container justify='center' alignItems='center' style={{height:'100%'}}>
        <Typography style={{ margin: 4 }} align="center" variant="body1">{t("social:fetch_error")}</Typography>
      </Grid >) :
      (!data || data.length === 0) ?
        (<Grid container justify='center' alignItems='center'  style={{height:'100%'}}>
            <Typography style={{ margin: 4 }} align="center" variant="body1">{t("social:no_results")}</Typography>
        </Grid >) :
        child
}

export function Widget({
  wid,
  title,
  type = 'empty',
  description,
  data,
  removeWidget = (i: string) => { },
  isLoading,
  isError
}: {
  wid: string
  type?: WidgetType
  removeWidget?: (i: string) => void
  title?: string
  description?: string
  data: any
  isLoading: boolean
  isError: boolean
}) {
  const fallbackTitle = `Widget ${wid}`
  const { t } = useTranslation(['labels'])
  let WidgetChild: JSX.Element
  const loadingComponent = (
    <Grid container justify='center'>
      <CircularProgress size={80} />
    </Grid>
  )
  switch (type) {
    case 'piechart':
      WidgetChild = FallbackComponent(isLoading, isError, data, <PieChartStats data={data} prefix={'labels:'} />)
      break
    case 'table':
      WidgetChild = FallbackComponent(isLoading,isError,data,<TableWidget data={data} title={title} />)
      break
    case 'line':
      WidgetChild = FallbackComponent(isLoading,isError,data,<LineChartWidget data={data} title={title} />)
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
  WidgetChild = (<div
    data-wid={wid}
    style={{
      width: '100%',
      height: '100%'
    }}
  >
    {WidgetChild}
  </div>)
  //   type === 'test' ? <TestWidget wid={wid} /> : <EmptyWidget text={fallbackTitle} wid={wid} />
  const closeTooltip = t('common:close')
  const tooltipTitle = t("labels:" + title)
  return (
    <Paper
      key={wid}
      elevation={3}
      //   variant="outlined"
      style={{
        width: '100%',
        height: '100%',
        padding: 8
      }}
    >
      <WidgetBar>
        <Tooltip title={tooltipTitle || fallbackTitle}>
          <span>{tooltipTitle || fallbackTitle}</span>
        </Tooltip>
        {/* <Tooltip title={closeTooltip}>
          <IconButton
            size="small"
            edge="end"
            aria-label="close-widget"
            onClick={() => removeWidget(wid)}
          >
            <Close fontSize="small" />
          </IconButton>
        </Tooltip> */}
      </WidgetBar>
      <WidgetBody>{WidgetChild}</WidgetBody>
    </Paper>
  )
}
