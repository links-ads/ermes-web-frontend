import React from 'react'

import {
  FormControl,
  Grid,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import { GenericDialogProps } from '../map-dialog-edit.component'
import { _MS_PER_DAY } from '../../../../utils/utils.common'
import { FiredAndBurnedAreasDialog } from './map-request-types/fire-and-burned-areas-dialog.component'
import { PostEventMonitoringDialog } from './map-request-types/post-event-monitoring-dialog.component'
import { WildFireSimulationDialog } from './map-request-types/wildfire-simulation-dialog.component'
import { MapRequestType } from 'ermes-ts-sdk'

export function MapRequestDialog({
  operationType,
  editState,
  dispatchEditAction,
  editError,
  setEditError
}: React.PropsWithChildren<GenericDialogProps>) {
  const { t } = useTranslation(['maps', 'labels'])

  const [value, setValue] = React.useState(editState.type ?? '')

  const handleChange = (event) => {
    setValue(event.target.value)
    dispatchEditAction({ type: 'RESET' })
    dispatchEditAction({ type: 'TYPE', value: event.target.value })
    setEditError(false)
  }

  console.debug('datatype', editState.dataType, typeof editState.dataType[0])
  return (
    editState && (
      <Grid container direction="column">
        <Grid container direction="row" style={{ marginBottom: 16 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('labels:type')}</FormLabel>
            <RadioGroup
              aria-label="map-request-data-type"
              name="map-request-data-type"
              value={value}
              onChange={handleChange}
            >
              <FormControlLabel
                value={MapRequestType.FIRE_AND_BURNED_AREA}
                control={<Radio />}
                label={t('fireAndBurnedAreas')}
              />
              <FormControlLabel
                value={MapRequestType.POST_EVENT_MONITORING}
                control={<Radio />}
                label={t('postEventMonitoring')}
              />
              <FormControlLabel
                value={MapRequestType.WILDFIRE_SIMULATION}
                control={<Radio />}
                label={t('wildfireSimulation')}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Divider style={{ marginBottom: 16 }} />
        {editState && value === MapRequestType.FIRE_AND_BURNED_AREA ? (
          <FiredAndBurnedAreasDialog
            operationType={operationType}
            editError={editError}
            editState={{ ...editState, type: MapRequestType.FIRE_AND_BURNED_AREA }}
            dispatchEditAction={dispatchEditAction}
            setEditError={setEditError}
          />
        ) : (
          <></>
        )}
        {editState && value === MapRequestType.POST_EVENT_MONITORING ? (
          <PostEventMonitoringDialog
            operationType={operationType}
            editError={editError}
            editState={{ ...editState, type: MapRequestType.POST_EVENT_MONITORING }}
            dispatchEditAction={dispatchEditAction}
            setEditError={setEditError}
          />
        ) : (
          <></>
        )}
        {editState && value === MapRequestType.WILDFIRE_SIMULATION ? (
          <WildFireSimulationDialog
            operationType={operationType}
            editError={editError}
            editState={{ ...editState, type: MapRequestType.WILDFIRE_SIMULATION }}
            dispatchEditAction={dispatchEditAction}
            setEditError={setEditError}
          />
        ) : (
          <></>
        )}
      </Grid>
    )
  )
}
