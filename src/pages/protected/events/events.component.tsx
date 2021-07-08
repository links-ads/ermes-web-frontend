import { CircularProgress, Grid, Paper, Typography } from '@material-ui/core';
import { useState, useEffect, useRef, useMemo, useContext } from 'react';

import useFilters from '../../../hooks/use-filters.hook'
import useSocialStat from '../../../hooks/use-social-stats.hook'

import SocialFilter from '../../../common/filters/filters';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { LanguageCard, PieChartStats, VolumeCard,parseStats } from '../../../common/stats-cards.components';

import { useTranslation } from 'react-i18next'
import useEventsAnnotations from '../../../hooks/use-event-annotation.hook';
import EventMap from './map/map-layout.component';
import { FiltersType } from '../../../common/filters/reducer';
import { CardsList } from '../../../common/cards-list.components';
import { EventCard } from './card/event-card.component';
import InteractiveMap from 'react-map-gl';
import React from 'react';
import { AppConfig, AppConfigContext } from '../../../config';
import { filterApplyHandler, getDefaultFilterArgs, getSocialDashboardStyle, showMoreSocialData, _MS_PER_DAY } from '../../../utils/utils.common';
import { Spiderifier } from '../../../utils/map-spiderifier.utils';

const PAGE_SIZE = 1000
const MINI_PAGE_SIZE = 20


