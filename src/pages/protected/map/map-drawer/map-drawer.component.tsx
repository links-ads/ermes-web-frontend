// Page which manages the tabs in the left drawer

import React, { useEffect, useMemo, useContext, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CardContent,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Slide from '@material-ui/core/Slide'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'

import ReportPanel from './report-panel.component'
import CommunicationPanel from './communication-panel.component'
import PeoplePanel from './people-panel.component'
import MissionsPanel from './missions-panel.component'
import MapRequestsPanel from './map-requests-panel.component'
import { useAPIConfiguration } from '../../../../hooks/api-hooks'
import useAPIHandler from '../../../../hooks/use-api-handler'
import { EntityType, LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import LayerDefinition from '../../../../models/layers/LayerDefinition'
import { FiltersContext } from '../../../../state/filters.context'
import AlertPanel from './alerts-panel.component'
import CamerasPanel from './cameras-panel.component'
import { DialogResponseType, useMapDialog } from '../map-dialog.hooks'
import { EmergencyColorMap, EmergencyProps } from '../api-data/emergency.component'
import { useMapStateContext } from '../map.context'
import { areClickedPointAndSelectedCardEqual } from '../../../../hooks/use-map-drawer.hook'
import SearchBar from '../../../../common/search-bar.component'
import { TabPanel } from '../../../../common/common.components'

const useStyles = makeStyles((theme) => ({
  root: {
    width: 850,
    maxWidth: 450,
    height: '100%',
    backgroundColor: theme.palette.primary.dark,
    position: 'absolute',
    zIndex: 99,
    top: 43
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    // custom style to remove the underline
    '& .MuiInput-underline:before': {
      borderBottom: 'none'
    },
    '& .MuiInput-underline:after': {
      borderBottom: 'none'
    },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
      borderBottom: 'none'
    }
  },
  topBar: {
    marginTop: 5
  },
  customSelect: {
    // custom style to revert order of arrow and text
    '& svg': {
      left: 0
    },
    '& .MuiSelect-root': {
      display: 'flex',
      flexDirection: 'row-reverse',
      paddingRight: 0
    },
    '& .MuiSelect-selectMenu': {
      position: 'relative',
      paddingLeft: 25
    }
  }
}))

export default function MapDrawer(props) {
  const classes = useStyles()
  const theme = useTheme()
  const { t } = useTranslation('maps')
  const {
    mapRequestsSettings,
    updateMapRequestsSettings,
    setMapRequestsSettings,
    availableLayers,
    dataState,
    updateTabIndex,
    selectTabCard,
    updateCardId
  } = props

  // Map state
  const [
    {
      mapMode,
      viewport,
      clickedPoint,
      hoveredPoint,
      rightClickedPoint,
      editingFeatureArea,
      editingFeatureType,
      editingFeatureId,
      goToCoord
    },
    {
      setMapMode,
      setViewport,
      setClickedPoint,
      setHoveredPoint,
      setRightClickedPoint,
      startFeatureEdit,
      clearFeatureEdit,
      setGoToCoord
    }
  ] = useMapStateContext<EmergencyProps>()

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])
  const [apiHandlerState, handleAPICall, resetApiHandlerState] = useAPIHandler(false)
  const filtersCtx = useContext(FiltersContext)
  const { mapDrawerTabVisibility } = filtersCtx
  const { Person, Report, Mission, Communication, MapRequest, Alert, Station } =
    mapDrawerTabVisibility
  // Value to track which tab is selected + functions to handle changes
  const { tabIndex: tabValue, selectedFeatureId, selectedItemsList } = dataState
  const [selectTextColor, setSelectTextColor] = useState<string>('')
  const [selectRenderedText, setSelectRenderedText] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')
  const [prevSearchText, setPrevSearchText] = useState<string>('')
  const [triggerSearch, setTriggerSearch] = useState<boolean>(false)
  const [itemsCounter, setItemsCounter] = useState<number | undefined>(undefined)

  // handle the text changes in the search field
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  // on click of the search button
  const searchInList = () => {
    if (searchText !== undefined && searchText != prevSearchText) {
      setTriggerSearch(true)
      setPrevSearchText(searchText)
    }
  }

  const onCardClick = (selectedItemId) => {
    updateCardId(selectedFeatureId === selectedItemId ? '' : selectedItemId)
  }

  const onFeatureDialogClose = useCallback(
    (status: DialogResponseType) => {
      if (status === 'confirm') {
        props.fetchGeoJson(undefined)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const showFeaturesDialog = useMapDialog(onFeatureDialogClose, null)

  useEffect(() => {
    handleAPICall(() => layersApiFactory.getStaticDefinitionOfLayerList())
  }, [])

  useEffect(() => {
    let tabValueAssigned = false
    if (Person) {
      if (!tabValueAssigned) {
        updateTabIndex(0)
        tabValueAssigned = true
      }
    }
    if (Report) {
      if (!tabValueAssigned) {
        updateTabIndex(1)
        tabValueAssigned = true
      }
    }
    if (Mission) {
      if (!tabValueAssigned) {
        updateTabIndex(2)
        tabValueAssigned = true
      }
    }
    if (Communication) {
      if (!tabValueAssigned) {
        updateTabIndex(3)
        tabValueAssigned = true
      }
    }
    if (MapRequest) {
      if (!tabValueAssigned) {
        updateTabIndex(4)
        tabValueAssigned = true
      }
    }
    if (Alert) {
      if (!tabValueAssigned) {
        updateTabIndex(5)
        tabValueAssigned = true
      }
    }
    if (Station) {
      if (!tabValueAssigned) {
        updateTabIndex(6)
        tabValueAssigned = true
      }
    }
    if (!Person && !Report && !Mission && !Communication && !MapRequest && !Alert && !Station) {
      setIsLoading(false)
      setSelectRenderedText('')
    }
  }, [Person, Report, Mission, Communication, MapRequest, Alert, Station, mapDrawerTabVisibility])

  const layersDefinition = useMemo(() => {
    if (Object.entries(apiHandlerState.result).length === 0) return {}
    else {
      let entries: LayerDefinition = {}
      apiHandlerState.result.data.layerGroups.forEach((group) => {
        group.subGroups.forEach((subGroup) => {
          subGroup.layers.forEach((layer) => {
            if (layer.frequency === 'OnDemand') {
              entries[layer.dataTypeId] = layer.name
            }
          })
        })
      })
      return entries
    }
  }, [apiHandlerState])

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    updateTabIndex(event.target.value as number)
  }

  const handleChangeIndex = (index: number) => {
    updateTabIndex(index)
  }

  // toggle on off drawer
  const onClick = function () {
    props.setToggleDrawerTab(false)
  }

  const updateSelectText = (value) => {
    let renderedText = ''
    switch (value) {
      case 0:
        renderedText = t('maps:tab_persons')
        renderedText += itemsCounter !== undefined ? ` (${itemsCounter})` : ''
        break
      case 1:
        renderedText = t('maps:tab_reports')
        renderedText += itemsCounter !== undefined ? ` (${itemsCounter})` : ''
        break
      case 2:
        renderedText = t('maps:tab_missions')
        renderedText += itemsCounter !== undefined ? ` (${itemsCounter})` : ''
        break
      case 3:
        renderedText = t('maps:tab_stations')
        renderedText += itemsCounter !== undefined ? ` (${itemsCounter})` : ''
        break
      case 4:
        renderedText = t('maps:tab_alerts')
        renderedText += itemsCounter !== undefined ? ` (${itemsCounter})` : ''
        break
      case 5:
        renderedText = t('maps:tab_communications')
        renderedText += itemsCounter !== undefined ? ` (${itemsCounter})` : ''
        break
      case 6:
        renderedText = t('maps:tab_maprequests')
        renderedText += itemsCounter !== undefined ? ` (${itemsCounter})` : ''
        break
      default:
        renderedText = ''
        break
    }
    setSelectRenderedText(renderedText)
  }

  useEffect(() => {
    if (!isLoading && itemsCounter !== undefined) {
      updateSelectText(tabValue)
    }
  }, [isLoading, itemsCounter])

  useEffect(() => {
    switch (tabValue) {
      case 0:
        setSelectTextColor(EmergencyColorMap[EntityType.PERSON])
        break
      case 1:
        setSelectTextColor(EmergencyColorMap[EntityType.REPORT])
        break
      case 2:
        setSelectTextColor(EmergencyColorMap[EntityType.MISSION])
        break
      case 3:
        setSelectTextColor(EmergencyColorMap[EntityType.STATION])
        break
      case 4:
        setSelectTextColor(EmergencyColorMap[EntityType.ALERT])
        break
      case 5:
        setSelectTextColor(EmergencyColorMap[EntityType.COMMUNICATION])
        break
      case 6:
        setSelectTextColor(EmergencyColorMap[EntityType.MAP_REQUEST])
        break
      default:
        setSelectTextColor('')
        break
    }
  }, [tabValue])

  useEffect(() => {
    if (clickedPoint && clickedPoint !== null && clickedPoint.item) {
      if (!areClickedPointAndSelectedCardEqual(clickedPoint, selectedFeatureId)) {
        const clickedItem = clickedPoint.item as EmergencyProps
        selectTabCard(clickedItem)
      }
    } else {
      updateCardId('')
    }
  }, [clickedPoint])

  const noData = (
    <CardContent style={{ height: '90%', overflowX: 'scroll', paddingBottom: '0px' }}>
      <Grid container justifyContent="center">
        <Typography style={{ margin: 4 }} align="center" variant="caption">
          {t('maps:activateFilters')}
        </Typography>
      </Grid>
    </CardContent>
  )
  return (
    <Slide direction="right" in={props.toggleSideDrawer} mountOnEnter unmountOnExit>
      <div className={classes.root}>
        <Grid container direction="row" alignItems="center" className={classes.topBar}>
          <Grid item xs={6}>
            <FormControl className={classes.formControl}>
              <Select
                autoWidth
                value={tabValue}
                renderValue={(value) => selectRenderedText}
                onChange={handleSelectChange}
                style={{ color: selectTextColor }}
                className={classes.customSelect}
              >
                {Person && <MenuItem value={0}>{t('maps:tab_persons')}</MenuItem>}
                {Report && <MenuItem value={1}>{t('maps:tab_reports')}</MenuItem>}
                {Mission && <MenuItem value={2}>{t('maps:tab_missions')}</MenuItem>}
                {Station && <MenuItem value={3}>{t('maps:tab_stations')}</MenuItem>}
                {Alert && <MenuItem value={4}>{t('maps:tab_alerts')}</MenuItem>}
                {Communication && <MenuItem value={5}>{t('maps:tab_communications')}</MenuItem>}
                {MapRequest && <MenuItem value={6}>{t('maps:tab_maprequests')}</MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <SearchBar
              isLoading={isLoading}
              changeTextHandler={handleSearchTextChange}
              clickHandler={searchInList}
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton
              onClick={onClick}
              aria-label="toggle-selection"
              className="mapboxgl-ctrl-icon"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>

        {!Person && !Report && !Mission && !Communication && !MapRequest && !Alert && !Station ? (
          noData
        ) : (
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={tabValue}
            onChangeIndex={handleChangeIndex}
            component={'span'}
          >
            {/* PEOPLE */}
            <TabPanel value={tabValue} index={0} key={'people-' + props.rerenderKey}>
              <PeoplePanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                filters={props.filtersObj.filters.persons}
                teamList={props.teamList}
                selectedCard={selectedFeatureId}
                setSelectedCard={onCardClick}
                updateIsLoadingStatus={setIsLoading}
                searchText={searchText}
                triggerSearch={triggerSearch}
                updateTriggerSearch={setTriggerSearch}
                updateItemsCounter={setItemsCounter}
              />
            </TabPanel>

            {/* REPORTS */}
            <TabPanel value={tabValue} index={1} key={'report-' + props.rerenderKey}>
              <ReportPanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                selectedCard={selectedFeatureId}
                setSelectedCard={onCardClick}
                selectedItemsList={selectedItemsList}
                missionActive={Mission}
                updateIsLoadingStatus={setIsLoading}
                searchText={searchText}
                triggerSearch={triggerSearch}
                updateTriggerSearch={setTriggerSearch}
                updateItemsCounter={setItemsCounter}
              />
            </TabPanel>

            {/* MISSIONS */}
            <TabPanel value={tabValue} index={2} key={'mission-' + props.rerenderKey}>
              <MissionsPanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                missionCounter={props.missionCounter}
                resetListCounter={props.resetListCounter}
                selectedCard={selectedFeatureId}
                setSelectedCard={onCardClick}
                selectedItemsList={selectedItemsList}
                updateIsLoadingStatus={setIsLoading}
                searchText={searchText}
                triggerSearch={triggerSearch}
                updateTriggerSearch={setTriggerSearch}
                updateItemsCounter={setItemsCounter}
              />
            </TabPanel>

            {/* COMMUNICATION */}
            <TabPanel value={tabValue} index={5} key={'comm-' + props.rerenderKey}>
              <CommunicationPanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                communicationCounter={props.communicationCounter}
                resetListCounter={props.resetListCounter}
                selectedCard={selectedFeatureId}
                setSelectedCard={onCardClick}
                selectedItemsList={selectedItemsList}
                updateIsLoadingStatus={setIsLoading}
                searchText={searchText}
                triggerSearch={triggerSearch}
                updateTriggerSearch={setTriggerSearch}
                updateItemsCounter={setItemsCounter}
              />
            </TabPanel>

            {/* MAP REQUESTS */}
            <TabPanel value={tabValue} index={6} key={'map-request-' + props.rerenderKey}>
              <MapRequestsPanel
                filters={props.filtersObj.filters.mapRequests}
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                getLegend={props.getLegend}
                getMeta={props.getMeta}
                fetchGeoJson={props.fetchGeoJson}
                mapRequestsSettings={mapRequestsSettings}
                updateMapRequestsSettings={updateMapRequestsSettings}
                setMapRequestsSettings={setMapRequestsSettings}
                availableLayers={availableLayers}
                layersDefinition={layersDefinition}
                mapRequestCounter={props.mapRequestCounter}
                resetListCounter={props.resetListCounter}
                selectedCard={selectedFeatureId}
                setSelectedCard={onCardClick}
                showFeaturesDialog={showFeaturesDialog}
                selectedItemsList={selectedItemsList}
                updateIsLoadingStatus={setIsLoading}
                searchText={searchText}
                triggerSearch={triggerSearch}
                updateTriggerSearch={setTriggerSearch}
                updateItemsCounter={setItemsCounter}
              />
            </TabPanel>

            {/* ALERTS */}
            <TabPanel value={tabValue} index={4} key={'alert-' + props.rerenderKey}>
              <AlertPanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                selectedCard={selectedFeatureId}
                setSelectedCard={onCardClick}
                flyToCoords={undefined}
                selectedItemsList={selectedItemsList}
                updateIsLoadingStatus={setIsLoading}
                searchText={searchText}
                triggerSearch={triggerSearch}
                updateTriggerSearch={setTriggerSearch}
                updateItemsCounter={setItemsCounter}
              />
            </TabPanel>

            {/* CAMERA */}
            <TabPanel value={tabValue} index={3} key={'camera-' + props.rerenderKey}>
              <CamerasPanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                selectedCard={selectedFeatureId}
                setSelectedCard={onCardClick}
                flyToCoords={undefined}
                updateIsLoadingStatus={setIsLoading}
                searchText={searchText}
                triggerSearch={triggerSearch}
                updateTriggerSearch={setTriggerSearch}
                updateItemsCounter={setItemsCounter}
              />
            </TabPanel>
          </SwipeableViews>
        )}
        <AppBar
          position="static"
          color="default"
          style={{
            backgroundColor: theme.palette.primary.main
          }}
        ></AppBar>
      </div>
    </Slide>
  )
}
