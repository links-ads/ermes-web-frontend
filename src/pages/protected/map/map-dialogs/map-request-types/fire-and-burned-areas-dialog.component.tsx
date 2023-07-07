import React, { useMemo, useEffect, useRef, useState, useContext } from 'react'

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
  Divider
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
import InteractiveMap, {
  ExtraState,
  GeolocateControl,
  NavigationControl,
  ScaleControl
} from 'react-map-gl'
import { EmergencyProps } from '../../api-data/emergency.component'
import { MapStateContextProvider, MapViewportState, useMapStateContext } from '../../map.contest'
import { MapDraw, MapDrawRefProps } from '../../map-draw.components'
import { useMapPreferences } from '../../../../../state/preferences/preferences.hooks'
import bbox from '@turf/bbox'
import { useSnackbars } from '../../../../../hooks/use-snackbars.hook'
import { CulturalProps } from '../../provisional-data/cultural.component'
import { MapContainer } from '../../common.components'
import { ContainerSize, ContainerSizeContext } from '../../../../../common/size-aware-container.component'
import { useMemoryState } from '../../../../../hooks/use-memory-state.hook'
import { initObjectState } from '../../map-filters-init.state'

type MapFeature = CulturalProps

// import useLanguage from '../../../../hooks/use-language.hook';

