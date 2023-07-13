import React, { useMemo, useEffect, useState, useCallback } from 'react'

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
  Switch
} from '@material-ui/core'
import TodayIcon from '@material-ui/icons/Today'

import { MuiPickersUtilsProvider, DateTimePicker, DatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { GenericDialogProps } from '../../map-dialog-edit.component'
import { useTranslation } from 'react-i18next'
import { useAPIConfiguration } from '../../../../../hooks/api-hooks'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import useAPIHandler from '../../../../../hooks/use-api-handler'
import { _MS_PER_DAY } from '../../../../../utils/utils.common'
import useLanguage from '../../../../../hooks/use-language.hook'
import { AddCircle, Delete, Gesture, LinearScale, Timeline } from '@material-ui/icons'
import { MapStateContextProvider } from '../../map.contest'
import MapRequestDrawFeature from './map-request-draw-feature/map-request-draw-feature.component'
import { CulturalProps } from '../../provisional-data/cultural.component'
import { FireBreakType } from '../../map-dialog.hooks'

// import useLanguage from '../../../../hooks/use-language.hook';

type MapFeature = CulturalProps

export function WildFireSimulationDialog({
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

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])
  const [apiHandlerState, handleAPICall, resetApiHandlerState] = useAPIHandler(false)
  useEffect(() => {
    handleAPICall(() => layersApiFactory.getStaticDefinitionOfLayerList())
  }, [])

  const { dateFormat } = useLanguage()
  const { startDate, hoursOfProjection } = editState

  const [wildfireMapMode, setWildfireMapMode] = useState<string>('editPoint')
  const [boundaryConditionIdx, setBoundaryConditionIdx] = useState<number>(0)

  const getEndDateTime = (startDate, hoursOfProjection) => {
    const endDate = new Date(startDate)
    const numHoursOfProjection = parseInt(hoursOfProjection)
    endDate.setHours(endDate.getHours() + numHoursOfProjection)
    return endDate
  }

  useEffect(() => {
    if (!startDate || !hoursOfProjection) return
    const endDateTime = getEndDateTime(startDate, hoursOfProjection)
    dispatchEditAction({ type: 'END_DATE', value: endDateTime as Date })
  }, [startDate, hoursOfProjection])

  /**
   * object that represents the list elements in the createmaprequest layers dropdown;
   * typescript and javascript keep the dictionaries ordered by key, so the elements
   * order is different from what comes form the apis
   */
  const dataTypeOptions = useMemo(() => {
    if (Object.entries(apiHandlerState.result).length === 0) return []
    else {
      const entries = [] as any[]
      apiHandlerState.result.data.layerGroups
        .filter((l) => l.groupKey === 'fire simulation')
        .forEach((group) => {
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
    <Grid container direction="row" spacing={2}>
      <Grid item xs={6} style={{ minWidth: 600 }}>
        <Grid container direction="row">
          <h3>{t('wildfire_simulation')}</h3>
        </Grid>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <TextField
              id="hours_of_projection_title"
              label={t('maps:hours_of_projection_label')}
              error={editError && parseInt(editState.hoursOfProjection) < 0}
              helperText={
                editError &&
                parseInt(editState.hoursOfProjection) < 0 &&
                t('maps:hours_of_projection_helper')
              }
              type="number"
              value={editState.hoursOfProjection}
              onChange={(e) =>
                dispatchEditAction({ type: 'HOURS_OF_PROJECTION', value: e.target.value })
              }
              variant="outlined"
              color="primary"
              fullWidth={true}
              inputProps={{ min: 1, max: 72 }}
            />
          </Grid>
          <Grid item style={{ marginLeft: 8 }}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                style={{ paddingTop: 0, marginTop: 0 }}
                variant="inline"
                format={dateFormat}
                margin="normal"
                id="start-date-picker-inline"
                label={t('common:date_picker_test_start')}
                value={editState.startDate}
                onChange={(d) => {
                  if (d != null) {
                    //let d1 = new Date(d?.setHours(0, 0, 0, 0))
                    return dispatchEditAction({ type: 'START_DATE', value: d as Date })
                  }
                }}
                disableFuture={false}
                autoOk={true}
                ampm={false}
                // clearable={true}
                InputProps={{
                  endAdornment: endAdornment
                }}
              />
              <DateTimePicker
                style={{ paddingTop: 0, marginTop: 0 }}
                variant="inline"
                format={dateFormat}
                margin="normal"
                id="end-date-picker-inline"
                label={t('common:date_picker_test_end')}
                value={editState.endDate}
                onChange={(d) => {
                  if (d != null) {
                    let d1 = new Date(d?.setHours(23, 59, 59, 0))
                    return dispatchEditAction({ type: 'END_DATE', value: d1 as Date })
                  }
                }}
                disableFuture={false}
                autoOk={true}
                error={editError && !editState.endDate}
                helperText={editError && !editState.endDate && t('maps:mandatory_field')}
                minDate={editState.startDate}
                maxDate={new Date(new Date(editState.startDate).valueOf() + _MS_PER_DAY * 30)}
                ampm={false}
                disabled
                InputProps={{
                  endAdornment: endAdornment
                }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
        </Grid>
        <Grid container style={{ marginBottom: 16, width: '100%' }}>
          <TextField
            id="map-request-title"
            label={t('maps:request_title_label')}
            error={
              editError &&
              (!editState.requestTitle ||
                editState.requestTitle === null ||
                editState.requestTitle.length === 0)
            }
            helperText={
              editError &&
              (!editState.requestTitle ||
                editState.requestTitle === null ||
                editState.requestTitle.length === 0) &&
              t('maps:request_title_help')
            }
            type="text"
            value={editState.requestTitle}
            onChange={(e) => dispatchEditAction({ type: 'REQUEST_TITLE', value: e.target.value })}
            variant="outlined"
            color="primary"
            fullWidth={true}
            // inputProps={{ min: 0, max: 30 }}
          />
        </Grid>
        <Grid container style={{ marginBottom: 16 }}>
          <TextField
            id="map-request-description"
            label={t('maps:description')}
            error={
              editError &&
              (!editState.description ||
                editState.description === null ||
                editState.description.length === 0)
            }
            helperText={
              editError &&
              (!editState.description ||
                editState.description === null ||
                editState.description.length === 0) &&
              t('maps:description_placeholder')
            }
            type="text"
            value={editState.description}
            onChange={(e) => dispatchEditAction({ type: 'DESCRIPTION', value: e.target.value })}
            variant="outlined"
            color="primary"
            fullWidth={true}
            multiline
            // inputProps={{ min: 0, max: 30 }}
          />
        </Grid>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          style={{ marginBottom: 16 }}
        >
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('maps:probability_range_label')}</FormLabel>
            <RadioGroup
              row
              aria-label="probability-range"
              name="probability-range"
              value={editState.probabilityRange}
              onChange={(e) =>
                dispatchEditAction({ type: 'PROBABILITY_RANGE', value: e.target.value })
              }
            >
              <FormControlLabel value={'0.5'} control={<Radio />} label="50%" />
              <FormControlLabel value={'0.75'} control={<Radio />} label="75%" />
              <FormControlLabel value={'0.9'} control={<Radio />} label="90%" />
            </RadioGroup>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={editState.simulationFireSpotting}
                name="simulation-fire-spotting"
                onChange={(e) =>
                  dispatchEditAction({ type: 'SIMULATION_FIRE_SPOTTING', value: e.target.checked })
                }
              />
            }
            label={t('simulationFireSpottingLabel')}
          />
        </Grid>
        <Grid container direction="row">
          <h4>{t('boundaryConditionsLabel')}</h4>
        </Grid>
        <Grid container direction="row">
          {editState.boundaryConditions.map((e, idx) => (
            <WildfireSimulationBoundaryCondition
              key={idx}
              index={idx}
              editError={editError}
              editState={e}
              dispatchEditAction={dispatchEditAction}
              t={t}
              hoursOfProjection={editState.hoursOfProjection}
              setWildfireMapMode={setWildfireMapMode}
              setBoundaryConditionIdx={setBoundaryConditionIdx}
            />
          ))}
          <Grid item>
            {parseInt(editState.hoursOfProjection) > 1 &&
            editState.boundaryConditions.length < parseInt(editState.hoursOfProjection) ? (
              <IconButton onClick={() => dispatchEditAction({ type: 'BOUNDARY_CONDITION_ADD' })}>
                <AddCircle></AddCircle>
              </IconButton>
            ) : undefined}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6} style={{ minWidth: 600 }}>
        <h5>Please draw on map</h5>
        <MapStateContextProvider<MapFeature>>
          <MapRequestDrawFeature customMapMode={wildfireMapMode} lineIdx={boundaryConditionIdx} />
        </MapStateContextProvider>
      </Grid>
    </Grid>
  )
}

const WildfireSimulationBoundaryCondition = (props) => {
  const {
    editError,
    editState,
    dispatchEditAction,
    t,
    hoursOfProjection,
    index,
    setWildfireMapMode,
    setBoundaryConditionIdx
  } = props
  return (
    <Grid item>
      <Grid item style={{ marginBottom: 16 }}>
        <TextField
          id="time-offset"
          label={t('maps:timeOffsetLabel')}
          error={editError && parseInt(editState.timeOffset) < 0}
          helperText={editError && parseInt(editState.timeOffset) < 0 && t('maps:timeOffsetHelp')}
          type="number"
          value={editState.timeOffset}
          onChange={(e) =>
            dispatchEditAction({
              type: 'BOUNDARY_CONDITION_EDIT',
              value: { index: index, property: 'timeOffset', newValue: parseInt(e.target.value) }
            })
          }
          variant="outlined"
          color="primary"
          fullWidth={true}
          inputProps={{ min: 0, max: parseInt(hoursOfProjection) }}
        />
      </Grid>
      <Grid item style={{ marginBottom: 16 }}>
        <TextField
          id="wind-direction"
          label={t('maps:windDirectionLabel')}
          error={editError && parseInt(editState.windDirection) < 0}
          helperText={
            editError && parseInt(editState.windDirection) < 0 && t('maps:windDirectionHelp')
          }
          type="number"
          value={editState.windDirection}
          onChange={(e) =>
            dispatchEditAction({
              type: 'BOUNDARY_CONDITION_EDIT',
              value: { index: index, property: 'windDirection', newValue: parseInt(e.target.value) }
            })
          }
          variant="outlined"
          color="primary"
          fullWidth={true}
          inputProps={{ min: 0, max: 360 }}
        />
      </Grid>
      <Grid item style={{ marginBottom: 16 }}>
        <TextField
          id="wind-speed"
          label={t('maps:windSpeedLabel')}
          error={editError && parseInt(editState.windSpeed) < 0}
          helperText={editError && parseInt(editState.windSpeed) < 0 && t('maps:windSpeedHelp')}
          type="number"
          value={editState.windSpeed}
          onChange={(e) =>
            dispatchEditAction({
              type: 'BOUNDARY_CONDITION_EDIT',
              value: { index: index, property: 'windSpeed', newValue: parseInt(e.target.value) }
            })
          }
          variant="outlined"
          color="primary"
          fullWidth={true}
          inputProps={{ min: 0, max: 300 }}
        />
      </Grid>
      <Grid item style={{ marginBottom: 16 }}>
        <TextField
          id="fuel-moisture-content"
          label={t('maps:fuelMoistureContentLabel')}
          error={editError && parseInt(editState.fuelMoistureContent) < 0}
          helperText={
            editError &&
            parseInt(editState.fuelMoistureContent) < 0 &&
            t('maps:fuelMoistureContentHelp')
          }
          type="number"
          value={editState.fuelMoistureContent}
          onChange={(e) =>
            dispatchEditAction({
              type: 'RESOLUTION',
              value: {
                index: index,
                property: 'fuelMoistureContent',
                newValue: parseInt(e.target.value)
              }
            })
          }
          variant="outlined"
          color="primary"
          fullWidth={true}
          inputProps={{ min: 0, max: 100 }}
        />
      </Grid>
      <Grid item style={{ marginBottom: 16 }}>
        <FormControl>
          <InputLabel id="fire-break-type-select-label">Fire Break Type</InputLabel>
          <Select
            labelId="fire-break-type-select-label"
            id="fire-break-type-select"
            value={Object.keys(editState.fireBreakType)[0]}
            onChange={(e) =>
              dispatchEditAction({
                type: 'BOUNDARY_CONDITION_EDIT',
                value: {
                  index: index,
                  property: 'fireBreakType',
                  newValue: Object.fromEntries([[e.target.value, null]])
                }
              })
            }
          >
            <MenuItem value={FireBreakType.CANADAIR}>Canadair</MenuItem>
            <MenuItem value={FireBreakType.HELICOPTER}>Helicopter</MenuItem>
            <MenuItem value={FireBreakType.WATERLINE}>Water Line</MenuItem>
            <MenuItem value={FireBreakType.VEHICLE}>Vehicle</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item style={{ marginBottom: 16 }}>
        <IconButton
          onClick={() => {
            setWildfireMapMode('editLine')
            setBoundaryConditionIdx(index)
          }}
        >
          <Timeline></Timeline>
        </IconButton>
      </Grid>
      <Grid container justifyContent="center">
        {index > 0 ? (
          <IconButton
            onClick={() =>
              dispatchEditAction({ type: 'BOUNDARY_CONDITION_REMOVE', value: { index: index } })
            }
          >
            <Delete></Delete>
          </IconButton>
        ) : undefined}
      </Grid>
    </Grid>
  )
}
