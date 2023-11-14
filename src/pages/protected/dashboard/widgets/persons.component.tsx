import React, { useMemo } from 'react'
import { CircularProgress, Typography } from '@material-ui/core'
import { ResponsiveBar } from '@nivo/bar'
import { EmergencyColorMap } from '../../map/api-data/emergency.component'
import { useTranslation } from 'react-i18next'

export function Persons({ persons, activationsByDay }) {
  const data = useMemo(() => {
    if (!persons) return []

    const total = persons.reduce((acc, curr) => acc + curr.value, 0)
    const data = persons.map((p) => ({
      id: p.id,
      value: p.value,
      valueColor: EmergencyColorMap.Person,
      total: total - p.value,
      totalColor: '#fafafa'
    }))

    return data
  }, [persons])

  const { t } = useTranslation()

  if (!persons || !activationsByDay) {
    return <CircularProgress color="secondary" />
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
          labelFormat={(d) =>
            (
              <tspan x={10} fill="#000">
                {d}
              </tspan>
            ) as any
          }
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
    </div>
  )
}
