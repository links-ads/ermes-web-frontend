import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Card, makeStyles, AppBar, Typography, IconButton, CardContent, useTheme, Box, Toolbar, CircularProgress, Grid } from '@material-ui/core'
import FloatingCardContainer from '../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import { LineChartWidget } from '../dashboard/line-chart-widge.component'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import LineChartProps, { LineChartData, PointChartData } from '../../../models/chart/LineChartProps'
import { geojsonToWKT } from "@terraformer/wkt"
import { AppConfig, AppConfigContext } from '../../../config'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
    titleContainer: {
        width: '90%',
        paddingTop: 11,
        paddingBottom: 11,
    },
    titleTooltip: {
        width: '10%',
        paddingTop: 11,
        paddingBottom: 11,

    }
}))

export default function MapTimeSeries(props) {
    const theme = useTheme()

    const [dim, setDim] = useState({
        width: 500,
        height: 620
    })
    const onResize = (event, data) => {
        setDim({ height: data.size.height, width: data.size.width })
    }
    const { dblClickFeatures, setDblClickFeatures, selectedFilters, layerSelection, allLayers } = props
    const { showCard, coord } = dblClickFeatures

    const [ lineChartData, setLineChartData] = useState(new LineChartProps([]))
    const [ isLoading, setIsLoading ] = useState(true)

    const { t } = useTranslation(['social'])

    const appConfig = useContext<AppConfig>(AppConfigContext)

    // layer API
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])

    // map to LineChartData
    const mapToLineChartData = useCallback((timeseries, layerName) => {
      const dateOptions = {
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: false
      } as Intl.DateTimeFormatOptions
      const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

      let layerTimeseries = new LineChartData(
        layerName,
        timeseries.map(
          (series) =>
            new PointChartData(
              formatter.format(new Date((series as any).dateTime)),
              parseFloat((series as any).value)
            )
        )
      )
      return layerTimeseries
    }, [])

    // layer timeseries
    const getLayerTimeseriesHandler = useCallback(
      async (point, startDate, endDate) => {
        try {
          const selectedLayerId = layerSelection.dataTypeId
          const layerId = Number(selectedLayerId)
          const { layers, associatedLayers, groupedLayers } = allLayers
          const selectedLayer = layers.find((layer) => layer.id === layerId)
          const geojsonPoint = {
            type: 'Point',
            coordinates: point
          }
          const pointWKT = geojsonToWKT(geojsonPoint)
          const parentLayerResult = await layersApiFactory.layersGetTimeSeries(
            selectedLayerId,
            pointWKT,
            appConfig.crs,
            undefined,
            undefined,
            startDate,
            endDate
          )
          const parentTimeseries = parentLayerResult.data.variables
            ? parentLayerResult.data.variables.length > 0
              ? parentLayerResult.data.variables[0].values
              : []
            : []

          let chartData: LineChartData[] = []
          if (parentTimeseries && parentTimeseries.length > 0) {
            const layerTimeseries = mapToLineChartData(parentTimeseries, selectedLayer.name)
            chartData.push(layerTimeseries)
          }

          // associated layers
          const parentLayer = groupedLayers.find((layer) => layer.id === layerId)
          if (parentLayer && parentLayer.children) {
            for (let layer of parentLayer.children) {
              const childLayerResult = await layersApiFactory.layersGetTimeSeries(
                layer.id,
                pointWKT,
                appConfig.crs,
                undefined,
                undefined,
                startDate,
                endDate
              )
              const childTimeseries = childLayerResult.data.variables
                ? childLayerResult.data.variables.length > 0
                  ? childLayerResult.data.variables[0].values
                  : []
                : []
              if (childTimeseries && childTimeseries.length > 0) {
                const layerTimeseries = mapToLineChartData(childTimeseries, layer.name)
                chartData.push(layerTimeseries)
              }
            }
          }

          const lineChart = new LineChartProps(chartData)

          return lineChart
        } catch (error) {
          console.error(error)
        }
      },
      [layerSelection]
    )

    useEffect( () => {
        const timeRange = [
            selectedFilters.datestart.selected,
            selectedFilters.dateend.selected
          ]
        getLayerTimeseriesHandler(coord, timeRange[0], timeRange[1]).then( lineChart => {
            setLineChartData(lineChart as LineChartProps)
            setIsLoading(false)
        })
        
    }, [])

    const loader = <Grid container justifyContent="center"><CircularProgress color="secondary" disableShrink /></Grid>
    const noData = <Grid container justifyContent="center"><Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography></Grid>

    return (
      <>
        <FloatingCardContainer
          bounds={'parent'}
          defaultPosition={props.defaultPosition}
          position={props.position}
          onPositionChange={props.onPositionChange}
          toggleActiveFilterTab={showCard}
          dim={dim}
          onResize={onResize}
          resizable={true}
          style={{ minHeight:'600px', paddingBottom:'0px' }}
        >
          <Card style={{ height: dim.height, minHeight: dim.height, paddingBottom: '0px' }}>
            <AppBar
              position="static"
              color="default"
              style={{
                backgroundColor: theme.palette.primary.dark,
                boxShadow: 'none',
                display: 'block'
              }}
              className="handle handleResize"
            >
              <Toolbar>
                <Box sx={{ flexGrow: 9 }}>
                                <Typography variant='h4'>
                                    {props.layerName}
                                </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <IconButton
                    onClick={() => {
                                        setDblClickFeatures(null)
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Toolbar>
            </AppBar>
            <CardContent style={{ height: '90%', overflowX: 'scroll', paddingBottom: '0px' }}>
              {!isLoading ? (
                lineChartData && lineChartData.chartData && lineChartData.chartData.length > 0 ? (
                  <LineChartWidget data={lineChartData} />
                ) : noData
              ) : loader}
            </CardContent>
          </Card>
        </FloatingCardContainer>
      </>
    )
}