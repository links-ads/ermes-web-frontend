import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Badge,
  createStyles,
  Chip,
  useTheme,
  useMediaQuery,
  Button,
  Switch,
  FormGroup,
  FormControlLabel
} from '@material-ui/core'
import { MeasureDto, SensorDto, StationDto, StationsApiFactory } from 'ermes-backoffice-ts-sdk'
import useCameras from '../../../../hooks/use-cameras.hook'
import React, { CSSProperties, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../../state/app.state'
import { clearSelectedCamera } from '../../../../state/selected-camera.state'
import classes from './drawer-cards/communication-card.module.scss'

type CameraDetailsProps = {}

export function CameraDetails({}: CameraDetailsProps) {
  const { t } = useTranslation(['common', 'maps'])
  const elem = useSelector((state: AppState) => state.selectedCameraState)
  const hasMeasurements = elem?.sensors?.some((sensor) => sensor.measurements?.length)
  const [selectedSensorId, setSelectedSensorId] = useState<string | undefined>()
  const [sensorData, setSensorData] = useState<any>(null)
  const [, , , fetchCameraSensors] = useCameras()
  const [selectedSensorMeasurementId, setSelectedSensorMeasurement] = useState<any>(null)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [hideMeasurementsWithoutDetections, setHideMeasurementsWithoutDetections] = useState(false)

  function handleClose() {
    setSelectedSensorId(undefined)
    setSensorData(null)
    setSelectedSensorMeasurement(null)

    dispatch(clearSelectedCamera())
  }

  const filteredMeasurements = useMemo(() => {
    if (!sensorData) {
      return []
    }

    return sensorData.filter((measurement: MeasureDto) => {
      if (!hideMeasurementsWithoutDetections) {
        return true
      }

      return measurement.metadata?.detection?.fire || measurement.metadata?.detection?.smoke
    })
  }, [sensorData, hideMeasurementsWithoutDetections])

  useEffect(() => {
    if (!elem) {
      return
    }

    if (!selectedSensorId) {
      setSensorData(null)
      return
    }

    setSensorData(null)
    setSelectedSensorMeasurement(null)

    setLoading(true)
    fetchCameraSensors(elem.id, selectedSensorId)
      .then((data) => {
        setSensorData(data)
        if (data.length) {
          setSelectedSensorMeasurement(data[0]?.id)
        } else {
          setSelectedSensorMeasurement(null)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [elem, selectedSensorId])

  return (
    <Dialog open={!!elem} onClose={handleClose} fullScreen={fullScreen} fullWidth maxWidth="lg">
      <DialogTitle>
        <div style={localStyles.titleBar}>
          <div>
            <div>
              {elem?.name} {t('common:details')}
            </div>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={hideMeasurementsWithoutDetections}
                    onChange={(e) => setHideMeasurementsWithoutDetections(e.target.checked)}
                  />
                }
                label={t('maps:Hide measures without detections')}
              />
            </FormGroup>
          </div>
          <Button onClick={handleClose} variant="contained" color="primary">
            {t('common:close')}
          </Button>
        </div>
      </DialogTitle>
      <DialogTitle>
        {hasMeasurements && (
          <Tabs
            variant="scrollable"
            value={selectedSensorId ?? -1}
            onChange={(_, v) => setSelectedSensorId(v)}
          >
            {elem?.sensors?.map((sensor) => {
              const firstMeasurement = sensor.measurements?.[0]
              if (!firstMeasurement) return null

              const hasFire = sensor.measurements?.some((m) => m.metadata?.detection?.fire)
              const hasSmoke = sensor.measurements?.some((m) => m.metadata?.detection?.smoke)

              return (
                <Tab
                  key={sensor.id as any}
                  value={sensor.id}
                  label={
                    <div>
                      <div style={localStyles.badgeContainer}>
                        {hasFire && (
                          <Chip
                            color="primary"
                            size="small"
                            style={{
                              backgroundColor: theme.palette.error.dark,
                              borderColor: theme.palette.error.dark,
                              color: theme.palette.error.contrastText
                            }}
                            className={classes.chipStyle}
                            label={t('maps:fire')}
                          />
                        )}
                        {hasSmoke && (
                          <Chip
                            color="primary"
                            size="small"
                            style={{
                              backgroundColor: theme.palette.primary.contrastText,
                              borderColor: theme.palette.primary.dark,
                              color: theme.palette.primary.dark
                            }}
                            className={classes.chipStyle}
                            label={t('maps:smoke')}
                          />
                        )}
                      </div>
                      <img
                        style={{ width: 300, height: 150, objectFit: 'cover' }}
                        src={firstMeasurement.measure!}
                        alt={firstMeasurement.measure!}
                      />
                    </div>
                  }
                />
              )
            })}
          </Tabs>
        )}
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Grid container alignItems="center" justifyContent="center" style={{ height: 320 }}>
            <Grid item>
              <CircularProgress color="secondary" size={80} />
            </Grid>
          </Grid>
        )}
        {!hasMeasurements && (
          <Typography variant="body2" component="h2" gutterBottom>
            {t('maps:noMeasurements')}
          </Typography>
        )}
        {hasMeasurements && !sensorData && !loading && (
          <Typography variant="body2" component="h2" gutterBottom>
            {t('maps:pleaseSelectSensor')}
          </Typography>
        )}
        {selectedSensorMeasurementId && (
          <img
            style={{
              width: '100%',
              height: 500,
              objectFit: 'contain',
              marginTop: 16,
              marginBottom: 16
            }}
            src={sensorData?.find((s) => s.id === selectedSensorMeasurementId)?.measure}
            alt={sensorData?.find((s) => s.id === selectedSensorMeasurementId)?.measure}
          />
        )}
        {sensorData && (
          <Tabs
            variant="scrollable"
            value={selectedSensorMeasurementId}
            onChange={(_, v) => setSelectedSensorMeasurement(v)}
          >
            {filteredMeasurements.map((measurement) => {
              const hasFire = measurement.metadata?.detection?.fire
              const hasSmoke = measurement.metadata?.detection?.smoke

              return (
                <Tab
                  key={measurement.id as any}
                  value={measurement.id}
                  label={
                    <div>
                      <div style={localStyles.smallBadgeContainer}>
                        {hasFire && (
                          <Chip
                            color="primary"
                            size="small"
                            style={{
                              backgroundColor: theme.palette.error.dark,
                              borderColor: theme.palette.error.dark,
                              color: theme.palette.error.contrastText,
                              width: 16,
                              height: 16
                            }}
                            className={classes.chipStyle}
                          />
                        )}
                        {hasSmoke && (
                          <Chip
                            color="primary"
                            size="small"
                            style={{
                              backgroundColor: theme.palette.primary.contrastText,
                              borderColor: theme.palette.primary.dark,
                              color: theme.palette.primary.dark,
                              width: 16,
                              height: 16
                            }}
                            className={classes.chipStyle}
                          />
                        )}
                      </div>
                      <img
                        style={{ width: 100, height: 75, objectFit: 'cover' }}
                        src={measurement.measure!}
                        alt={measurement.measure!}
                      />
                    </div>
                  }
                />
              )
            })}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

const localStyles: Record<string, CSSProperties> = {
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tabContainer: {
    position: 'relative'
  },
  badgeContainer: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    top: 10,
    left: 0,
    right: 4
  },
  smallBadgeContainer: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    bottom: 10,
    left: 0,
    right: 36
  }
}
