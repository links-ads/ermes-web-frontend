import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@material-ui/core'
import { ResponsiveBar } from '@nivo/bar'
import { Line } from '@nivo/line'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmergencyColorMap } from '../../map/api-data/emergency.component'

export function Activations({ activations }) {
  const [granularity, setGranularity] = useState('day')

  const data = useMemo(() => {
    let data = activations.Active.map((a) => {
      return {
        x: moment(a.timestamp).format('YYYY-MM-DD'),
        y: a.y
      }
    })

    if (granularity === 'week') {
      let weeklyData = {}
      data.forEach((item) => {
        let week = moment(item.x, 'YYYY-MM-DD').startOf('week').format('YYYY-MM-DD')
        if (weeklyData[week]) {
          weeklyData[week] += item.y
        } else {
          weeklyData[week] = item.y
        }
      })

      data = Object.keys(weeklyData).map((key) => {
        return {
          x: key,
          y: weeklyData[key]
        }
      })
    }

    if (granularity === 'month') {
      let monthlyData = {}
      data.forEach((item) => {
        let month = moment(item.x, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD')
        if (monthlyData[month]) {
          monthlyData[month] += item.y
        } else {
          monthlyData[month] = item.y
        }
      })

      data = Object.keys(monthlyData).map((key) => {
        return {
          x: key,
          y: monthlyData[key]
        }
      })
    }

    return [
      {
        id: 'activations',
        data
      }
    ]
  }, [activations, granularity])

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="granularity-label">Granularity</InputLabel>
        <Select
          labelId="granularity-label"
          id="granularity"
          value={granularity}
          onChange={(e) => setGranularity(e.target.value as string)}
        >
          <MenuItem value={'day'}>Day</MenuItem>
          <MenuItem value={'week'}>Week</MenuItem>
          <MenuItem value={'month'}>Month</MenuItem>
        </Select>
      </FormControl>
      <div
        style={{
          margin: 20,
          border: '1px solid #000',
          backgroundColor: 'rgba(0,0,0,.1)',
          height: 350,
          overflowX: 'scroll',
          overflowY: 'hidden'
        }}
      >
        <Line
          key={granularity}
          height={320}
          width={data[0].data.length * 64}
          data={data}
          colors={[EmergencyColorMap.Person]}
          theme={{
            textColor: '#ffffff'
          }}
          margin={{ top: 50, right: 50, bottom: 40, left: 50 }}
          xScale={{
            type: 'time',
            format: '%Y-%m-%d',
            precision: 'day'
          }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto'
          }}
          axisBottom={{
            tickValues: `every 1 ${granularity}`,
            renderTick: (tick: any) => {
              if (granularity === 'month') {
                return (
                  <g transform={`translate(${tick.x}, ${tick.y})`}>
                    <text
                      dominantBaseline="middle"
                      textAnchor="middle"
                      transform="translate(0,15) rotate(0)"
                      style={{ fontFamily: 'sans-serif', fontSize: 13, fill: 'rgb(200, 200, 200)' }}
                    >
                      {moment(tick.value).format('MMM')}
                    </text>
                    <text
                      dominantBaseline="middle"
                      textAnchor="middle"
                      transform="translate(0,30) rotate(0)"
                      style={{ fontFamily: 'sans-serif', fontSize: 11, fill: 'rgb(200, 200, 200)' }}
                    >
                      {moment(tick.value).format('YYYY')}
                    </text>
                  </g>
                )
              }
              if (granularity === 'week') {
                return (
                  <g transform={`translate(${tick.x}, ${tick.y})`}>
                    <text
                      dominantBaseline="middle"
                      textAnchor="middle"
                      transform="translate(0,15) rotate(0)"
                      style={{ fontFamily: 'sans-serif', fontSize: 13, fill: 'rgb(200, 200, 200)' }}
                    >
                      {moment(tick.value).format('ww')}
                    </text>
                    <text
                      dominantBaseline="middle"
                      textAnchor="middle"
                      transform="translate(0,30) rotate(0)"
                      style={{ fontFamily: 'sans-serif', fontSize: 11, fill: 'rgb(200, 200, 200)' }}
                    >
                      {moment(tick.value).format('YYYY')}
                    </text>
                  </g>
                )
              }
              return (
                <g transform={`translate(${tick.x}, ${tick.y})`}>
                  <text
                    dominantBaseline="middle"
                    textAnchor="middle"
                    transform="translate(0,15) rotate(0)"
                    style={{ fontFamily: 'sans-serif', fontSize: 13, fill: 'rgb(200, 200, 200)' }}
                  >
                    {moment(tick.value).format('ddd')}
                  </text>
                  <text
                    dominantBaseline="middle"
                    textAnchor="middle"
                    transform="translate(0,30) rotate(0)"
                    style={{ fontFamily: 'sans-serif', fontSize: 11, fill: 'rgb(200, 200, 200)' }}
                  >
                    {moment(tick.value).format('DD/MM')}
                  </text>
                </g>
              )
            }
          }}
          axisLeft={{
            tickValues: 5
          }}
          axisTop={null}
          axisRight={null}
          layers={['axes', 'lines']}
        />
      </div>
    </div>
  )
}

export function Persons({ persons, activationsByDay }) {
  const { t } = useTranslation()

  const data = useMemo(() => {
    if (!persons) return []

    const total = persons.reduce((acc, curr) => acc + curr.value, 0)
    const data = persons.map((p) => ({
      id: t(`labels:${p.id.toLowerCase()}`),
      value: p.value,
      valueColor: EmergencyColorMap.Person,
      total: total - p.value,
      totalColor: '#fafafa'
    }))

    return data
  }, [persons])

  if (!persons || !activationsByDay) {
    return <CircularProgress color="secondary" />
  }

  if (persons?.length === 0) {
    return <Typography variant="body2">{t('labels:no_data')}</Typography>
  }

  return (
    <div>
      <Typography variant="body2">{t('labels:chart_person_status')}</Typography>
      <div style={{ height: 32 * data.length }}>
        <ResponsiveBar
          data={data}
          keys={['value', 'total']}
          indexBy="id"
          layout="horizontal"
          margin={{ left: 100, right: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          isInteractive={false}
          labelFormat={(d) => {
            return (
              <tspan x={10} fill="#000">
                {d}
              </tspan>
            ) as any
          }}
          theme={{
            textColor: '#ffffff',
            tooltip: {
              basic: {
                color: '#000'
              }
            }
          }}
          colors={(bar) => {
            const id = bar.id

            return bar.data[`${id}Color`]
          }}
          axisTop={null}
          axisRight={null}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]]
          }}
        />
      </div>
      <Activations activations={activationsByDay} />
    </div>
  )
}
