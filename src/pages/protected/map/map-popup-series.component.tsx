import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  Card,
  AppBar,
  Typography,
  IconButton,
  CardContent,
  useTheme,
  Box,
  Toolbar,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  makeStyles,
  Theme
} from '@material-ui/core'
import FloatingCardContainer from '../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import { LineChartWidget } from '../dashboard/line-chart-widge.component'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import LineChartProps, { LineChartData, PointChartData } from '../../../models/chart/LineChartProps'
import { geojsonToWKT } from '@terraformer/wkt'
import { AppConfig, AppConfigContext } from '../../../config'
import { useTranslation } from 'react-i18next'
import SwipeableViews from 'react-swipeable-views'

interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: any
  value: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
      style={{ height: 605 }}
    >
      {<div style={{ padding: 0, minHeight: 600 }}>{children}</div>}
    </div>
  )
}

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1
  }
}))

export default function MapTimeSeries(props) {
  const theme = useTheme()
  const classes = useStyles()

  const [dim, setDim] = useState({
    width: 500,
    height: 736
  })
  const onResize = (event, data) => {
    setDim({ height: data.size.height, width: data.size.width })
  }
  const { layerTimeseries, closeLayerTimeseries, selectedFilters } = props
  const { showCard, coord, selectedLayer } = layerTimeseries

  const [lineChartData, setLineChartData] = useState<LineChartProps[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [value, setValue] = React.useState(0)

  const { t } = useTranslation(['social'])

  const appConfig = useContext<AppConfig>(AppConfigContext)

  // layer API
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }

  const handleChangeIndex = (index: number) => {
    setValue(index)
  }

  const compareDates = (a, b) => {
    let date1 = new Date(a.dateTime).getTime()
    let date2 = new Date(b.dateTime).getTime()

    if (date1 < date2) {
      return -1
    } else if (date1 > date2) {
      return 1
    } else {
      console.log(`Both dates are equal`)
      return 0
    }
  }

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
      timeseries
        .sort(compareDates)
        .map(
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
  const getLayerTimeseriesHandler = async (point, startDate, endDate) => {
    setIsLoading(true)
    try {
      let lineChartTabs: LineChartProps[] = []
      const geojsonPoint = {
        type: 'Point',
        coordinates: point
      }
      const pointWKT = geojsonToWKT(geojsonPoint)
      let layerPromises: any[] = []

      const parentLayerPromise = layersApiFactory.layersGetTimeSeries(
        selectedLayer.dataTypeId,
        pointWKT,
        appConfig.crs,
        undefined,
        undefined,
        startDate,
        endDate
      )
      layerPromises.push(parentLayerPromise)

      // associated layers
      if (selectedLayer.associatedLayers && selectedLayer.associatedLayers.length > 0) {
        for (let associatedLayer of selectedLayer.associatedLayers) {
          const childLayerPromise = layersApiFactory.layersGetTimeSeries(
            associatedLayer.dataTypeId,
            pointWKT,
            appConfig.crs,
            undefined,
            undefined,
            startDate,
            endDate
          )
          layerPromises.push(childLayerPromise)
        }
      }

      const promisesResult = await Promise.all(layerPromises)
      let variableName = ''
      let chartDataVar = {}

      for (let i = 0; i < promisesResult.length; i++) {
        const result = promisesResult[i]
        if (result.status === 200) {
          const layerName =
            i === 0 ? selectedLayer.name : selectedLayer.associatedLayers[i - 1].name

          if (result.data && result.data.variables) {
            for (let j = 0; j < result.data.variables.length; j++) {
              const timeseries = result.data.variables[j].values ?? []
              variableName = result.data.variables[j].var_name ?? ''

              if (timeseries && timeseries.length > 0) {
                let layerTimeseries = mapToLineChartData(timeseries, layerName)
                let currentChartData: LineChartData[] = chartDataVar[variableName] ?? []
                currentChartData.push(layerTimeseries)
                chartDataVar[variableName] = currentChartData
              }
            }
          }
        }
      }

      Object.keys(chartDataVar).forEach((key) => {
        let lineChart = new LineChartProps(chartDataVar[key], key)
        lineChartTabs.push(lineChart)
      })

      setIsLoading(false)
      return lineChartTabs
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const timeRange = [selectedFilters.datestart.selected, selectedFilters.dateend.selected]
    getLayerTimeseriesHandler(coord, timeRange[0], timeRange[1]).then((lineChart) => {
      setLineChartData(lineChart as LineChartProps[])
    })
  }, [coord, selectedLayer])

  const loader = (
    <Grid container justifyContent="center">
      <CircularProgress color="secondary" disableShrink />
    </Grid>
  )
  const noData = (
    <Grid container justifyContent="center">
      <Typography style={{ margin: 15 }} align="center" variant="caption">
        {t('social:no_results')}
      </Typography>
    </Grid>
  )

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
        style={{ minHeight: '736px', paddingBottom: '0px' }}
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
                <Typography variant="h4">{selectedLayer.name}</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <IconButton onClick={closeLayerTimeseries}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          <CardContent style={{ height: '100%', overflowX: 'scroll', padding: '0px' }}>
            {!isLoading ? (
              lineChartData &&
              lineChartData.length > 0 &&
              lineChartData.filter((e) => e.chartData.length > 0).length > 0 ? (
                <div className={classes.root}>
                  <AppBar position="static" color="default">
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      indicatorColor="primary"
                      color="white"
                      variant="fullWidth"
                      aria-label="full width tabs example"
                    >
                      {lineChartData &&
                        lineChartData.length > 0 &&
                        lineChartData.map((datum, index) => (
                          <Tab
                            key={'tab-timeseries-' + index}
                            label={datum.name}
                            {...a11yProps(index)}
                          />
                        ))}
                    </Tabs>
                  </AppBar>
                  <SwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={value}
                    onChangeIndex={handleChangeIndex}
                    component={'div'}
                  >
                    {lineChartData &&
                      lineChartData.length > 0 &&
                      lineChartData.map((datum, index) => (
                        <TabPanel
                          key={'timeseries-tabpanel-' + index}
                          value={value}
                          index={index}
                          dir={theme.direction}
                        >
                          {datum.chartData && datum.chartData.length > 0 ? (
                            <LineChartWidget data={datum} />
                          ) : (
                            noData
                          )}
                        </TabPanel>
                      ))}
                  </SwipeableViews>
                </div>
              ) : (
                noData
              )
            ) : (
              loader
            )}
          </CardContent>
        </Card>
      </FloatingCardContainer>
    </>
  )
}