const EventsComponent = (props) => {

    const useStyles = makeStyles((theme: Theme) => createStyles(getSocialDashboardStyle(theme)));

    const classes = useStyles();

    const [eventAnnotations, fetchEvents] = useEventsAnnotations()
    const [filtersState, fetchFilters] = useFilters()
    const [eventStats, fetchEventsStat] = useSocialStat('EVENTS')
    const [mapLeftClickState, setMapLeftClickState] = useState({ showPoint: false, clickedPoint: null as any, pointFeatures: {} })
    const [mapHoverState,setMapHoverState] = useState({set:false})
    const appConfig = useContext<AppConfig>(AppConfigContext)
    const mapConfig = appConfig.mapboxgl
    const mapRef = useRef<InteractiveMap>(null)
    const { t } = useTranslation(['social'])
    const [shownData, setShownData] = useState({ size: 0, data: [] as any[] })
    const spiderifierRef = useRef<Spiderifier | null>(null)
    const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
    const [filterArgs, setFilterArgs] = useState<FiltersType>(getDefaultFilterArgs(mapConfig))

    useEffect(() => {
        fetchFilters()
    }, [fetchFilters])

    useEffect(() => {
        fetchEventsStat(filterArgs)
        fetchEvents(filterArgs, PAGE_SIZE, false, (data) => { return data }, [], (data) => { return data })
    }, [filterArgs])

    useEffect(() => {
        setShownData({ size: MINI_PAGE_SIZE, data: [...eventAnnotations.data].splice(0, MINI_PAGE_SIZE) })
    }, [eventAnnotations.data])

    const infoCount = useMemo(() => { return parseStats(eventStats.stats.info_count, filtersState.mapIdsToInfos) },
        [eventStats.stats.info_count, filtersState.mapIdsToInfos])

    const hazardCount = useMemo(() => { return parseStats( eventStats.stats.hazard_count,filtersState.mapIdsToHazards) },
        [filtersState.mapIdsToHazards, eventStats.stats.hazard_count]
    )

    return (
        <Grid container direction="column" justify="flex-start" alignContent='space-around'>
            <Grid style={{margin:8}} item lg='auto' sm='auto' xl='auto'>
                <SocialFilter
                    onFilterApply={(args)=>filterApplyHandler(args,filterArgs,setFilterArgs,mapRef)}
                    hazardNames={filtersState.hazardNames}
                    infoNames={filtersState.infoNames}
                    mapHazardsToIds={filtersState.mapHazardsToIds}
                    mapInfosToIds={filtersState.mapInfosToIds}
                    renderInformative={false}
                    isError={filtersState.error}
                    filters={filterArgs}
                />
            </Grid>
            <Grid container direction="row" justify="flex-start" alignContent='space-around' >
                <Grid className={classes.tweetsStatContainer} item lg='auto' sm='auto' xl='auto' style={{ flex: 3 }}>
                    <Grid className={classes.infoContainer} container item direction="row" justify="flex-start" alignContent="space-between">
                        <Grid style={{ flex: 1 }} item   >
                            <VolumeCard isLoading={eventStats.isLoading} isError={eventStats.error} label={t("social:tweets_count")} value={eventStats.stats.events_count} />
                        </Grid>
                    </Grid>
                    <Grid className={classes.tweetsListContainer} item >
                        <CardsList
                            data={shownData.data}
                            isLoading={eventAnnotations.isLoading}
                            hasMore={shownData.size < eventAnnotations.data.length}
                            isError={eventAnnotations.error}
                            moreData={() => showMoreSocialData(shownData,eventAnnotations.data,MINI_PAGE_SIZE,setShownData)}
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
                    </Grid>
                </Grid>
                <Grid container className={classes.tweetsStatContainer} direction="column" item style={{ flex: 7 }}>
                    <Grid className={classes.infoContainer} container item direction="row" justify="flex-start" alignContent="space-between">
                        <Grid container direction='column' justify='space-between' style={{ flex: 1 }}>
                            <Paper elevation={6} style={{ margin: '8px 0px', width: '100%', padding: '2px 8px' }}>
                                <Typography variant='subtitle1' align='center'>{t("social:language_count_label")}</Typography>
                            </Paper>
                            <Grid container direction='row' justify='center'>
                                {
                                    eventStats.isLoading ? (<Grid style={{ flex: 1 }} container justify="center" >
                                        <CircularProgress />
                                    </Grid>) :
                                        (eventStats.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                            (Object.entries(eventStats.stats.languages_count).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) : Object.entries(eventStats.stats.languages_count).map(tuple => {
                                                return (
                                                    <Grid key={tuple[0]} style={{ flex: 1, maxWidth: 400 }} item  >
                                                        <LanguageCard label={t("social:lang_" + tuple[0])} value={tuple[1]} />
                                                    </Grid>
                                                )
                                            })
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid style={{ flex: 1, width: '100%', height: '90%' }} container justify='space-evenly'>
                        <EventMap
                            fetchingArgs={filterArgs}
                            mapIdsToHazards={filtersState.mapIdsToHazards}
                            mapIdsToInfos={filtersState.mapIdsToInfos}
                            mapRef={mapRef}
                            leftClickState={mapLeftClickState}
                            setLeftClickState={setMapLeftClickState}
                            data={eventAnnotations.data}
                            isLoading={eventAnnotations.isLoading}
                            isError={eventAnnotations.error}
                            filterApplyHandler={(args)=>filterApplyHandler(args,filterArgs,setFilterArgs,mapRef)}
                            mapHoverState={mapHoverState}
                            spiderifierRef={spiderifierRef}
                            spiderLayerIds={spiderLayerIds}
                            setSpiderLayerIds={setSpiderLayerIds}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid container direction='row' justify='space-evenly'>
                <Grid style={{ flex: 1 }} item >
                    <Paper elevation={6} style={{ margin: '8px' }}>
                        <Grid container direction='column'>
                            <Grid item>
                                <Typography variant='h6' align='center'>
                                    {t("social:label_hazard_count")}
                                </Typography>
                            </Grid>
                            {
                                (eventStats.error || filtersState.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                    (eventStats.isLoading) ? (<Grid container style={{ padding: 8 }} justify='center'> <CircularProgress /> </Grid>) :
                                        (Object.entries(hazardCount).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) :
                                            (<div className={classes.pieContainer}>
                                                <PieChartStats
                                                    prefix='labels:'
                                                    data={hazardCount} />
                                            </div>)
                            }
                        </Grid>
                    </Paper>
                </Grid>
                <Grid style={{ flex: 1 }} item >
                    <Paper elevation={6} style={{ margin: '8px' }}>
                        <Grid container direction='column'>
                            <Grid item><Typography variant='h6' align='center'>{t("social:label_info_count")}</Typography></Grid>
                            {
                                (eventStats.error || filtersState.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                    (eventStats.isLoading) ? (<Grid container style={{ padding: 8 }} justify='center'> <CircularProgress /></Grid>) :
                                        (Object.entries(infoCount).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) :
                                            (<div className={classes.pieContainer}>
                                                <PieChartStats
                                                    prefix='labels:'
                                                    data={infoCount} />
                                            </div>)
                            }
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default EventsComponent;