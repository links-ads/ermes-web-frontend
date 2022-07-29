import React, { useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line'
import { useTheme } from '@material-ui/core';
import { ChartTooltip } from '../../../common/stats-cards.components';

export const LineChartWidget = (
    props
) => {
    const theme = useTheme()

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

    const xValues = useMemo(() => {
        let values = [] as number[]
        Object.entries(props.data).forEach(entry => {
            const newArr = (entry[1] as any[]).map(o => o.x)
            values = values.concat(newArr)
        })
        return [...new Set(values)]
    }, [props.data])

    return (
        <div
            style={{ height: '95%', marginBottom:'0', width:"1200px" }}
        >
            <ResponsiveLine
                data={chartData}
                margin={{ top: 32, right: 32, bottom: 104, left: 60 }}
                xScale={{ type: 'point' }}
                
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                yFormat=">-6.2f"
                theme={
                    {
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
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                enableGridX={false}
                useMesh={true}
                tooltip={d => {
                    return (
                        ChartTooltip(
                            d.point.serieId as string,
                            d.point.serieColor,
                            (d.point.data.y as number).toFixed(4))
                            )
                        }}
            />
        </div>
    )
}