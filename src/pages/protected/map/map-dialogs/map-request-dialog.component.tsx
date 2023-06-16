import React, { useMemo, useEffect } from 'react'

import {
  FormControl,
  TextField,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  FormHelperText,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@material-ui/core'
import TodayIcon from '@material-ui/icons/Today'

import { MuiPickersUtilsProvider, DateTimePicker, DatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'

import useLanguage from '../../../../hooks/use-language.hook'
import { useTranslation } from 'react-i18next'

import { GenericDialogProps } from '../map-dialog-edit.component'
import { _MS_PER_DAY } from '../../../../utils/utils.common'
import useAPIHandler from '../../../../hooks/use-api-handler'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from '../../../../hooks/api-hooks'
import { FiredAndBurnedAreasDialog } from './map-request-types/fire-and-burned-areas-dialog.component'
import { PostEventMonitoringDialog } from './map-request-types/post-event-monitoring-dialog.component'
import { WildFireSimulationDialog } from './map-request-types/wildfire-simulation-dialog.component'
import { MapRequestType } from 'ermes-ts-sdk'

export function MapRequestDialog({
  operationType,
  editState,
  dispatchEditAction,
  editError
}: React.PropsWithChildren<GenericDialogProps>) {
  //const { dateFormat } = useLanguage()
  const { t } = useTranslation(['maps', 'labels'])
  const endAdornment = useMemo(() => {
    return (
      <IconButton>
        <TodayIcon />
      </IconButton>
    )
  }, [])

  const [value, setValue] = React.useState('')

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])
  const [apiHandlerState, handleAPICall, resetApiHandlerState] = useAPIHandler(false)
  useEffect(() => {
    handleAPICall(() => layersApiFactory.getStaticDefinitionOfLayerList())
  }, [])

  /**
   * object that represents the list elements in the createmaprequest layers dropdown;
   * typescript and javascript keep the dictionaries ordered by key, so the elements
   * order is different from what comes form the apis
   */
  const dataTypeOptions = useMemo(() => {
    if (Object.entries(apiHandlerState.result).length === 0) return []
    else {
      const entries = [] as any[]
      apiHandlerState.result.data.layerGroups.forEach((group) => {
        group.subGroups.forEach((subGroup) => {
          subGroup.layers.forEach((layer) => {
            if (layer.frequency === 'OnDemand') {
              entries.push([layer.dataTypeId as string, layer.name])
            }
          })
        })
      })
      return Object.fromEntries(entries) //this method orders elements by the keys, could be a way to sort the contents of a dictionary
    }
  }, [apiHandlerState])
  console.debug('datatype', editState.dataType, typeof editState.dataType[0])
  return (
    <Grid container direction="column">
      <Grid container direction="row" style={{ marginBottom: 16 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Data Type</FormLabel>
          <RadioGroup
            // row
            aria-label="map-request-data-type"
            name="map-request-data-type"
            value={value}
            onChange={handleChange}
          >
            <FormControlLabel
              value={MapRequestType.FIRE_AND_BURNED_AREA}
              control={<Radio />}
              label="Fire and Burned Areas"
            />
            <FormControlLabel
              value={MapRequestType.POST_EVENT_MONITORING}
              control={<Radio />}
              label="Post Event Monitoring"
            />
            <FormControlLabel
              value={MapRequestType.WILDFIRE_SIMULATION}
              control={<Radio />}
              label="Wildfire Simulation"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      {/* <Grid container direction="row" style={{ marginBottom: 16 }}>
        <FormControl variant="outlined">
          <InputLabel id="demo-simple-select-outlined-label">Data Type</InputLabel>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={value}
            onChange={handleChange}
            label="Data Type"
          >
            <MenuItem value={MapRequestType.FIRE_AND_BURNED_AREA}>Fire and Burned Areas</MenuItem>
            <MenuItem value={MapRequestType.POST_EVENT_MONITORING}>Post Event Monitoring</MenuItem>
            <MenuItem value={MapRequestType.WILDFIRE_SIMULATION}>Wildfire Simulation</MenuItem>
          </Select>
        </FormControl>
      </Grid> */}
      <Divider style={{ marginBottom: 16 }} />
      {value === MapRequestType.FIRE_AND_BURNED_AREA ? (
        <FiredAndBurnedAreasDialog
          operationType={operationType}
          editError={editError}
          editState={{...editState, dataType: [MapRequestType.FIRE_AND_BURNED_AREA]}}
          dispatchEditAction={dispatchEditAction}
        />
      ) : (
        <></>
      )}
      {value === MapRequestType.POST_EVENT_MONITORING ? (
        <PostEventMonitoringDialog
          operationType={operationType}
          editError={editError}
          editState={{...editState, dataType: [MapRequestType.POST_EVENT_MONITORING]}}
          dispatchEditAction={dispatchEditAction}
        />
      ) : (
        <></>
      )}
      {value === MapRequestType.WILDFIRE_SIMULATION ? (
        <WildFireSimulationDialog
          operationType={operationType}
          editError={editError}
          editState={{...editState, dataType: [MapRequestType.WILDFIRE_SIMULATION]}}
          dispatchEditAction={dispatchEditAction}
        />
      ) : (
        <></>
      )}
    </Grid>
  )
}
