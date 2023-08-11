// Page which manages the tabs in the left drawer

import React, { useEffect, useMemo, useContext, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { CardContent, Grid, IconButton, Typography } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Slide from '@material-ui/core/Slide'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'

import ReportPanel from './report-panel.component'
import CommunicationPanel from './communication-panel.component'
import PeoplePanel from './people-panel.component'
import MissionsPanel from './missions-panel.component'
import MapRequestsPanel from './map-requests-panel.component'
import { useAPIConfiguration } from '../../../../hooks/api-hooks'
import useAPIHandler from '../../../../hooks/use-api-handler'
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import LayerDefinition from '../../../../models/layers/LayerDefinition'
import { FiltersContext } from '../../../../state/filters.context'
import AlertPanel from './alerts-panel.component'
import CamerasPanel from './cameras-panel.component'
import { CameraDetails } from './camera-details.component'
import { DialogResponseType, useMapDialog } from '../map-dialog.hooks'
import { EmergencyProps } from '../api-data/emergency.component'
import { useMapStateContext } from '../map.context'
import useMapDrawer from '../../../../hooks/use-map-drawer.hook'

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
  indicator: {
    backgroundColor: '#FFF'
  },
  hiddenTab: {
    display: 'none',
    visibility: 'hidden'
  }
}))

interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: any
  value: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const TabValuesDict = {
  'Person': 0,
  'Report': 1,
  'Mission': 2, 
  'Communication': 3, 
  'MapRequest': 4, 
  'Alert': 5, 
  'Station': 6
}

export default function MapDrawer(props) {
  const classes = useStyles()
  const theme = useTheme()
  const { t } = useTranslation('maps')
  const {
    mapRequestsSettings,
    updateMapRequestsSettings,
    setMapRequestsSettings,
    availableLayers
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
      goToCoord,
      selectedCard
    },
    {
      setMapMode,
      setViewport,
      setClickedPoint,
      setHoveredPoint,
      setRightClickedPoint,
      startFeatureEdit,
      clearFeatureEdit,
      setGoToCoord,
      setSelectedCard
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
  // const [tabValue, setTabValue] = React.useState(0)
  const [ dataState, updateTabIndex, selectTabCard, addCardToTabList ] = useMapDrawer()
  const { tabIndex: tabValue, selectedFeatureId } = dataState

  const onCardClick = (selectedItemId) => {
    setSelectedCard(selectedCard === selectedItemId ? '' : selectedItemId)
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

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    updateTabIndex(newValue)
  }
  const handleChangeIndex = (index: number) => {
    updateTabIndex(index)
  }

  // toggle on off drawer
  const onClick = function () {
    props.setToggleDrawerTab(false)
  }

  useEffect(() => {
    if (clickedPoint && clickedPoint !== null && clickedPoint.item && props.toggleSideDrawer) {
      const clickedItem = clickedPoint.item as EmergencyProps
      const clickedItemType = clickedItem.type
      const clickedItemId = clickedItem.id
      const newTabValue = TabValuesDict[clickedItemType]
      const selected = clickedItemType + '-' + clickedItemId
      
      if (tabValue !== newTabValue || selectedFeatureId !== selected) {
        selectTabCard(newTabValue, selected)
        if (selectedCard !== selected) {
          onCardClick(selected)
        }
      }
    }
    else {
      setSelectedCard('')
    }
  }, [clickedPoint])

  const noData = (
    <CardContent style={{ height: '90%', overflowX: 'scroll', paddingBottom: '0px' }}>
      <Grid container justifyContent="center">
        <Typography style={{ margin: 4 }} align="center" variant="caption">
          {t('social:no_results')}
        </Typography>
      </Grid>
    </CardContent>
  )
  return (
    <Slide direction="right" in={props.toggleSideDrawer} mountOnEnter unmountOnExit>
      <div className={classes.root}>
        <AppBar
          position="static"
          color="default"
          style={{
            backgroundColor: theme.palette.primary.main,
            boxShadow: 'none'
          }}
        >
          <IconButton
            onClick={onClick}
            aria-label="toggle-selection"
            className="mapboxgl-ctrl-icon"
            style={{ width: '60px', marginLeft: '25px' }}
            // disabled={disabled}
          >
            <ArrowBackIcon />
          </IconButton>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            indicatorColor="primary"
            classes={{ indicator: classes.indicator }}
            color="white"
            variant="scrollable"
            aria-label="full width tabs example"
          >
            <Tab
              value={0}
              label={t('maps:tab_persons')}
              {...a11yProps(0)}
              className={!Person ? classes.hiddenTab : undefined}
            />
            <Tab
              value={1}
              label={t('maps:tab_reports')}
              {...a11yProps(1)}
              className={!Report ? classes.hiddenTab : undefined}
            />
            <Tab
              value={2}
              label={t('maps:tab_missions')}
              {...a11yProps(2)}
              className={!Mission ? classes.hiddenTab : undefined}
            />
            <Tab
              value={3}
              label={t('maps:tab_communications')}
              {...a11yProps(3)}
              className={!Communication ? classes.hiddenTab : undefined}
            />
            <Tab
              value={4}
              label={t('maps:tab_maprequests')}
              {...a11yProps(4)}
              className={!MapRequest ? classes.hiddenTab : undefined}
            />
            <Tab
              value={5}
              label={t('maps:tab_alerts')}
              {...a11yProps(5)}
              className={!Alert ? classes.hiddenTab : undefined}
            />
            <Tab
              value={6}
              label={t('maps:tab_stations')}
              {...a11yProps(6)}
              className={!Station ? classes.hiddenTab : undefined}
            />
          </Tabs>
        </AppBar>

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
                selectedCard={selectedCard}
                setSelectedCard={onCardClick}
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
                selectedCard={selectedCard}
                setSelectedCard={onCardClick}
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
                selectedCard={selectedCard}
                setSelectedCard={onCardClick}
              />
            </TabPanel>

            {/* COMMUNICATION */}
            <TabPanel value={tabValue} index={3} key={'comm-' + props.rerenderKey}>
              <CommunicationPanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                communicationCounter={props.communicationCounter}
                resetListCounter={props.resetListCounter}
                selectedCard={selectedCard}
                setSelectedCard={onCardClick}
              />
            </TabPanel>

            {/* MAP REQUESTS */}
            <TabPanel value={tabValue} index={4} key={'map-request-' + props.rerenderKey}>
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
                selectedCard={selectedCard}
                setSelectedCard={onCardClick}
                showFeaturesDialog={showFeaturesDialog}
              />
            </TabPanel>

            {/* ALERTS */}
            <TabPanel value={tabValue} index={5} key={'alert-' + props.rerenderKey}>
              <AlertPanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                selectedCard={selectedCard}
                setSelectedCard={onCardClick}
                flyToCoords={undefined}
              />
            </TabPanel>

            {/* CAMERA */}
            <TabPanel value={tabValue} index={6} key={'camera-' + props.rerenderKey}>
              <CamerasPanel
                setGoToCoord={setGoToCoord}
                map={props.map}
                setMapHoverState={props.setMapHoverState}
                spiderLayerIds={props.spiderLayerIds}
                spiderifierRef={props.spiderifierRef}
                selectedCard={selectedCard}
                setSelectedCard={onCardClick}
                flyToCoords={undefined}
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
        <CameraDetails />
      </div>
    </Slide>
  )
}
