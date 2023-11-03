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
import React, { CSSProperties, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useAPIConfiguration } from '../../../../hooks/api-hooks'
import useCameras from '../../../../hooks/use-cameras.hook'
import { AppState } from '../../../../state/app.state'
import { clearSelectedCamera, replaceMeasurement } from '../../../../state/selected-camera.state'
import {
  CameraValidationStatus,
  getCameraValidationStatus
} from '../../../../utils/get-camera-validation-status.util'
import { DiscardedIcon, ValidatedIcon } from './camera-chip-icons.component'
import classes from './drawer-cards/communication-card.module.scss'
import { getCameraState } from '../../../../utils/get-camera-state.util'
import { ErmesAxiosContext } from '../../../../state/ermesaxios.context'

function getCardinalDirection(angle) {
  const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW']
  return directions[Math.round(angle / 45) % 8]
}

type CameraDetailsProps = {}

const PAGE_SIZE = 6

function ValidationButton({ show, baseColor, onClick, metadata, type, value = null }: any) {
  const theme = useTheme()

  const { t } = useTranslation(['common', 'maps'])

  if (!show) {
    return null
  }

  const validationStatus = getCameraValidationStatus(type, metadata)
  const _value =
    validationStatus === CameraValidationStatus.Undetected
      ? true
      : validationStatus === CameraValidationStatus.UndetectedAndAdded
      ? null
      : value

  return (
    <Button
      variant="contained"
      style={{
        backgroundColor:
          (validationStatus === CameraValidationStatus.DetectedAndValidated && value) ||
          (validationStatus === CameraValidationStatus.DetectedAndDiscarded && !value) ||
          validationStatus === CameraValidationStatus.UndetectedAndAdded
            ? '#005500'
            : baseColor,
        color: theme.palette.primary.contrastText
      }}
      onClick={() => onClick(type, _value)}
    >
      {validationStatus === CameraValidationStatus.DetectedAndValidated && value && (
        <>
          <CheckCircle /> {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === CameraValidationStatus.DetectedAndDiscarded && value === false && (
        <>
          <Cancel /> {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === CameraValidationStatus.UndetectedAndAdded && (
        <>
          <RemoveCircle /> {t(`maps:remove`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === CameraValidationStatus.Undetected && (
        <>
          <AddCircle /> {t(`maps:add`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === CameraValidationStatus.Detected && value && (
        <>
          <Check /> {t(`maps:confirm`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === CameraValidationStatus.DetectedAndDiscarded && value && (
        <>
          <Check /> {t(`maps:confirm`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === CameraValidationStatus.Detected && value === false && (
        <>
          <Close /> {t(`maps:discard`)} {t(`maps:${type}`)}
        </>
      )}

      {validationStatus === CameraValidationStatus.DetectedAndValidated && value === false && (
        <>
          <Close /> {t(`maps:discard`)} {t(`maps:${type}`)}
        </>
      )}
    </Button>
  )
}

const emptyArray = []

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
  const backendUrl = backendAPIConfig.basePath!
  const {axiosInstance} = useContext(ErmesAxiosContext)
  const stationsApiFactory = useMemo(
    () => StationsApiFactory(backendAPIConfig, backendUrl, axiosInstance),
    [backendAPIConfig]
  )  
  const { enqueueSnackbar } = useSnackbar()

  async function handleClose() {
    setSelectedSensorId(undefined)
    setSensorData(null)
    setSelectedSensorMeasurement(null)

    dispatch(clearSelectedCamera())
  }

  const filteredMeasurements = useMemo(() => {
    if (!sensorData) {
      return emptyArray
    }

    return sensorData.filter((measurement: MeasureDto) => {
      if (!hideMeasurementsWithoutDetections) {
        return true
      }

      return (
        measurement.metadata?.detection?.fire ||
        measurement.metadata?.detection?.smoke ||
        measurement.metadata?.validation?.fire ||
        measurement.metadata?.validation?.smoke
      )
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
  }, [elem?.id, selectedSensorId])

  const selectedSensorMeasurement = sensorData?.find((s) => s.id === selectedSensorMeasurementId)

  async function handlePerformValidation(type, value) {
    const currentMetadata = selectedSensorMeasurement?.metadata
    if (!currentMetadata) {
      return false
    }

    const { validation, ...rest } = currentMetadata

    try {
      const response = await stationsApiFactory.stationsValidateMeasure({
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

      dispatch(replaceMeasurement(response.data.measure!))

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

              const [hasFire, hasAtLeastOneFireValidation, hasAllFireValidationsDiscarded] =
                getCameraState('fire', sensor.measurements)
              const [hasSmoke, hasAtLeastOneSmokeValidation, hasAllSmokeValidationsDiscarded] =
                getCameraState('smoke', sensor.measurements)

              const thumbnail = firstMeasurement.measure
              const description = sensor.description

              return (
                <Tab
                  key={sensor.id!}
                  value={sensor.id}
                  className={classes.cameraDetailsTab}
                  label={
                    <div>
                      <div style={localStyles.badgeContainer}>
                        {hasFire && (
                          <Chip
                            avatar={
                              hasAllFireValidationsDiscarded ? (
                                <DiscardedIcon type="fire" avatar />
                              ) : hasAtLeastOneFireValidation ? (
                                <ValidatedIcon type="fire" avatar />
                              ) : undefined
                            }
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
                            avatar={
                              hasAllSmokeValidationsDiscarded ? (
                                <DiscardedIcon type="smoke" avatar />
                              ) : hasAtLeastOneSmokeValidation ? (
                                <ValidatedIcon type="smoke" avatar />
                              ) : undefined
                            }
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
              const fireValidationStatus = getCameraValidationStatus('fire', measurement.metadata)
              const smokeValidationStatus = getCameraValidationStatus('smoke', measurement.metadata)

              const style = { ...localStyles.thumbnail }
              if (selectedSensorMeasurementId === measurement.id) {
                style.borderBottom = `3px solid ${theme.palette.secondary.main}`
              }

              return (
                <div key={measurement.id as any}>
                  <div style={style} onClick={() => setSelectedSensorMeasurement(measurement.id)}>
                    <div style={localStyles.smallBadgeContainer}>
                      {hasFire && fireValidationStatus === CameraValidationStatus.Detected && (
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
                      {((hasFire &&
                        fireValidationStatus === CameraValidationStatus.DetectedAndValidated) ||
                        fireValidationStatus === CameraValidationStatus.UndetectedAndAdded) && (
                        <ValidatedIcon type="fire" />
                      )}
                      {hasFire &&
                        fireValidationStatus === CameraValidationStatus.DetectedAndDiscarded && (
                          <DiscardedIcon type="fire" />
                        )}
                      {hasSmoke && smokeValidationStatus === CameraValidationStatus.Detected && (
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
                      {((hasSmoke &&
                        smokeValidationStatus === CameraValidationStatus.DetectedAndValidated) ||
                        smokeValidationStatus === CameraValidationStatus.UndetectedAndAdded) && (
                        <ValidatedIcon type="smoke" />
                      )}
                      {hasSmoke &&
                        smokeValidationStatus === CameraValidationStatus.DetectedAndDiscarded && (
                          <DiscardedIcon type="smoke" />
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
