import React from 'react'
import { ResponsiveLine } from '@nivo/line'
import { useTheme } from '@material-ui/core'
import { ChartTooltip } from '../../../common/stats-cards.components'
import LineChartProps from '../../../models/chart/LineChartProps'

const DashedSolidLine = ({ series, lineGenerator, xScale, yScale }) => {
  return series.map(({ id, data, color }, index) => (
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
      strokeDasharray={index > 0 ? 6 : 0}
    />
  ))
}

export const LineChartWidget: React.FC<{ data: LineChartProps }> = (props) => {
  const theme = useTheme()
  const { chartData, xValues, type: chartDataType } = props.data
  // const formatTicks = (v) => {
  //     return v.length > 10 ? (
  //         <tspan>
  //             {v.substring(0, 10) + "..."}
  //             <title>{v}</title>
  //         </tspan>
  //     ) : (
  //         v
  //     );
  // }

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
          orient: 'bottom',
          tickPadding: 5,
          tickRotation: -75,
          tickValues: xValues.length < 40 ? xValues : xValues.filter((_, i) => i % 2 === 0)
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: chartData[0].unitOfMeasure,
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
          'points',
          'mesh',
          'legends',
          DashedSolidLine // add the custome layer here
        ]}
        enablePoints={false}
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
              ? (d.point.data.y as number).toFixed(4) + chartData[0].unitOfMeasure
              : (d.point.data.y as string)
          )
        }}
        legends={[
          {
            anchor: 'top',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: -20,
            itemWidth: 360,
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
