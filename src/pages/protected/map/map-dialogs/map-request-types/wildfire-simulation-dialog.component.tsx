import React, { useMemo, useEffect, useState, useContext } from 'react'

import {
  FormControl,
  TextField,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  FormHelperText,
  Tooltip,
  ListItemText,
  Checkbox,
  makeStyles
} from '@material-ui/core'
import InfoIcon from '@material-ui/icons/Info'
import { GenericDialogProps } from '../../map-dialog-edit.component'
import { useTranslation } from 'react-i18next'
import { useAPIConfiguration } from '../../../../../hooks/api-hooks'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import useAPIHandler from '../../../../../hooks/use-api-handler'
import { _MS_PER_DAY } from '../../../../../utils/utils.common'
import { AddCircle, Delete, Gesture, ScatterPlot, Timeline } from '@material-ui/icons'
import { MapMode, MapStateContextProvider } from '../../map.context'
import MapRequestDrawFeature, {
  lineColors
} from './map-request-draw-feature/map-request-draw-feature.component'
import { CulturalProps } from '../../provisional-data/cultural.component'
import { FireBreakType } from '../../map-dialog.hooks'
import { Alert, Color } from '@material-ui/lab'
import { wktToGeoJSON, geojsonToWKT } from '@terraformer/wkt'
import { feature } from '@turf/helpers'
import { DatePicker, LocaleProvider } from 'antd'
import { Locale } from 'antd/es/locale-provider'
import moment from 'moment'
import it_IT from 'antd/es/locale/it_IT'
import en_GB from 'antd/es/locale/en_GB'
import 'moment/locale/it'
import 'moment/locale/en-gb'
import { ErmesAxiosContext } from '../../../../../state/ermesaxios.context'

type MapFeature = CulturalProps

const useStyles = makeStyles((theme) => ({
  label: {
    color: 'rgba(255, 255, 255, 0.7)'
  }
}))