export function FiredAndBurnedAreasDialog({
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

  // Click Radius (see react-map-gl)
  const CLICK_RADIUS = 4
  const { mapTheme, transformRequest } = useMapPreferences()
  const mapViewRef = useRef<InteractiveMap>(null)
  const customGetCursor = ({ isDragging, isHovering }: ExtraState) =>
    isDragging ? 'all-scroll' : isHovering ? 'pointer' : 'auto'
  // // Map state
  // const [
  //   {
  //     mapMode,
  //     viewport,
  //     clickedPoint,
  //     hoveredPoint,
  //     rightClickedPoint,
  //     editingFeatureArea,
  //     editingFeatureType,
  //     editingFeatureId
  //   },
  //   {
  //     setMapMode,
  //     setViewport,
  //     setClickedPoint,
  //     setHoveredPoint,
  //     setRightClickedPoint,
  //     startFeatureEdit,
  //     clearFeatureEdit
  //   }
  // ] = useMapStateContext<EmergencyProps>()
  const [mapMode, setMapMode ] = useState('')
  const containerSize = useContext<ContainerSize>(ContainerSizeContext)
  let [storedFilters] = useMemoryState(
    'memstate-map',
    JSON.stringify(JSON.parse(JSON.stringify(initObjectState))),
    false
  )
  const mapBounds = JSON.parse(storedFilters!).filters!.mapBounds
  const [viewport, setViewport] = useState<MapViewportState>({
    width: containerSize.width,
    height: containerSize.height,
    latitude: ((mapBounds.northEast[1] as number) + (mapBounds.southWest[1] as number)) / 2, //0, - TODO from user last known location
    longitude: ((mapBounds.northEast[0] as number) + (mapBounds.southWest[0] as number)) / 2, //0, - TODO from user last known location
    zoom: mapBounds.zoom as number
  })

  // MapDraw
  const mapDrawRef = useRef<MapDrawRefProps>(null)
  // Snackbars
  const { displayMessage, displayWarningSnackbar } = useSnackbars()
  const GEOJSON_LAYER_IDS = ['clusters', 'unclustered-point']
  // Style for the geolocation controls
  const geolocateStyle: React.CSSProperties = {
    position: 'absolute',
    top: 45,
    left: 0,
    margin: 10
  }

  console.debug('datatype', editState.dataType, typeof editState.dataType[0])
  return (
    <Grid container direction="row" spacing={2}>
      <Divider style={{ marginBottom: 16 }} />
      <Grid item xs={6} style={{ minWidth: 600 }}>
        <Grid container direction="row">
          <h3>{t('fire_and_burned_areas')}</h3>
        </Grid>
        <Grid container direction="row" justifyContent="space-around" alignItems="center">
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              style={{ paddingTop: 0, marginTop: 0 }}
              variant="inline"
              format={'dd/MM/yyyy'}
              margin="normal"
              id="start-date-picker-inline"
              label={t('common:date_picker_test_start')}
              value={editState.startDate}
              onChange={(d) => {
                if (d != null) {
                  let d1 = new Date(d?.setHours(0, 0, 0, 0))
                  return dispatchEditAction({ type: 'START_DATE', value: d1 as Date })
                }
              }}
              disableFuture={false}
              autoOk={true}
              // clearable={true}
              InputProps={{
                endAdornment: endAdornment
              }}
            />
            <DatePicker
              style={{ paddingTop: 0, marginTop: 0 }}
              variant="inline"
              format={'dd/MM/yyyy'}
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
              InputProps={{
                endAdornment: endAdornment
              }}
            />
          </MuiPickersUtilsProvider>
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
              {Object.entries(dataTypeOptions).map((e) => (
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
        <Grid container direction="row">
          <Grid item style={{ marginBottom: 16, width: '50%' }}>
            <TextField
              id="frequency-title"
              label={t('maps:frequency_label')}
              error={editError && parseInt(editState.frequency) < 0}
              helperText={
                editError && parseInt(editState.frequency) < 0 && t('maps:frequency_help')
              }
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
              label={t('maps:resolution_label')}
              error={editError && parseInt(editState.resolution) < 0}
              helperText={
                editError && parseInt(editState.resolution) < 0 && t('maps:resolution_help')
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
        {/* <MapStateContextProvider<MapFeature>> */}
        <h5>Please draw on map</h5>
        <MapContainer initialHeight={window.innerHeight} style={{ height: '110%', top: 0 }}>
          <InteractiveMap
            {...viewport}
            doubleClickZoom={false}
            mapStyle={mapTheme?.style}
            onViewportChange={(nextViewport) => setViewport(nextViewport)}
            transformRequest={transformRequest}
            clickRadius={CLICK_RADIUS}
            // onLoad={onMapLoad}
            // interactiveLayerIds={mapLayers}
            // onHover={(evt) => console.debug('Map: mouse Hover', evt)}
            // onMouseEnter={onMouseEnter}
            // onMouseLeave={onMouseLeave}
            // onClick={onMapClick}
            // onDblClick={onMapDoubleClick}
            // onContextMenu={onContextMenu}
            ref={mapViewRef}
            width="100%"
            height="100%" //was  height="calc(100% + 30px)"
            getCursor={customGetCursor}
          >
            <MapDraw
              ref={mapDrawRef}
              onFeatureAdd={(data: GeoJSON.Feature[]) => {
                console.debug('Feature drawn!', data)
                // if (mapDrawRef.current && mapViewRef.current && data.length > 0) {
                //   const map = mapViewRef.current.getMap()
                //   if (mapMode === 'select') {
                //     // min Longitude , min Latitude , max Longitude , max Latitude
                //     // south Latitude, north Latitude, west Longitude, east Longitude
                //     const [minX, minY, maxX, maxY] = bbox(
                //       data[0] as GeoJSON.Feature<GeoJSON.Polygon>
                //     )
                //     const mapFeaturesInTheBox = mapViewRef.current.queryRenderedFeatures(
                //       [map.project([minX, minY]), map.project([maxX, maxY])],
                //       {
                //         layers: GEOJSON_LAYER_IDS
                //       }
                //     )
                //     const clustersCount = mapFeaturesInTheBox.reduce((count, f) => {
                //       if (f?.properties?.cluster === true) {
                //         count++
                //       }
                //       return count
                //     }, 0)
                //     // console.debug('Feature selection', mapFeaturesInTheBox, 'bbox', [
                //     //   minX,
                //     //   minY,
                //     //   maxX,
                //     //   maxY
                //     // ])
                //     displayMessage(
                //       `${mapFeaturesInTheBox.length} features selected, of which ${clustersCount} clusters`
                //     )
                //     mapDrawRef.current?.deleteFeatures(0) // remove square
                //     setTimeout(() => {
                //       // change mode back - timeout needed because of mjolnir.js
                //       // that will otherwise intercept the last click
                //       setMapMode('browse')
                //     }, 500)
                //   } else if (mapMode === 'edit') {
                //     const featurePolygon = data[0] as GeoJSON.Feature<GeoJSON.Polygon>
                //     // shall we also handle multi polygon?
                //     if (editingFeatureType !== null) {
                //       startFeatureEdit(editingFeatureType, editingFeatureId, featurePolygon)
                //     }
                //     // map.getCanvas().style.cursor = ''
                //   }
                // }
              }}
            />
            {/* Map controls */}
            <GeolocateControl
              // ref={geolocationControlsRef}
              label={t('maps:show_my_location')}
              style={geolocateStyle}
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
            />
            <div className="controls-contaniner" style={{ top: 0 }}>
              <NavigationControl />
            </div>
            <div className="controls-contaniner" style={{ bottom: 0 }}>
              <ScaleControl />
            </div>
          </InteractiveMap>
          {/* </MapStateContextProvider> */}
        </MapContainer>
      </Grid>
    </Grid>
  )
}
