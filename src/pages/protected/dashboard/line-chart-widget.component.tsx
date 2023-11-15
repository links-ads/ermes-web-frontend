import React from 'react'
import { CustomLayerProps, ResponsiveLine } from '@nivo/line'
import { useTheme } from '@material-ui/core'
import { ChartTooltip } from '../../../common/stats-cards.components'
import LineChartProps from '../../../models/chart/LineChartProps'
import { useTranslation } from 'react-i18next'

const DashedSolidLine = ({ series, lineGenerator, xScale, yScale }) => {
  return series.map(({ id, data, color, isAssociatedLayer }, index) => (
    <path
      key={id}
      d={lineGenerator(
        data.map((d) => ({
          x: xScale(d.data.x),
          y: yScale(d.data.y)
        }))
      )}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeDasharray={isAssociatedLayer ? 6 : 0}
    />
  ))
}

const CustomSymbol = ({ size, color, borderWidth, borderColor, x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle r={size / 2} strokeWidth={borderWidth} stroke={borderColor} fill={'transparent'} />
  </g>
)

const CustomPoints = ({ series, points }): CustomLayerProps => {
  const seriesIds = series
    .map((s, index) => (s.isAssociatedLayer ? undefined : s.id))
    .filter((s) => s)
  return points.map((point, index) => {
    if (seriesIds.includes(point.serieId)) {
      return (
        <CustomSymbol
          key={'custom-point-' + index}
          size={6}
          color={point.color}
          borderWidth={2}
          borderColor={point.borderColor}
          x={point.x}
          y={point.y}
        />
      )
    }
  })
}

export const LineChartWidget: React.FC<{ data: LineChartProps }> = (props) => {
  const theme = useTheme()
  const { t } = useTranslation(['social'])
  const { chartData, xValues, type: chartDataType } = props.data
  const unifOfMeasure =
    chartData[0] && chartData[0].unitOfMeasure
      ? chartData[0].unitOfMeasure
      : chartData[1] && chartData[1].unitOfMeasure
      ? chartData[1].unitOfMeasure
      : ''

  return (
    <div style={{ height: 600, marginBottom: '0', width: '1200px' }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 32, right: 32, bottom: 104, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
        yFormat={chartDataType === 'Number' ? '>-6.2f' : undefined}
        theme={{
          textColor: theme['palette']['text']['primary'],
          grid: { line: { stroke: theme['palette']['text']['primary'] } }
        }}
        axisBottom={{
          tickPadding: 5,
          tickRotation: -75,
          tickValues: xValues.length < 40 ? xValues : xValues.filter((_, i) => i % 2 === 0)
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: unifOfMeasure,
          legendOffset: -40,
          legendPosition: 'middle'
        }}
        layers={[
          // includes all default layers
          'grid',
          'markers',
          'axes',
          'areas',
          'crosshair',
          // 'lines',
          'slices',
          // 'points',
          'mesh',
          'legends',
          CustomPoints,
          DashedSolidLine // add the custome layer here
        ]}
        enablePoints={true}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        enableGridX={false}
        useMesh={true}
        tooltip={(d) => {
          return ChartTooltip(
            d.point.serieId as string,
            d.point.serieColor,
            chartDataType === 'Number'
              ? (d.point.data.y as number).toFixed(4) + unifOfMeasure
              : chartDataType === 'Boolean'
              ? (d.point.data.y as number) === 1
                ? (t('social:informative_yes') as string)
                : (t('social:informative_no') as string)
              : (d.point.data.y as string)
          )
        }}
        legends={[
          {
            anchor: 'top',
            direction: 'row',
            justify: false,
            translateX: 20,
            translateY: -20,
            itemWidth: 420,
            itemHeight: 10,
            itemsSpacing: 0,
            symbolSize: 12,
            symbolShape: 'circle',
            itemDirection: 'left-to-right',
            itemTextColor: '#777',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
      />
    </div>
  )
}
