import React, { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@material-ui/core';
import { ChartTooltip } from '../common/stats-cards.components';

export const LineChartWidget = (
    props
) => {
    const { t, i18n } = useTranslation(['labels', 'tables'])
    console.log("DATA", props.data)

    const theme = useTheme()

    const chartData = useMemo(() => {

        const newData = [] as any[]
        Object.entries(props.data).forEach(entry => {
            newData.push({
                id: entry[0],
                data: entry[1]
            })
        })
        return newData
    }
        , [props.data])
    return (
        <div
            style={{ height: '95%' }}
        >
            <ResponsiveLine
                data={chartData}
                margin={{ top: 50, right: 110, bottom: 60, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                yFormat=" >-.2f"
                theme={{ textColor: theme['palette']['text']['primary'], grid: { line: { stroke: theme['palette']['text']['primary'] } } }}
                axisBottom={{
                    orient: 'bottom',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    // legend: 'Activations',
                    // legendOffset: 36,
                    // legendPosition: 'middle'
                }}
                // axisLeft={{
                //     orient: 'left',
                //     tickSize: 5,
                //     tickPadding: 5,
                //     tickRotation: 0,
                //     legend: 'count',
                //     legendOffset: -40,
                //     legendPosition: 'middle'
                // }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                enableGridX={false}
                // pointLabelYOffset={-12}
                useMesh={true}
                tooltip={d=>{
                    console.log(d)
                    return ChartTooltip(
                        // t(props.prefix + (item.label as string).toLowerCase()),
                        "Activations",
                        d.point.serieColor,
                        d.point.data.y as number)
                }}
            />
        </div>
    )
}