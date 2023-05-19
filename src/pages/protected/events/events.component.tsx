import { CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { useState, useEffect, useRef, useMemo, useContext } from 'react';

import useFilters from '../../../hooks/use-filters.hook'
import useSocialStat from '../../../hooks/use-social-stats.hook'

import { Theme } from '@mui/material/styles';
import { PieChartStats, VolumeCard, parseStats } from '../../../common/stats-cards.components';

import { useTranslation } from 'react-i18next'
import useEventsAnnotations from '../../../hooks/use-event-annotation.hook';
import EventMap from './map/map-layout.component';
import { CardsList } from '../../../common/cards-list.components';
import { EventCard } from './card/event-card.component';
import InteractiveMap from 'react-map-gl';
import React from 'react';
import { AppConfig, AppConfigContext } from '../../../config';
import { filterObjApplyHandler, getDefaultFilterArgs, getSocialDashboardStyle, showMoreSocialData } from '../../../utils/utils.common';
import { Spiderifier } from '../../../utils/map-spiderifier.utils';

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TabPanel, a11yProps, handleTabChange } from '../../../common/common.components';
import { useMemoryState } from '../../../hooks/use-memory-state.hook';
import { makeStyles } from 'tss-react/mui';

const PAGE_SIZE = 1000
const MINI_PAGE_SIZE = 20


