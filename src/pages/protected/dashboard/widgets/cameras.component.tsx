import React, { useMemo } from 'react'
import { CircularProgress, Typography } from '@material-ui/core'
import { ResponsiveBar } from '@nivo/bar'
import { EmergencyColorMap } from '../../map/api-data/emergency.component'
import { useTranslation } from 'react-i18next'

export function Square({ color, style = {} }) {
  return <div style={{ height: 16, width: 16, backgroundColor: color, ...style }}></div>
}

export function Cameras({ cameras }) {
  const { t } = useTranslation()

  console.log(cameras)

  const data = useMemo(() => {
    if (!cameras) return []

    const data = cameras.map((p) => ({
      id: t(`labels:${p.id.toLowerCase()}`),
      value: p.value,
      valueColor: EmergencyColorMap.Station
    }))

    return data
  }, [cameras])

  if (!cameras) {
    return <CircularProgress color="secondary" />
  }

  if (cameras?.length === 0) {
    return <Typography variant="body2">{t('labels:no_data')}</Typography>
  }

  return (
    <div>
      <div style={{ height: 32 * data.length }}>
        <table>
          <tbody>
            {cameras.map((camera) => {
              return (
                <tr key={camera.id} style={{ height: 32 }}>
                  <td width="30%">
                    <Typography variant="body2">
                      {t(`labels:${camera.isOnline ? 'camera-online' : 'camera-offline'}`)}
                    </Typography>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Square
                        style={{ marginRight: 5 }}
                        color={camera.isOnline ? EmergencyColorMap.Station : '#747474'}
                      />
                      <Typography variant="body2">
                        {camera.name} ({Number(camera.location.longitude).toFixed(4)},{' '}
                        {Number(camera.location.latitude).toFixed(4)})
                      </Typography>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
