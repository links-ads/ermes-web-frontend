export class PointChartData {
  x: any
  y: number
  constructor(x: any, y: number) {
    this.x = x
    this.y = y
  }
}

export class LineChartData {
  id: string
  data: PointChartData[]
  constructor(id: string, data: PointChartData[]) {
    this.id = id
    this.data = data
  }
}

class LineChartProps {
  chartData: LineChartData[]
  xValues: any[]
  constructor(chartData: LineChartData[]) {
    this.chartData = chartData
    let xValues: any[] = []
    chartData.forEach((chart) => {
      let chartXValues: any[] = []
      chartXValues = chart.data.map((point) => point.x)
      xValues = xValues.concat(chartXValues)
    })
    this.xValues = [...new Set(xValues)]
  }
}

export default LineChartProps
