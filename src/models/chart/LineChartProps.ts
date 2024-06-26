export class PointChartData {
  x: any
  y: number | string
  constructor(x: any, y: number | string) {
    this.x = x
    this.y = y
  }
}

export class LineChartData {
  id: string
  isAssociatedLayer: boolean
  unitOfMeasure: string
  data: PointChartData[]
  constructor(id: string, data: PointChartData[], isAssociatedLayer?: boolean, unitOfMeasure?: string) {
    this.id = id
    this.isAssociatedLayer = isAssociatedLayer ?? false
    this.unitOfMeasure = unitOfMeasure ?? ''
    this.data = data
  }
}

class LineChartProps {
  name: string
  type: string
  chartData: LineChartData[]
  xValues: any[]
  constructor(chartData: LineChartData[], name?: string, type?: string) {
    this.name = name ? name : ''
    this.type = type ? type : ''
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
