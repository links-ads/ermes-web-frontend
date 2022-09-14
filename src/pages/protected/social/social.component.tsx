import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@material-ui/core/Grid';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';


import CircularProgress from '@material-ui/core/CircularProgress';

import { useTranslation } from 'react-i18next'

import { VolumeCard, InformativeCard, PieChartStats, parseStats } from '../../../common/stats-cards.components'
import { Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

import SocialMap from './map/map-layout.component';
import { filterObjApplyHandler, getDefaultFilterArgs, getSocialDashboardStyle, showMoreSocialData } from '../../../utils/utils.common';
import InteractiveMap from 'react-map-gl';

import useFilters from '../../../hooks/use-filters.hook'
import useSocialStat from '../../../hooks/use-social-stats.hook';
import useTweetsAnnotations from '../../../hooks/use-tweet-annotation.hook';

import { CardsList } from '../../../common/cards-list.components';

import { TweetCard } from './card/tweet-card-component';
import { AppConfig, AppConfigContext } from '../../../config';
import { Spiderifier } from '../../../utils/map-spiderifier.utils';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { TabPanel, a11yProps, handleTabChange } from '../../../common/common.components';
import { useMemoryState } from '../../../hooks/use-memory-state.hook';

const PAGE_SIZE = 30000
const MINI_PAGE_SIZE = 20

const SocialComponent = (props) => {
    const useStyles = makeStyles((theme: Theme) => createStyles(getSocialDashboardStyle(theme)));

    const classes = useStyles();

    const { t } = useTranslation(['social','labels'])
    const mapRef = useRef<InteractiveMap>(null)
    const spiderifierRef = useRef<Spiderifier | null>(null)
    const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
    const appConfig = useContext<AppConfig>(AppConfigContext)
    const mapConfig = appConfig.mapboxgl
    const [mapLeftClickState, setMapLeftClickState] = useState({ showPoint: false, clickedPoint: null as any, pointFeatures: {} })
    const [tweetsStats, fetchTweetsStat] = useSocialStat('TWEETS')
    const [tweetAnnotations, fetchTweetAnnotations] = useTweetsAnnotations()
    const [filtersState, fetchFilters] = useFilters()
    const [shownData, setShownData] = useState({ size: 0, data: [] as any[] })
    const [tabValue, setTabValue] = React.useState(0);
    
    const [socialFiltersMem, setSocialFiltersMem, , ] = useMemoryState('memstate-social',JSON.stringify(getDefaultFilterArgs(mapConfig)))
    const [socialFiltersState, setSocialFiltersState] = useState(JSON.parse(socialFiltersMem!))


    useEffect(() => {
        fetchFilters()
    }, [fetchFilters])
    
    useEffect(() => {
        fetchTweetsStat(socialFiltersState)
        fetchTweetAnnotations(socialFiltersState, PAGE_SIZE, false, (data) => { return data }, [], (data) => { return data })
    }, [socialFiltersState])

    useEffect(() => {
        setShownData({ size: MINI_PAGE_SIZE, data: [...tweetAnnotations.data].splice(0, MINI_PAGE_SIZE) })
    }, [tweetAnnotations.data])

    const infoCount = useMemo(() => { return parseStats(tweetsStats.stats.info_count, filtersState.mapIdsToInfos) },
        [tweetsStats.stats.info_count, filtersState.mapIdsToInfos])

    const hazardCount = useMemo(() => { return parseStats(tweetsStats.stats.hazard_count, filtersState.mapIdsToHazards) },
        [filtersState.mapIdsToHazards, tweetsStats.stats.hazard_count]
    )

    return (
        <Grid container direction="column" justifyContent="flex-start" alignContent='space-around' style={{height:'100%'}}>
            <Grid container direction="row" justifyContent="flex-start" alignContent='space-around' style={{height:'100%'}}>
                <Grid className={classes.tweetsStatContainer} item lg='auto' sm='auto' xl='auto' style={{ flex: 3}}>
                    <AppBar position="static" color="default" className={classes.appbar}>
                        <Tabs
                            value={tabValue}
                            onChange={(evt, value) => handleTabChange(evt, value, setTabValue)}
                            indicatorColor="primary"
                            color='white'
                            classes={{ indicator: classes.indicator }}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="scrollable auto tabs example"
                        >
                            <Tab label={t("social:tweets_label")} {...a11yProps(0)} />
                            <Tab label={t("social:stats_label")} {...a11yProps(1)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={tabValue} index={0}>
                        <CardsList
                            data={shownData.data}
                            isLoading={tweetAnnotations.isLoading}
                            isError={tweetAnnotations.error}
                            hasMore={shownData.size < tweetAnnotations.data.length}
                            moreData={() => showMoreSocialData(shownData, tweetAnnotations.data, MINI_PAGE_SIZE, setShownData)}
                            renderItem={(item) => (
                                <TweetCard
                                    item={item}
                                    key={item.id}
                                    mapIdsToHazards={filtersState.mapIdsToHazards}
                                    mapIdsToInfos={filtersState.mapIdsToInfos}
                                    mapRef={mapRef}
                                    mapLeftClickState={mapLeftClickState}
                                    setMapLeftClickState={setMapLeftClickState}
                                    spiderifierRef={spiderifierRef}
                                    spiderLayerIds={spiderLayerIds}
                                />
                            )}
                        />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <div style={{
                            width: '100%',
                            height: '80vh', minHeight: 400,
                            overflow: "auto"
                        }}>
                            <VolumeCard isLoading={tweetsStats.isLoading} isError={tweetsStats.error} label={t("social:tweets_count")} value={tweetsStats.stats.tweets_count} />
                            <InformativeCard isLoading={tweetsStats.isLoading} isError={tweetsStats.error} label={t("social:informative_info")} value={tweetsStats.stats.informativeness_ratio} />
                            <Paper elevation={6} style={{ marginBottom: '8px' }}>
                                <Grid container direction='column'>
                                    <Grid item><Typography variant='subtitle1' align='center'>{t("social:language_count_label")}</Typography></Grid>
                                    {
                                        tweetsStats.isLoading ? (<Grid style={{ flex: 1 }} container justifyContent="center" >
                                            <CircularProgress />
                                        </Grid>) :
                                            (tweetsStats.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                                (Object.entries(tweetsStats.stats.languages_count).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) :
                                                    (<div className={classes.pieContainer}>
                                                        <PieChartStats
                                                            prefix='labels:'
                                                            data={tweetsStats.stats.languages_count} />
                                                    </div>)
                                    }
                                </Grid>
                            </Paper>
                            <Paper elevation={6} style={{ marginBottom: '8px' }}>
                                <Grid container direction='column'>
                                    <Grid item>
                                        <Typography variant='subtitle1' align='center'>
                                            {t("social:label_hazard_count")}
                                        </Typography>
                                    </Grid>
                                    {
                                        (tweetsStats.error || filtersState.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                            (tweetsStats.isLoading) ? (<Grid container style={{ padding: 8 }} justifyContent='center'> <CircularProgress /> </Grid>) :
                                                (Object.entries(hazardCount).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) :
                                                    (<div className={classes.pieContainer}>
                                                        <PieChartStats
                                                            prefix='labels:'
                                                            data={hazardCount} />
                                                    </div>)
                                    }
                                </Grid>
                            </Paper>
                            <Paper elevation={6} style={{ marginBottom: '8px' }}>
                                <Grid container direction='column'>
                                    <Grid item><Typography variant='subtitle1' align='center'>{t("social:label_info_count")}</Typography></Grid>
                                    {
                                        (tweetsStats.error || filtersState.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                            (tweetsStats.isLoading) ? <Grid container style={{ padding: 8 }} justifyContent='center'> <CircularProgress /></Grid> :
                                                (Object.entries(infoCount).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) :
                                                    (<div className={classes.pieContainer}>
                                                        <PieChartStats
                                                            prefix='labels:'
                                                            data={infoCount} />
                                                    </div>)
                                    }
                                </Grid>
                            </Paper>
                        </div>
                    </TabPanel>
                </Grid>
                <Grid container className={classes.tweetsStatContainer} direction="column" item style={{ flex: 7 }}>
                    <Grid style={{ flex: 1, width: '100%'}} container justifyContent='space-evenly'>
                        <SocialMap
                            socialFilters={socialFiltersState}
                            filtersState={filtersState}
                            mapRef={mapRef}
                            fetchTweetsStat={fetchTweetsStat}
                            fetchTweetAnnotations={fetchTweetAnnotations}
                            leftClickState={mapLeftClickState}
                            setLeftClickState={setMapLeftClickState}
                            data={tweetAnnotations.data}
                            isLoading={tweetAnnotations.isLoading}
                            isError={tweetAnnotations.error}
                            filterObjApplyHandler={(filtersObj) => filterObjApplyHandler(filtersObj, filtersState.mapHazardsToIds, filtersState.mapInfosToIds, socialFiltersState, mapRef, setSocialFiltersMem, setSocialFiltersState)}
                            spiderifierRef={spiderifierRef}
                            spiderLayerIds={spiderLayerIds}
                            setSpiderLayerIds={setSpiderLayerIds}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default SocialComponent;