const EventsComponent = (props) => {

    const useStyles = makeStyles()((theme: Theme) => { return getSocialDashboardStyle(theme) });

    const {classes} = useStyles();

    const [eventAnnotations, fetchEvents] = useEventsAnnotations()
    const [filtersState, fetchFilters] = useFilters()
    const [eventStats, fetchEventsStat] = useSocialStat('EVENTS')
    const [mapLeftClickState, setMapLeftClickState] = useState({ showPoint: false, clickedPoint: null as any, pointFeatures: {} })
    const [mapHoverState, setMapHoverState] = useState({ set: false })
    const appConfig = useContext<AppConfig>(AppConfigContext)
    const mapConfig = appConfig.mapboxgl
    const mapRef = useRef<InteractiveMap>(null)
    const { t } = useTranslation(['social', 'labels'])
    const [shownData, setShownData] = useState({ size: 0, data: [] as any[] })
    const spiderifierRef = useRef<Spiderifier | null>(null)
    const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
    const [tabValue, setTabValue] = React.useState(0);

    const [eventFiltersMem, setEventFiltersMem, , ] = useMemoryState('memstate-event', JSON.stringify(getDefaultFilterArgs(mapConfig)))
    const [eventFiltersState, setEventFiltersState] = useState(JSON.parse(eventFiltersMem!))

    useEffect(() => {
        fetchFilters()
    }, [fetchFilters])

    useEffect(() => {
        fetchEventsStat(eventFiltersState)
        fetchEvents(eventFiltersState, PAGE_SIZE, false, (data) => { return data }, [], (data) => { return data },eventAnnotations)
    }, [eventFiltersState,fetchEventsStat,fetchEvents])

    useEffect(() => {
        setShownData({ size: MINI_PAGE_SIZE, data: [...eventAnnotations.data].splice(0, MINI_PAGE_SIZE) })
    }, [eventAnnotations.data])

    const infoCount = useMemo(() => { return parseStats(eventStats.stats.info_count, filtersState.mapIdsToInfos) },
        [eventStats.stats.info_count, filtersState.mapIdsToInfos])

    const hazardCount = useMemo(() => { return parseStats(eventStats.stats.hazard_count, filtersState.mapIdsToHazards) },
        [filtersState.mapIdsToHazards, eventStats.stats.hazard_count]
    )

    return (
      <Grid container direction="column" justifyContent="flex-start" alignContent='space-around' style={{height:'100%'}}>
      <Grid container direction="row" justifyContent="flex-start" alignContent='space-around' style={{height:'100%'}}>
          <Grid
            className={classes.tweetsStatContainer}
            item
            lg="auto"
            sm="auto"
            xl="auto"
            style={{ flex: 3 }}
          >
            <AppBar position="static" color="default" className={classes.appbar}>
              <Tabs
                value={tabValue}
                onChange={(evt, value) => handleTabChange(evt, value, setTabValue)}
                indicatorColor="primary"
                color="white"
                classes={{ indicator: classes.indicator }}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                <Tab label={t('social:events_label')} {...a11yProps(0)} />
                <Tab label={t('social:stats_label')} {...a11yProps(1)} />
              </Tabs>
            </AppBar>
            <TabPanel value={tabValue} index={0}>
              <CardsList
                data={shownData.data}
                isLoading={eventAnnotations.isLoading}
                hasMore={shownData.size < eventAnnotations.data.length}
                isError={eventAnnotations.error}
                moreData={() =>
                  showMoreSocialData(shownData, eventAnnotations.data, MINI_PAGE_SIZE, setShownData)
                }
                renderItem={(item) => (
                  <EventCard
                    item={item}
                    key={item.id}
                    mapIdsToHazards={filtersState.mapIdsToHazards}
                    mapIdsToInfos={filtersState.mapIdsToInfos}
                    mapRef={mapRef}
                    leftClickState={mapLeftClickState}
                    setLeftClickState={setMapLeftClickState}
                    setMapHoverState={setMapHoverState}
                    spiderifierRef={spiderifierRef}
                    spiderLayerIds={spiderLayerIds}
                  />
                )}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <div
                style={{
                  width: '100%',
                  height: '80vh',
                  minHeight: 400,
                  overflow: 'auto'
                }}
              >
                <VolumeCard
                  isLoading={eventStats.isLoading}
                  isError={eventStats.error}
                  label={t('social:tweets_count')}
                  value={eventStats.stats.events_count}
                />
                <Paper elevation={6} style={{ marginBottom: '8px' }}>
                  <Grid container direction="column">
                    <Grid item>
                      <Typography variant="subtitle1" align="center">
                        {t('social:language_count_label')}
                      </Typography>
                    </Grid>
                    {eventStats.isLoading ? (
                      <Grid style={{ flex: 1 }} container justifyContent="center">
                        <CircularProgress />
                      </Grid>
                    ) : eventStats.error ? (
                      <Typography style={{ margin: 4 }} align="center" variant="caption">
                        {t('social:fetch_error')}
                      </Typography>
                    ) : Object.entries(eventStats.stats.languages_count).length === 0 ? (
                      <Typography style={{ margin: 4 }} align="center" variant="caption">
                        {t('social:no_results')}
                      </Typography>
                    ) : (
                      <div className={classes.pieContainer}>
                        <PieChartStats prefix="labels:" data={eventStats.stats.languages_count} />
                      </div>
                    )}
                  </Grid>
                </Paper>
                <Paper elevation={6} style={{ marginBottom: '8px' }}>
                  <Grid container direction="column">
                    <Grid item>
                      <Typography variant="subtitle1" align="center">
                        {t('social:label_hazard_count')}
                      </Typography>
                    </Grid>
                    {eventStats.error || filtersState.error ? (
                      <Typography style={{ margin: 4 }} align="center" variant="caption">
                        {t('social:fetch_error')}
                      </Typography>
                    ) : eventStats.isLoading ? (
                      <Grid container style={{ padding: 8 }} justifyContent="center">
                        {' '}
                        <CircularProgress />{' '}
                      </Grid>
                    ) : Object.entries(hazardCount).length === 0 ? (
                      <Typography style={{ margin: 4 }} align="center" variant="caption">
                        {t('social:no_results')}
                      </Typography>
                    ) : (
                      <div className={classes.pieContainer}>
                        <PieChartStats prefix="labels:" data={hazardCount} />
                      </div>
                    )}
                  </Grid>
                </Paper>
                <Paper elevation={6} style={{ marginBottom: '8px' }}>
                  <Grid container direction="column">
                    <Grid item>
                      <Typography variant="subtitle1" align="center">
                        {t('social:label_info_count')}
                      </Typography>
                    </Grid>
                    {eventStats.error || filtersState.error ? (
                      <Typography style={{ margin: 4 }} align="center" variant="caption">
                        {t('social:fetch_error')}
                      </Typography>
                    ) : eventStats.isLoading ? (
                      <Grid container style={{ padding: 8 }} justifyContent="center">
                        {' '}
                        <CircularProgress />
                      </Grid>
                    ) : Object.entries(infoCount).length === 0 ? (
                      <Typography style={{ margin: 4 }} align="center" variant="caption">
                        {t('social:no_results')}
                      </Typography>
                    ) : (
                      <div className={classes.pieContainer}>
                        <PieChartStats prefix="labels:" data={infoCount} />
                      </div>
                    )}
                  </Grid>
                </Paper>
              </div>
            </TabPanel>
          </Grid>
          <Grid
            container
            className={classes.tweetsStatContainer}
            direction="column"
            item
            style={{ flex: 7 }}
          >
            <Grid style={{ flex: 1, width: '100%' }} container justifyContent="space-evenly">
              <EventMap
                eventFilters={eventFiltersState}
                filtersState={filtersState}
                mapRef={mapRef}
                leftClickState={mapLeftClickState}
                setLeftClickState={setMapLeftClickState}
                data={eventAnnotations.data}
                isLoading={eventAnnotations.isLoading}
                isError={eventAnnotations.error}
                filterObjApplyHandler={(filtersObj) =>
                  filterObjApplyHandler(
                    filtersObj,
                    filtersState.mapHazardsToIds,
                    filtersState.mapInfosToIds,
                    eventFiltersState,
                    mapRef,
                    setEventFiltersMem,
                    setEventFiltersState
                  )
                }
                mapHoverState={mapHoverState}
                spiderifierRef={spiderifierRef}
                spiderLayerIds={spiderLayerIds}
                setSpiderLayerIds={setSpiderLayerIds}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
}

export default EventsComponent;