import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Switch,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core'
import {
  AddCircle,
  ArrowLeft,
  ArrowRight,
  Cancel,
  Check,
  CheckCircle,
  Close,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  RemoveCircle
} from '@material-ui/icons'
import { MeasureDto, StationsApiFactory } from 'ermes-backoffice-ts-sdk'
import moment from 'moment'
import { useSnackbar } from 'notistack'
import React, { CSSProperties, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useAPIConfiguration } from '../../../../hooks/api-hooks'
import useCameras from '../../../../hooks/use-cameras.hook'
import { AppState } from '../../../../state/app.state'
import { clearSelectedCamera } from '../../../../state/selected-camera.state'
import classes from './drawer-cards/communication-card.module.scss'

function getCardinalDirection(angle) {
  const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW']
  return directions[Math.round(angle / 45) % 8]
}

type CameraDetailsProps = {}

const PAGE_SIZE = 6

enum ValidationStatus {
  Unknown,
  Detected,
  DetectedAndValidated,
  DetectedAndDiscarded,
  Undetected,
  UndetectedAndAdded
}

function getValidationStatus(type, metadata) {
  const validationValue = metadata?.validation?.[type]
  const isValidationPresent = typeof metadata?.validation?.[type] === 'boolean'

  const detectionValue = metadata?.detection?.[type]
  const isDetectionPresent = typeof metadata?.detection?.[type] === 'boolean'

  console.log({
    validationValue,
    isValidationPresent,

    detectionValue,
    isDetectionPresent
  })

  if (isDetectionPresent) {
    if (isValidationPresent) {
      if (detectionValue === true && validationValue === true) {
        return ValidationStatus.DetectedAndValidated
      }

      if (detectionValue === true && validationValue === false) {
        return ValidationStatus.DetectedAndDiscarded
      }

      if (detectionValue === false && validationValue === true) {
        return ValidationStatus.UndetectedAndAdded
      }

      if (detectionValue === false && validationValue === false) {
        return ValidationStatus.Undetected
      }
    } else {
      if (detectionValue === true) {
        return ValidationStatus.Detected
      }

      if (detectionValue === false) {
        return ValidationStatus.Undetected
      }
    }
  } else {
    if (isValidationPresent) {
      if (validationValue === true) {
        return ValidationStatus.UndetectedAndAdded
      }

      if (validationValue === false || validationValue === null) {
        return ValidationStatus.Undetected
      }
    }
  }

  return ValidationStatus.Unknown
}

