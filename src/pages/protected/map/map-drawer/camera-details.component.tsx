import { Dialog, DialogTitle, DialogContent, Typography, Tabs, Tab } from '@material-ui/core'
import { StationDto, StationsApiFactory } from 'ermes-backoffice-ts-sdk'
import useCameras from '../../../../hooks/use-cameras.hook'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../../state/app.state'
import { clearSelectedCamera } from '../../../../state/selected-camera.state'

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

  function handleClose() {
    dispatch(clearSelectedCamera())
  }

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

    fetchCameraSensors(elem.id, selectedSensorId).then((data) => {
      setSensorData(data)
      if (data.length) {
        setSelectedSensorMeasurement(data[0]?.id)
      } else {
        setSelectedSensorMeasurement(null)
      }
    })
  }, [elem, selectedSensorId])

  return (
    <Dialog open={!!elem} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>
        {elem?.name} {t('common:details')}
      </DialogTitle>
      <DialogTitle>
        {hasMeasurements && (
          <Tabs
            variant="scrollable"
            value={selectedSensorId}
            onChange={(_, v) => setSelectedSensorId(v)}
          >
            {elem?.sensors?.map((sensor) => {
              const firstMeasurement = sensor.measurements?.[0]
              if (!firstMeasurement) return null

              return (
                <Tab
                  key={firstMeasurement.sensorId as any}
                  value={firstMeasurement.sensorId}
                  label={
                    <img
                      style={{ width: 300, height: 150, objectFit: 'cover' }}
                      src={firstMeasurement.measure!}
                      alt={firstMeasurement.measure!}
                    />
                  }
                />
              )
            })}
          </Tabs>
        )}
      </DialogTitle>
      <DialogContent>
        {!hasMeasurements && (
          <Typography variant="body2" component="h2" gutterBottom>
            {t('maps:noMeasurements')}
          </Typography>
        )}
        {selectedSensorMeasurementId && (
          <img
            style={{ width: '100%', height: 500, objectFit: 'contain' }}
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
            {sensorData.map((measurement) => (
              <Tab
                key={measurement.id as any}
                value={measurement.id}
                label={
                  <img
                    style={{ width: 100, height: 50, objectFit: 'cover' }}
                    src={measurement.measure!}
                    alt={measurement.measure!}
                  />
                }
              />
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
