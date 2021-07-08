import React, { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@material-ui/core';
import { ChartTooltip } from '../common/stats-cards.components';

export const LineChartWidget = (
    props
) => {
    const { t, i18n } = useTranslation(['labels', 'tables'])
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
    }, [props.data])

    const chartNumbers = useMemo(()=>{
        let values = [] as number[] 
        Object.entries(props.data).forEach(entry=>{
            const newArr = (entry[1] as any[]).map(o=>o.y)
            values = values.concat(newArr)
        })
        let maxValue = [...new Set(values)].reduce(function(a, b) { return Math. max(a, b); });
        values = [...Array(maxValue+1).keys()]
        return values
    },[props.data])

    return (
        <div
            style={{ height: '95%' }}
        >
            <ResponsiveLine
                data={chartData}
                margin={{ top: 50, right: 110, bottom: 60, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                yFormat=" >-#.0d"
                gridYValues={chartNumbers}
                // gridYValues={listToMax(chartNumbers)}
                // gridYValues={[0,1,4]}
                theme={
                    { 
                        textColor: theme['palette']['text']['primary'],
                        grid: { line: { stroke: theme['palette']['text']['primary'] } } 
                    }}
                axisBottom={{
                    orient: 'bottom',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45
                }}
                axisLeft={{
                    orient: 'left',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    tickValues:chartNumbers
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                enableGridX={false}
                useMesh={true}
                tooltip={d=>{
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