function ValidationButton({ show, baseColor, onClick, metadata, type, value = null }: any) {
  const theme = useTheme()

  const { t } = useTranslation(['common', 'maps'])

  if (!show) {
    return null
  }

  const validationStatus = getValidationStatus(type, metadata)
  const _value =
    validationStatus === ValidationStatus.Undetected
      ? true
      : validationStatus === ValidationStatus.UndetectedAndAdded
      ? null
      : value

  return (
    <Button
      variant="contained"
      style={{
        backgroundColor:
          (validationStatus === ValidationStatus.DetectedAndValidated && value) ||
          (validationStatus === ValidationStatus.DetectedAndDiscarded && !value) ||
          validationStatus === ValidationStatus.UndetectedAndAdded
            ? '#005500'
            : baseColor,
        color: theme.palette.primary.contrastText
      }}
      onClick={() => onClick(type, _value)}
    >
      {validationStatus === ValidationStatus.DetectedAndValidated && value && (
        <>
          <CheckCircle /> {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === ValidationStatus.DetectedAndDiscarded && value === false && (
        <>
          <Cancel /> {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === ValidationStatus.UndetectedAndAdded && (
        <>
          <RemoveCircle /> {t(`maps:remove`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === ValidationStatus.Undetected && (
        <>
          <AddCircle /> {t(`maps:add`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === ValidationStatus.Detected && value && (
        <>
          <Check /> {t(`maps:confirm`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === ValidationStatus.DetectedAndDiscarded && value && (
        <>
          <Check /> {t(`maps:confirm`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === ValidationStatus.Detected && value === false && (
        <>
          <Close /> {t(`maps:discard`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === ValidationStatus.DetectedAndValidated && value === false && (
        <>
          <Close /> {t(`maps:discard`)} {t(`maps:${type}`)}
        </>
      )}
    </Button>
  )
}

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
  const [hideMeasurementsWithoutDetections, setHideMeasurementsWithoutDetections] = useState(true)
  const [page, setPage] = useState(0)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const { enqueueSnackbar } = useSnackbar()

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

  const pageItems = useMemo(() => {
    return filteredMeasurements.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  }, [filteredMeasurements, page])

  useEffect(() => {
    if (selectedSensorMeasurementId === null) {
      setSelectedSensorMeasurement(filteredMeasurements[0]?.id ?? null)
      setPage(0)

      return
    }

    const index = filteredMeasurements.findIndex((m) => m.id === selectedSensorMeasurementId)
    if (index === -1) {
      setSelectedSensorMeasurement(filteredMeasurements[0]?.id ?? null)
      setPage(0)

      return
    }

    const newPage = Math.floor(
      filteredMeasurements.findIndex((m) => m.id === selectedSensorMeasurementId) / PAGE_SIZE
    )

    setPage(newPage)
  }, [filteredMeasurements, selectedSensorMeasurementId])

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

  const selectedSensorMeasurement = sensorData?.find((s) => s.id === selectedSensorMeasurementId)
  console.log(selectedSensorMeasurement)

  async function handlePerformValidation(type, value) {
    const currentMetadata = selectedSensorMeasurement?.metadata
    if (!currentMetadata) {
      return false
    }

    const { validation, ...rest } = currentMetadata

    try {
      const response = await StationsApiFactory(backendAPIConfig).stationsValidateMeasure({
        measureId: selectedSensorMeasurementId,
        smoke: type === 'smoke' ? value : validation?.smoke ?? null,
        fire: type === 'fire' ? value : validation?.fire ?? null,
        metadata: rest
      })

      // replace the measure in sensorData
      setSensorData((prev) => {
        if (!prev) {
          return prev
        }

        return prev.map((m) => {
          if (m.id === selectedSensorMeasurementId) {
            return response.data.measure
          }

          return m
        })
      })

      enqueueSnackbar(t('common:validationSuccess'), {
        variant: 'success'
      })
    } catch (error) {
      enqueueSnackbar(t('common:validationError'), {
        variant: 'error'
      })
    }
  }

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
        {hasMeasurements && !sensorData && !loading && (
          <Typography variant="body2" component="h2" gutterBottom>
            {t('maps:pleaseSelectSensor')}
          </Typography>
        )}
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
              const thumbnail = firstMeasurement.measure
              const description = sensor.description

              return (
                <Tab
                  key={sensor.id as any}
                  value={sensor.id}
                  className={classes.cameraDetailsTab}
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
                        style={{ width: 200, height: 100, objectFit: 'cover' }}
                        src={thumbnail!}
                        alt={firstMeasurement.measure!}
                      />
                      {description && (
                        <Typography variant="body2" gutterBottom>
                          {description} {t('maps:degrees')} ({getCardinalDirection(description)})
                        </Typography>
                      )}
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
        {(!hasMeasurements || filteredMeasurements?.length === 0) && !loading && (
          <Typography variant="body2" component="h2" gutterBottom>
            {t('maps:noMeasurements')}
          </Typography>
        )}

        {selectedSensorMeasurementId && (
          <div className={classes.cameraModalImageContainer}>
            <div className={classes.actionButtonContainer}>
              <ValidationButton
                show={!selectedSensorMeasurement?.metadata?.detection?.fire}
                baseColor={theme.palette.primary.main}
                onClick={handlePerformValidation}
                metadata={selectedSensorMeasurement?.metadata}
                type="fire"
              />
              <ValidationButton
                show={selectedSensorMeasurement?.metadata?.detection?.fire}
                baseColor={theme.palette.primary.main}
                onClick={handlePerformValidation}
                metadata={selectedSensorMeasurement?.metadata}
                type="fire"
                value={true}
              />
              <ValidationButton
                show={selectedSensorMeasurement?.metadata?.detection?.fire}
                baseColor={theme.palette.primary.main}
                onClick={handlePerformValidation}
                metadata={selectedSensorMeasurement?.metadata}
                type="fire"
                value={false}
              />

              <ValidationButton
                show={!selectedSensorMeasurement?.metadata?.detection?.smoke}
                baseColor={theme.palette.primary.main}
                onClick={handlePerformValidation}
                metadata={selectedSensorMeasurement?.metadata}
                type="smoke"
              />

              <ValidationButton
                show={selectedSensorMeasurement?.metadata?.detection?.smoke}
                baseColor={theme.palette.primary.main}
                onClick={handlePerformValidation}
                metadata={selectedSensorMeasurement?.metadata}
                type="smoke"
                value={true}
              />

              <ValidationButton
                show={selectedSensorMeasurement?.metadata?.detection?.smoke}
                baseColor={theme.palette.primary.main}
                onClick={handlePerformValidation}
                metadata={selectedSensorMeasurement?.metadata}
                type="smoke"
                value={false}
              />
            </div>
            <img
              style={{
                width: '100%',
                height: 500,
                objectFit: 'contain',
                marginTop: 16,
                marginBottom: 16
              }}
              src={selectedSensorMeasurement?.measure}
              alt={selectedSensorMeasurement?.measure}
            />
          </div>
        )}
        {sensorData && filteredMeasurements?.length > 0 && (
          <div style={localStyles.thumbnailContainer}>
            <div>
              <IconButton disabled={page === 0} onClick={() => setPage(0)}>
                <ArrowLeft />
              </IconButton>
            </div>
            <div>
              <IconButton disabled={page === 0} onClick={() => setPage(page - 1)}>
                <KeyboardArrowLeft />
              </IconButton>
            </div>
            {pageItems.map((measurement: MeasureDto) => {
              const hasFire = measurement.metadata?.detection?.fire
              const hasSmoke = measurement.metadata?.detection?.smoke
              const thumbnail = measurement.metadata?.thumbnail_uri ?? measurement.measure
              const fireValidationStatus = getValidationStatus('fire', measurement.metadata)
              const smokeValidationStatus = getValidationStatus('smoke', measurement.metadata)

              const style = { ...localStyles.thumbnail }
              if (selectedSensorMeasurementId === measurement.id) {
                style.borderBottom = `3px solid ${theme.palette.secondary.main}`
              }

              return (
                <div key={measurement.id as any}>
                  <div style={style} onClick={() => setSelectedSensorMeasurement(measurement.id)}>
                    <div style={localStyles.smallBadgeContainer}>
                      {hasFire && fireValidationStatus === ValidationStatus.Detected && (
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
                      {hasFire &&
                        fireValidationStatus === ValidationStatus.DetectedAndValidated && (
                          <div
                            style={{
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <CheckCircle style={{ fill: theme.palette.error.dark, fontSize: 20 }} />
                          </div>
                        )}
                      {hasFire &&
                        fireValidationStatus === ValidationStatus.DetectedAndDiscarded && (
                          <div
                            style={{
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Cancel style={{ fill: theme.palette.error.dark, fontSize: 20 }} />
                          </div>
                        )}
                      {hasSmoke && smokeValidationStatus === ValidationStatus.Detected && (
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
                      {hasSmoke &&
                        smokeValidationStatus === ValidationStatus.DetectedAndValidated && (
                          <div
                            style={{
                              borderRadius: '50%',
                              backgroundColor: 'black',
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <CheckCircle
                              style={{ fill: theme.palette.primary.contrastText, fontSize: 20 }}
                            />
                          </div>
                        )}
                      {hasSmoke &&
                        smokeValidationStatus === ValidationStatus.DetectedAndDiscarded && (
                          <div
                            style={{
                              borderRadius: '50%',
                              backgroundColor: 'black',
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Cancel
                              style={{ fill: theme.palette.primary.contrastText, fontSize: 20 }}
                            />
                          </div>
                        )}
                    </div>
                    <img
                      style={{ width: 100, height: 75, objectFit: 'cover' }}
                      src={thumbnail}
                      alt={measurement.measure!}
                    />
                    {measurement.timestamp && (
                      <Typography variant="body2" style={{ fontSize: '0.7rem' }}>
                        {moment(measurement.timestamp).format('YYYY/MM/DD HH:mm')}
                      </Typography>
                    )}
                  </div>
                </div>
              )
            })}
            <div>
              <IconButton
                disabled={page === Math.ceil(filteredMeasurements.length / PAGE_SIZE) - 1}
                onClick={() => setPage(page + 1)}
              >
                <KeyboardArrowRight />
              </IconButton>
            </div>
            <div>
              <IconButton
                disabled={page === Math.ceil(filteredMeasurements.length / PAGE_SIZE) - 1}
                onClick={() => setPage(Math.ceil(filteredMeasurements.length / PAGE_SIZE) - 1)}
              >
                <ArrowRight />
              </IconButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

const localStyles: Record<string, CSSProperties> = {
  thumbnailContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflowY: 'hidden',
    overflowX: 'auto'
  },
  thumbnail: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 14px',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    position: 'relative'
  },
  thumbnailActive: {
    borderBottom: '3px solid #f9a825'
  },
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
    bottom: 20,
    left: 0,
    right: 4
  }
}