export function WildFireSimulationDialog({
  operationType,
  editState,
  dispatchEditAction,
  editError
}: React.PropsWithChildren<GenericDialogProps>) {
  const classes = useStyles()
  const { t, i18n } = useTranslation(['maps', 'labels', 'filters', 'social'])
  const { language } = i18n
  const [locale, setLocale] = useState<Locale>(language === it_IT.locale ? it_IT : en_GB)
  const {
    mapSelectionCompleted,
    mapArea,
    boundaryConditions,
    type,
    startDate,
    endDate,
    hoursOfProjection
  } = editState
  const [areaSelectionStatus, setAreaSelectionStatus] = useState<Color>('info')
  const [areaSelectionStatusMessage, setAreaSelectionStatusMessage] =
    useState<string>('mapSelectionInfoMessage')
  const [boundaryLinesTot, setBoundaryLinesTot] = useState<number>(0)
  const [mapFeatures, setMapFeatures] = useState<any[]>(
    mapSelectionCompleted && mapArea
      ? [{ ...mapArea }].concat(
          boundaryConditions
            .filter((e) => e.fireBreakType && Object.values(e.fireBreakType).length > 0)
            .map((e) => Object.values(e.fireBreakType)[0])
        )
      : []
  )
  const [areaOfInterestWKT, setAreaOfIntererstWKT] = useState<string>(
    mapArea && mapArea.geometry ? geojsonToWKT(mapArea.geometry) : ''
  )
  const [aoiWKTError, setAoiWKTError] = useState<boolean>(false)

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const backendUrl = backendAPIConfig.basePath!
  const {axiosInstance} = useContext(ErmesAxiosContext)     
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig, backendUrl, axiosInstance), [backendAPIConfig])
  const [apiHandlerState, handleAPICall, resetApiHandlerState] = useAPIHandler(false)
  useEffect(() => {
    handleAPICall(() =>
      layersApiFactory.getStaticDefinitionOfLayerList({
        headers: {
          'Accept-Language': i18n.language
        }
      })
    )
  }, [])

  const setMapSelectionCompleted = () => {
    dispatchEditAction({ type: 'MAP_SELECTION_COMPLETED', value: true })
  }

  const unsetMapSelectionCompleted = () => {
    dispatchEditAction({ type: 'MAP_SELECTION_COMPLETED', value: false })
  }

  useEffect(() => {
    if (mapSelectionCompleted) {
      setAreaSelectionStatus('success')
      setAreaSelectionStatusMessage('mapSelectionSuccessMessage')
    } else if (editError && !mapSelectionCompleted) {
      setAreaSelectionStatus('error')
      setAreaSelectionStatusMessage('mapSelectionErrorMessage')
    } else {
      setAreaSelectionStatus('info')
      setAreaSelectionStatusMessage('mapSelectionInfoMessage')
    }
  }, [mapSelectionCompleted, editError])

  const setMapArea = (area) => {
    dispatchEditAction({ type: 'MAP_AREA', value: area })
    const aoiWKT = geojsonToWKT(area.geometry)
    setAoiWKTError(false)
    setAreaOfIntererstWKT(aoiWKT)
  }

  const aoiWKTOnChangeHandler = (event) => {
    const newAoiWKT = event.target.value

    try {
      const geojsonAoi = wktToGeoJSON(newAoiWKT)
      const mapAreaFeature = feature(geojsonAoi)
      dispatchEditAction({ type: 'MAP_AREA', value: mapAreaFeature })
      setAoiWKTError(false)
    } catch (err) {
      console.error(err)
      setAoiWKTError(true)
    } finally {
      setAreaOfIntererstWKT(newAoiWKT)
    }
  }

  useEffect(() => {
    if (mapArea) {
      const concatFeatures = [{ ...mapArea }].concat(
        boundaryConditions
          .filter((e) => e.fireBreakType && Object.values(e.fireBreakType).length > 0)
          .map((e) => Object.values(e.fireBreakType)[0])
      )
      setMapFeatures(concatFeatures)
    }
  }, [mapArea])

  const [wildfireMapMode, setWildfireMapMode] = useState<MapMode>('editPoint')
  const [boundaryConditionIdx, setBoundaryConditionIdx] = useState<number>(0)
  const [fireBreakType, setFireBreakType] = useState<string>('')
  const [toRemoveLineIdx, setToRemoveLineIdx] = useState<number>(-1)
  const [toRemoveBoundaryConditionIdx, setToRemoveBoundaryConditionIdx] = useState<number>(-1)

  const setBoundaryLine = (idx, line) => {
    dispatchEditAction({
      type: 'BOUNDARY_CONDITION_EDIT',
      value: {
        index: idx,
        property: 'fireBreakType',
        newValue: Object.fromEntries([[fireBreakType, line]])
      }
    })
  }

  const getEndDateTime = (startDate, hoursOfProjection) => {
    const endDate = new Date(startDate)
    const numHoursOfProjection = parseInt(hoursOfProjection)
    endDate.setHours(endDate.getHours() + numHoursOfProjection)
    return endDate
  }

  const onStartChange = (value) => {
    let startD = new Date(value?.toDate() as Date)
    dispatchEditAction({
      type: 'START_DATE',
      value: startD
    })
  }

  useEffect(() => {
    if (!startDate || !hoursOfProjection) return
    const endDateTime = getEndDateTime(startDate, hoursOfProjection)
    dispatchEditAction({ type: 'END_DATE', value: endDateTime as Date })
  }, [startDate, hoursOfProjection])

  useEffect(() => {
    const tot = boundaryConditions
      .map((e) => (e.fireBreakType ? Object.keys(e.fireBreakType)[0] : null))
      .filter((e) => e).length
    setBoundaryLinesTot(tot)
  }, [boundaryConditions])

  useEffect(() => {
    moment.locale(language)
    setLocale(language === it_IT.locale ? it_IT : en_GB)
  }, [language])

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
          <h3>{t('wildfireSimulation')}</h3>
        </Grid>
        <Grid container style={{ marginBottom: 16, width: '100%' }}>
          <TextField
            id="map-request-title"
            label={t('maps:requestTitleLabel')}
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
              t('maps:requestTitleHelp')
            }
            type="text"
            value={editState.requestTitle || ''}
            onChange={(e) => dispatchEditAction({ type: 'REQUEST_TITLE', value: e.target.value })}
            variant="outlined"
            color="primary"
            fullWidth={true}
          />
        </Grid>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <TextField
              id="hours_of_projection_title"
              label={t('maps:hoursOfProjectionLabel')}
              error={editError && editState.hoursOfProjection < 0}
              helperText={
                editError && editState.hoursOfProjection < 0 && t('maps:hoursOfProjectionHelper')
              }
              type="number"
              value={editState.hoursOfProjection}
              onChange={(e) =>
                dispatchEditAction({ type: 'HOURS_OF_PROJECTION', value: parseInt(e.target.value) })
              }
              variant="outlined"
              color="primary"
              fullWidth={true}
              inputProps={{ min: 1, max: 72 }}
            />
          </Grid>
          <Grid item style={{ marginLeft: 8 }}>
            <Grid container direction="row">
              <Grid item xs={6}>
                <label className={classes.label}>{t('social:starting_date')}</label>
              </Grid>
              <Grid item xs={6}>
                <label className={classes.label}>{t('social:end_date')}</label>
              </Grid>
            </Grid>
            <LocaleProvider locale={locale}>
              <DatePicker
                getCalendarContainer={(trigger) => trigger.parentNode as HTMLElement}
                format={'ddd DD MMMM YYYY - HH:mm'}
                showTime={{
                  defaultValue: moment(moment(startDate), 'HH:mm'),
                  format: 'HH:mm'
                }}
                placeholder={t('social:starting_date')}
                value={moment(startDate)}
                defaultValue={moment(startDate)}
                onChange={onStartChange}
                allowClear
                style={{ width: 245 }}
                locale={locale}
              />
              <DatePicker
                getCalendarContainer={(trigger) => trigger.parentNode as HTMLElement}
                format={'ddd DD MMMM YYYY - HH:mm'}
                showTime={{
                  defaultValue: moment(moment(endDate), 'HH:mm'),
                  format: 'HH:mm'
                }}
                placeholder={t('social:end_date')}
                value={editState.endDate !== null ? moment(endDate) : null}
                defaultValue={editState.endDate !== null ? moment(endDate) : null}
                style={{ width: 245 }}
                locale={locale}
                disabled
              />
            </LocaleProvider>
          </Grid>
        </Grid>
        <Grid container style={{ marginBottom: 16, width: '100%' }}>
          <FormControl margin="normal" style={{ minWidth: '100%' }}>
            <InputLabel id="select-datatype-label">{t('maps:layer')}</InputLabel>
            <Select
              labelId="select-datatype-label"
              id="select-datatype"
              value={editState.dataType}
              multiple={true}
              error={editError && editState.dataType.length < 1}
              renderValue={(selected) =>
                (selected as string[]).map((id) => dataTypeOptions[id]).join(', ')
              }
              onChange={(event) => {
                dispatchEditAction({ type: 'DATATYPE', value: event.target.value })
              }}
            >
              {Object.entries(dataTypeOptions)
                .sort((a, b) => {
                  if (a[1] < b[1]) return -1
                  else if (a[1] < b[1]) return 1
                  else return 0
                })
                .map((e) => (
                  <MenuItem key={e[0]} value={e[0]}>
                    <Checkbox checked={editState.dataType.indexOf(e[0]) > -1} />
                    <ListItemText primary={e[1]} />
                  </MenuItem>
                ))}
            </Select>
            {editError && editState.dataType.length < 1 ? (
              <FormHelperText style={{ color: '#f44336' }}>
                {t('maps:mandatory_field')}
              </FormHelperText>
            ) : null}
          </FormControl>
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
          />
        </Grid>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          style={{ marginBottom: 16 }}
        >
          <FormControl
            component="fieldset"
            error={
              editError && (!editState.probabilityRange || editState.probabilityRange === null)
            }
          >
            <FormLabel component="legend" style={{ color: 'white' }}>
              {t('maps:probabilityRangeLabel')}
              <Tooltip title={t('maps:probabilityRangeInfo') ?? ''}>
                <IconButton>
                  <InfoIcon fontSize="small"></InfoIcon>
                </IconButton>
              </Tooltip>
            </FormLabel>
            <RadioGroup
              row
              aria-label="probability-range"
              name="probability-range"
              value={editState.probabilityRange}
              onChange={(e) =>
                dispatchEditAction({ type: 'PROBABILITY_RANGE', value: parseFloat(e.target.value) })
              }
            >
              <FormControlLabel value={0.5} control={<Radio />} label="50%" />
              <FormControlLabel value={0.75} control={<Radio />} label="75%" />
              <FormControlLabel value={0.9} control={<Radio />} label="90%" />
            </RadioGroup>
            {editError && (!editState.probabilityRange || editState.probabilityRange === null) && (
              <FormHelperText error>{t('maps:probabilityRangeHelp')}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid container direction="row">
          <FormControl component="fieldset" margin="none" style={{ marginLeft: -18 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editState.simulationFireSpotting}
                  name="simulation-fire-spotting"
                  onChange={(e) =>
                    dispatchEditAction({
                      type: 'SIMULATION_FIRE_SPOTTING',
                      value: e.target.checked
                    })
                  }
                />
              }
              label={t('simulationFireSpottingLabel')}
              labelPlacement="start"
            />
          </FormControl>
        </Grid>
        <Grid container direction="row">
          <h4>{t('boundaryConditionsLabel')}</h4>
        </Grid>
        <Grid container direction="row" spacing={1}>
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
              setFireBreakType={setFireBreakType}
              otherTimeOffsets={editState.boundaryConditions.map((e) => e.timeOffset)}
              setToRemoveLineIdx={setToRemoveLineIdx}
              setToRemoveBoundaryConditionIdx={setToRemoveBoundaryConditionIdx}
            />
          ))}
          <Grid item>
            {editState.hoursOfProjection > 1 &&
            editState.boundaryConditions.length < editState.hoursOfProjection ? (
              <IconButton onClick={() => dispatchEditAction({ type: 'BOUNDARY_CONDITION_ADD' })}>
                <AddCircle></AddCircle>
              </IconButton>
            ) : undefined}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6} style={{ minWidth: 600 }}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid item xs={10}>
            <Alert severity={areaSelectionStatus}>{t(`maps:${areaSelectionStatusMessage}`)}</Alert>
          </Grid>
          <Grid item xs={2}>
            <Tooltip title={t('maps:drawPoint') ?? ''}>
              <IconButton onClick={() => setWildfireMapMode('editPoint')}>
                <ScatterPlot></ScatterPlot>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('maps:draw_polygon_msg') ?? ''}>
              <IconButton onClick={() => setWildfireMapMode('edit')}>
                <Gesture></Gesture>
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        <MapStateContextProvider<MapFeature>>
          <MapRequestDrawFeature
            mapRequestType={type}
            customMapMode={wildfireMapMode}
            lineIdx={boundaryConditionIdx}
            areaSelectedAlertHandler={setAreaSelectionStatus}
            mapSelectionCompletedHandler={setMapSelectionCompleted}
            mapSelectionNotCompletedHandler={unsetMapSelectionCompleted}
            setMapAreaHandler={setMapArea}
            setBoundaryLineHandler={setBoundaryLine}
            toRemoveLineIdx={toRemoveLineIdx}
            setToRemoveLineIdx={setToRemoveLineIdx}
            toRemoveBoundaryConditionIdx={toRemoveBoundaryConditionIdx}
            setToRemoveBoundaryConditionIdx={setToRemoveBoundaryConditionIdx}
            boundaryLinesTot={boundaryLinesTot}
            mapSelectedFeatures={mapFeatures}
          />
        </MapStateContextProvider>
        <Grid container direction="row">
          <TextField
            id="aoi"
            fullWidth
            variant="outlined"
            multiline
            value={areaOfInterestWKT}
            onChange={aoiWKTOnChangeHandler}
            error={aoiWKTError}
            helperText={aoiWKTError ? t('maps:invalidWkt') : ''}
            placeholder={t('maps:wktHelp')}
          />
        </Grid>
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
    setBoundaryConditionIdx,
    setFireBreakType,
    otherTimeOffsets,
    setToRemoveLineIdx,
    setToRemoveBoundaryConditionIdx
  } = props

  const { fireBreakType } = editState

  const removeBoundaryCondition = () => {
    dispatchEditAction({ type: 'BOUNDARY_CONDITION_REMOVE', value: { index: index } })
    setToRemoveBoundaryConditionIdx(index)
  }

  useEffect(() => {
    if (fireBreakType && !Object.keys(fireBreakType)[0]) {
      setToRemoveLineIdx(index)
    }
  }, [fireBreakType])

  return (
    <Grid item xs={4}>
      <Grid item style={{ marginBottom: 16 }}>
        <TextField
          id="time-offset"
          label={t('maps:timeOffsetLabel')}
          error={
            editError &&
            (parseInt(editState.timeOffset) < 0 ||
              otherTimeOffsets.filter((e, idx) => otherTimeOffsets.indexOf(e) !== idx).length > 0)
          }
          helperText={editError && parseInt(editState.timeOffset) < 0 && t('maps:timeOffsetHelp')}
          type="number"
          disabled={index === 0}
          value={index === 0 ? 0 : editState.timeOffset}
          onChange={(e) =>
            dispatchEditAction({
              type: 'BOUNDARY_CONDITION_EDIT',
              value: { index: index, property: 'timeOffset', newValue: parseInt(e.target.value) }
            })
          }
          variant="outlined"
          color="primary"
          fullWidth={true}
          inputProps={{ min: 0, max: parseInt(hoursOfProjection) - 1 }}
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
              type: 'BOUNDARY_CONDITION_EDIT',
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
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="fire-break-type-select-label">{t('maps:fireBreakLabel')}</InputLabel>
          <Select
            labelId="fire-break-type-select-label"
            id="fire-break-type-select"
            autoWidth
            value={
              editState.fireBreakType && Object.keys(editState.fireBreakType).length > 0
                ? Object.keys(editState.fireBreakType)[0]
                : ''
            }
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
            <MenuItem value={''}>&nbsp;</MenuItem>
            <MenuItem value={FireBreakType.CANADAIR}>Canadair</MenuItem>
            <MenuItem value={FireBreakType.HELICOPTER}>Helicopter</MenuItem>
            <MenuItem value={FireBreakType.WATERLINE}>Water Line</MenuItem>
            <MenuItem value={FireBreakType.VEHICLE}>Vehicle</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item style={{ marginBottom: 16 }}>
        {editState.fireBreakType &&
        Object.keys(editState.fireBreakType).length > 0 &&
        Object.keys(editState.fireBreakType)[0] ? (
          <Tooltip title={t('maps:drawLine')}>
            <span>
              <IconButton
                disabled={Object.keys(editState.fireBreakType).length < 1}
                onClick={() => {
                  setWildfireMapMode('editLine')
                  setBoundaryConditionIdx(index)
                  setFireBreakType(Object.keys(editState.fireBreakType)[0])
                }}
                style={{ color: lineColors[index > 5 ? index % 6 : index] }}
              >
                <Timeline></Timeline>
              </IconButton>
            </span>
          </Tooltip>
        ) : undefined}
        {index > 0 ? (
          <IconButton onClick={removeBoundaryCondition}>
            <Delete></Delete>
          </IconButton>
        ) : undefined}
      </Grid>
    </Grid>
  )
}
