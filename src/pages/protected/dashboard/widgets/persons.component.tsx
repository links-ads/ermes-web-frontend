import React, { useMemo } from 'react'
import { CircularProgress, Typography } from '@material-ui/core'
import { ResponsiveBar } from '@nivo/bar'
import { EmergencyColorMap } from '../../map/api-data/emergency.component'
import { useTranslation } from 'react-i18next'
import { ResponsiveLine, Line } from '@nivo/line'
import moment from 'moment'
import { ChartTooltip } from '../../../../common/stats-cards.components'

export function Activations({ activations }) {
  const data = useMemo(() => {
    return [
      {
        id: 'activations',
        data: activations.Active.map((a) => {
          return {
            x: moment(a.timestamp).format('YYYY-MM-DD'),
            y: a.y
          }
        })
      }
    ]
  }, [activations])

  return (
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
        height={320}
        width={activations.Active.length * 100}
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
          tickValues: 'every 1 day',
          renderTick: (tick: any) => {
            if (tick.tickIndex == 1000) {
              console.log(tick)
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
