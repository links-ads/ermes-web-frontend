import { SensorDto } from 'ermes-backoffice-ts-sdk'

export function getSensorsLastUpdate(sensors: SensorDto[]) {
  let lastUpdate = 0

  sensors.forEach((sensor) => {
    sensor.measurements?.forEach((measurement) => {
      const currentTimestamp = new Date(measurement.timestamp!).getTime()

      if (!isNaN(currentTimestamp) && currentTimestamp > lastUpdate) {
        lastUpdate = currentTimestamp
      }
    })
  })

  return lastUpdate
}
