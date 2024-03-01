import React from 'react'
import Grid from '@material-ui/core/Grid'

import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'

import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'

import { ResponsivePie } from '@nivo/pie'

import { makeStyles, Theme, createStyles, useTheme } from '@material-ui/core/styles'

import { useTranslation } from 'react-i18next'

const formatNumber = (value) => {
  if (value > 1000000) return (value / 1000000).toFixed(2) + ' M'
  if (value > 1000) return (value / 1000).toFixed(1) + ' K'
  return value
}

export const VolumeCard = (props) => {
  const useStyles = makeStyles(() =>
    createStyles({
      card_root: {
        marginBottom: '8px',
        padding: '2px'
      },
      volume_count: {
        fontWeight: 700
      }
    })
  )

  const classes = useStyles()
  const { t } = useTranslation(['social'])
  let textToShow = props.isError ? (
    <Typography style={{ margin: 4 }} align="left" variant="caption">
      {t('social:fetch_error')}
    </Typography>
  ) : (
    <Typography style={{ margin: 4 }} align="right" className={classes.volume_count} variant="h5">
      {formatNumber(props.value)}
    </Typography>
  )
  let value = props.isLoading ? (
    <Grid container justifyContent="center">
      <CircularProgress />{' '}
    </Grid>
  ) : (
    textToShow
  )
  return (
    <Paper elevation={6} className={classes.card_root}>
      <Typography style={{ margin: 4 }} align="left" variant="subtitle1">
        {props.label}
      </Typography>
      {value}
    </Paper>
  )
}

export const InformativeCard = (props) => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      card_root: {
        marginBottom: '8px',
        padding: '2px'
      },
      labelText: {
        color: theme['palette']['text']['primary'],
        fontWeight: 700
      },
      bar: {
        height: 10,
        background: 'black'
      }
    })
  )

  const classes = useStyles()
  const { t } = useTranslation(['social'])
  let cardToShow = props.isLoading ? (
    <Grid container justifyContent="center">
      <CircularProgress />{' '}
    </Grid>
  ) : props.isError ? (
    <Typography style={{ margin: 4 }} align="right" variant="caption">
      {t('social:fetch_error')}
    </Typography>
  ) : props.value === null ? (
    <Typography style={{ margin: 4 }} align="right" variant="caption">
      {t('social:no_results')}
    </Typography>
  ) : (
    <div style={{ margin: 4 }}>
      <Grid container direction="row" justifyContent="space-between">
        <Typography className={classes.labelText} align="left" variant="caption" display="inline">
          {t('social:informative_yes').toUpperCase()}
        </Typography>
        <Typography className={classes.labelText} align="right" variant="caption" display="inline">
          {t('social:informative_no').toUpperCase()}
        </Typography>
      </Grid>
      <LinearProgress
        className={classes.bar}
        color="primary"
        variant="determinate"
        value={props.value}
      />
      <Grid container direction="row" justifyContent="space-between">
        <Typography className={classes.labelText} align="left" variant="caption" display="inline">
          {props.value.toFixed(2) + '%'}
        </Typography>
        <Typography className={classes.labelText} align="right" variant="caption" display="inline">
          {(100 - props.value).toFixed(2) + '%'}
        </Typography>
      </Grid>
    </div>
  )
  return (
    <Paper elevation={6} className={classes.card_root}>
      <Typography style={{ margin: 4 }} align="left" variant="subtitle1">
        {props.label}
      </Typography>
      {cardToShow}
    </Paper>
  )
}

export const LanguageCard = (props) => {
  const useStyles = makeStyles(() =>
    createStyles({
      card_root: {
        margin: '0px 8px 8px 0px',
        padding: 1,
        height: '100%'
      },
      language_value: {
        fontWeight: 700
      }
    })
  )

  const classes = useStyles()
  return (
    <Paper elevation={6} className={classes.card_root}>
      <Grid container direction="row" justifyContent="space-between">
        <Typography style={{ margin: 4 }} align="left" variant="body2">
          {props.label}
        </Typography>
        <Typography
          style={{ margin: 4 }}
          className={classes.language_value}
          align="right"
          variant="subtitle2"
        >
          {formatNumber(props.value)}
        </Typography>
      </Grid>
    </Paper>
  )
}

const defs = [
  {
    id: 'dots',
    type: 'patternDots',
    background: 'inherit',
    color: 'rgba(255, 255, 255, 0.3)',
    size: 4,
    padding: 1,
    stagger: true
  },
  {
    id: 'lines',
    type: 'patternLines',
    background: 'inherit',
    color: 'rgba(255, 255, 255, 0.3)',
    rotation: -45,
    lineWidth: 6,
    spacing: 10
  }
]

export const parseStats = (stats, mapping: any | undefined = undefined): {} => {
  if (!stats) return {}
  if (Object.entries(stats).length === 0) return {}
  if (mapping && Object.entries(mapping).length === 0) return {}
  if (mapping)
    return Object.entries(stats).map((tuple) => {
      return { id: tuple[0], label: mapping[parseInt(tuple[0])], value: tuple[1] }
    })
  else
    return Object.entries(stats).map((tuple) => {
      return { id: tuple[0], label: tuple[0], value: tuple[1] }
    })
}

export const ChartTooltip = (label: string, colour: string, value: string | number) => {
  return (
    <Paper elevation={2} style={{ padding: 5 }}>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <div
          style={{
            backgroundColor: colour,
            margin: 5,
            width: 20
          }}
        >
          &nbsp;
        </div>
        <Grid item>
          <Typography variant="subtitle2" display="inline">
            {label}:{' '}
          </Typography>
          <Typography variant="subtitle2" display="inline" style={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}

export const PieChartStats = (props) => {
  const { t } = useTranslation(['labels'])
  const theme = useTheme()
  return (
    <ResponsivePie
      data={props.data}
      margin={{ top: 30, right: 20, bottom: 30, left: 20 }}
      innerRadius={0.5}
      padAngle={5}
      cornerRadius={3}
      borderWidth={1}
      startAngle={35}
      endAngle={-360}
      colors={{ scheme: 'nivo' }}
      // radialLabelsSkipAngle={0}
      // radialLabelsTextXOffset={1}
      // radialLabelsLinkOffset={0}
      // radialLabelsLinkDiagonalLength={8}
      // radialLabelsLinkHorizontalLength={12}
      // radialLabelsLinkStrokeWidth={1}
      // radialLabel={
      //   function (d) {
      //     return t(props.prefix + d.label.toLowerCase())
      //   } as unknown as undefined
      // }
      // radialLabelsTextColor={theme['palette']['text']['primary']}
      // radialLabelsLinkColor={theme['palette']['text']['primary']}
      theme={{ textColor: 'inherit' }}
      tooltip={(d) => {
        let item = d.datum
        return ChartTooltip(
          t(props.prefix + (item.label as string).toLowerCase()),
          item.color,
          item.value
        )
      }}
      enableSliceLabels={false}
      defs={defs}
      legends={[
        {
          anchor: 'left',
          direction: 'column',
          translateY: 0,
          itemTextColor: 'red',
          translateX: -210,
          itemWidth: 10,
          itemHeight: 18,
          symbolSize: 18,
          justify: false,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemTextColor: '#000'
              }
            }
          ]
        }
      ]}
    />
  )
}
