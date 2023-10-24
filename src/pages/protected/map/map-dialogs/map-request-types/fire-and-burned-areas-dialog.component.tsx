import React, { useMemo, useEffect, useState } from 'react'

import {
  FormControl,
  TextField,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  FormHelperText
} from '@material-ui/core'
import { GenericDialogProps } from '../../map-dialog-edit.component'
import { useTranslation } from 'react-i18next'
import { useAPIConfiguration } from '../../../../../hooks/api-hooks'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import useAPIHandler from '../../../../../hooks/use-api-handler'
import { _MS_PER_DAY } from '../../../../../utils/utils.common'
import { MapStateContextProvider } from '../../map.context'
import { CulturalProps } from '../../provisional-data/cultural.component'
import MapRequestDrawFeature from './map-request-draw-feature/map-request-draw-feature.component'
import { Alert, Color } from '@material-ui/lab'
import { wktToGeoJSON, geojsonToWKT } from '@terraformer/wkt'
import { feature } from '@turf/helpers'
import RangeDatePicker from '../../../../../common/range-date-picker'

type MapFeature = CulturalProps

export function FiredAndBurnedAreasDialog({
  operationType,
  editState,
  dispatchEditAction,
  editError
}: React.PropsWithChildren<GenericDialogProps>) {
  const { t } = useTranslation(['maps', 'labels'])
  const { mapSelectionCompleted, mapArea, type } = editState
  const [areaSelectionStatus, setAreaSelectionStatus] = useState<Color>('info')
  const [areaSelectionStatusMessage, setAreaSelectionStatusMessage] =
    useState<string>('mapSelectionInfoMessage')
  const [mapFeatures, setMapFeatures] = useState<any[]>(
    mapSelectionCompleted && mapArea && mapArea.geometry.type !== 'Point' ? [{ ...mapArea }] : []
  )
  const [areaOfInterestWKT, setAreaOfIntererstWKT] = useState<string>(
    mapArea && mapArea.geometry && mapArea.geometry.type !== 'Point'
      ? geojsonToWKT(mapArea.geometry)
      : ''
  )
  const [aoiWKTError, setAoiWKTError] = useState<boolean>(false)

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])
  const [apiHandlerState, handleAPICall, resetApiHandlerState] = useAPIHandler(false)
  useEffect(() => {
    handleAPICall(() => layersApiFactory.getStaticDefinitionOfLayerList())
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
      if (mapAreaFeature.geometry.type === 'Polygon') {
        dispatchEditAction({ type: 'MAP_AREA', value: mapAreaFeature })
        setAoiWKTError(false)
      } else {
        setAoiWKTError(true)
      }
    } catch (err) {
      console.error(err)
      setAoiWKTError(true)
    } finally {
      setAreaOfIntererstWKT(newAoiWKT)
    }
  }

  useEffect(() => {
    if (mapArea) {
      const concatFeatures = [{ ...mapArea }]
      setMapFeatures(concatFeatures)
    }
  }, [mapArea])

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
        .filter((l) => l.groupKey === 'fire and burned area map')
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
          <h3>{t('fireAndBurnedAreas')}</h3>
        </Grid>
        <Grid container style={{ marginBottom: 16 }}>
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
        <Grid container direction="row" justifyContent="space-around" alignItems="center">
          <RangeDatePicker
            editState={editState}
            dispatchEditAction={dispatchEditAction}
            maxDaysRangeDate={30}
          />
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
        <Grid container direction="row">
          <Grid item style={{ marginBottom: 16, width: '50%' }}>
            <TextField
              id="frequency-title"
              label={t('maps:frequencyLabel')}
              error={editError && parseInt(editState.frequency) < 0}
              helperText={editError && parseInt(editState.frequency) < 0 && t('maps:frequencyHelp')}
              type="number"
              value={editState.frequency}
              onChange={(e) => dispatchEditAction({ type: 'FREQUENCY', value: e.target.value })}
              variant="outlined"
              color="primary"
              fullWidth={true}
              inputProps={{ min: 0, max: 30 }}
            />
          </Grid>
          <Grid item style={{ marginBottom: 16, width: '50%' }}>
            <TextField
              id="resolution-title"
              label={t('maps:resolutionLabel')}
              error={editError && parseInt(editState.resolution) < 0}
              helperText={
                editError && parseInt(editState.resolution) < 0 && t('maps:resolutionHelp')
              }
              type="number"
              value={editState.resolution}
              onChange={(e) => dispatchEditAction({ type: 'RESOLUTION', value: e.target.value })}
              variant="outlined"
              color="primary"
              fullWidth={true}
              inputProps={{ min: 10, max: 60 }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6} style={{ minWidth: 600 }}>
        <Alert severity={areaSelectionStatus}>{t(`maps:${areaSelectionStatusMessage}`)}</Alert>
        <MapStateContextProvider<MapFeature>>
          <MapRequestDrawFeature
            mapRequestType={type}
            areaSelectedAlertHandler={setAreaSelectionStatus}
            mapSelectionCompletedHandler={setMapSelectionCompleted}
            mapSelectionNotCompletedHandler={unsetMapSelectionCompleted}
            setMapAreaHandler={setMapArea}
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
