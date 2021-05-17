import React, { useEffect, useMemo, useRef, useState } from 'react';
import Grid from '@material-ui/core/Grid';

import SocialFilter from '../common/filters/filters'

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';


import CircularProgress from '@material-ui/core/CircularProgress';

import { useTranslation } from 'react-i18next'

import { VolumeCard, InformativeCard, LanguageCard, SocialPieChart } from '../common/stats-cards.components'
import { Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

import SocialMap from './map/map-layout.component';
import InteractiveMap from 'react-map-gl';

import useFilters from '../../../hooks/use-filters.hook'
import useSocialStat from '../../../hooks/use-social-stats.hook';
import useTweetsAnnotations from '../../../hooks/use-tweet-annotation.hook';

import { FiltersType } from '../common/filters/reducer';
import { CardsList } from '../common/cards-list.components';

import {TweetCard} from './card/tweet-card-component';

const SocialComponent = (props) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            tweetsStatContainer: {
                margin: '8px'
            },
            tweetsListContainer: {
                margin: '16px 8px 8px 0px',
                maxWidth: '30vw'
            },
            filterContainer: {
                margin: '8px',
                backgroundColor: theme['palette']['primary']['main']
            },
            infoContainer: {
                marginBottom: '16px'
            },
            pieContainer: {
                height: '35vh',
                minHeight: 200,
                width: '45vw',
                position: 'relative'
            }
        }));

    const classes = useStyles();

    const { t } = useTranslation(['social'])
    const PAGE_SIZE = 1000
    const MINI_PAGE_SIZE = 20
    const mapRef = useRef<InteractiveMap>(null)
    const [mapLeftClickState, setMapLeftClickState] = useState({ showPoint: false, clickedPoint: null as any, pointFeatures: {} })
    const [tweetsStats, fetchTweetsStat] = useSocialStat('TWEETS')
    const [tweetAnnotations, fetchTweetAnnotations] = useTweetsAnnotations()
    const [filterArgs, setFilterArgs] = useState<FiltersType>({
        startDate: new Date(new Date().valueOf() - 1000 * 60 * 60 * 24),
        endDate: new Date(),
        languageSelect: [],
        hazardSelect: [],
        infoTypeSelect: [],
        informativeSelect: 'true',
        southWest:undefined,
        northEast:undefined
    })

    const [filtersState, fetchFilters] = useFilters()
    const [shownData, setShownData] = useState({ size: 0, data: [] as any[] })

    useEffect(() => {
        setShownData({ size: MINI_PAGE_SIZE, data: [...tweetAnnotations.data].splice(0, MINI_PAGE_SIZE) })
    }, [tweetAnnotations.data])

    useEffect(() => {
        fetchTweetsStat(filterArgs)
        fetchTweetAnnotations(filterArgs, PAGE_SIZE, false, (data) => { return data }, [], (data) => { return data })
    }, [filterArgs])

    const filterApplyHandler = (args) => {
        const newArgs = {
            ...filterArgs,
            ...args
        }
        setFilterArgs(newArgs)
    }

    const infoCount = useMemo(() => {
        if (tweetsStats.stats.info_count === undefined) return {}
        if (Object.entries(tweetsStats.stats.info_count).length === 0 || Object.entries(filtersState.mapIdsToInfos).length === 0) return {}
        return Object.entries(tweetsStats.stats.info_count).map(tuple => {
            return { id: tuple[0], label: filtersState.mapIdsToInfos[parseInt(tuple[0])], value: tuple[1] }
        })

    }, [tweetsStats.stats.info_count, filtersState.mapIdsToInfos])

    const hazardCount = useMemo(() => {
        if (tweetsStats.stats.hazard_count === undefined) return {}
        if (Object.entries(tweetsStats.stats.hazard_count).length === 0 || Object.entries(filtersState.mapIdsToHazards).length === 0) return {}
        return Object.entries(tweetsStats.stats.hazard_count).map(tuple => {
            return { id: tuple[0], label: filtersState.mapIdsToHazards[parseInt(tuple[0])], value: tuple[1] }
        })
    }, [filtersState.mapIdsToHazards, tweetsStats.stats.hazard_count]
    )

    useEffect(() => {
        fetchFilters()
    }, [fetchFilters])

    const showMoreData = () => {
        const newData = shownData.data.concat([...tweetAnnotations.data].slice(shownData.size, shownData.size + MINI_PAGE_SIZE))
        const newSize = newData.length
        setShownData({ size: newSize, data: newData })
    }

    return (
        <Grid container direction="column" justify="flex-start" alignContent='space-around'>
            <Grid className={classes.filterContainer} item lg='auto' sm='auto' xl='auto'>
                <SocialFilter
                    onFilterApply={filterApplyHandler}
                    hazardNames={filtersState.hazardNames}
                    infoNames={filtersState.infoNames}
                    mapHazardsToIds={filtersState.mapHazardsToIds}
                    mapInfosToIds={filtersState.mapInfosToIds}
                    renderInformative={true}
                    isError={filtersState.error}
                    filters={filterArgs}
                />
            </Grid>
            <Grid container direction="row" justify="flex-start" alignContent='space-around' >
                <Grid className={classes.tweetsStatContainer} item lg='auto' sm='auto' xl='auto' style={{ flex: 3 }}>
                    <Grid className={classes.infoContainer} container item direction="row" justify="flex-start" alignContent="space-between">
                        <Grid style={{ flex: 1 }} item   >
                            <VolumeCard isLoading={tweetsStats.isLoading} isError={tweetsStats.error} label={t("social:tweets_count")} value={tweetsStats.stats.tweets_count} />
                        </Grid>
                        <Grid style={{ flex: 1 }} item >
                            <InformativeCard isLoading={tweetsStats.isLoading} isError={tweetsStats.error} label={t("social:informative_info")} value={tweetsStats.stats.informativeness_ratio} />
                        </Grid>
                    </Grid>
                    <Grid className={classes.tweetsListContainer} item >
                            <CardsList
                            data={shownData.data}
                            isLoading={tweetAnnotations.isLoading}
                            isError={tweetAnnotations.error}
                            hasMore={shownData.size < tweetAnnotations.data.length}
                            moreData={() => showMoreData()}
                            renderItem={(item) => (
                                    <TweetCard
                                        item={item}
                                        key={item.id}
                                        mapIdsToHazards={filtersState.mapIdsToHazards}
                                        mapIdsToInfos={filtersState.mapIdsToInfos}
                                        mapRef={mapRef}
                                        leftClickState={mapLeftClickState}
                                        setLeftClickState={setMapLeftClickState}
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
                                    tweetsStats.isLoading ? (<Grid style={{ flex: 1 }} container justify="center" >
                                        <CircularProgress />
                                    </Grid>) : (tweetsStats.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                        (Object.entries(tweetsStats.stats.languages_count).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) : Object.entries(tweetsStats.stats.languages_count).map(tuple => {
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
                        <SocialMap
                            mapIdsToHazards={filtersState.mapIdsToHazards}
                            mapIdsToInfos={filtersState.mapIdsToInfos}
                            mapRef={mapRef}
                            leftClickState={mapLeftClickState}
                            setLeftClickState={setMapLeftClickState}
                            data={tweetAnnotations.data}
                            isLoading={tweetAnnotations.isLoading}
                            isError={tweetAnnotations.error}
                            filterApplyHandler={filterApplyHandler}
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
                                (tweetsStats.error || filtersState.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                    (tweetsStats.isLoading) ? (<Grid container style={{ padding: 8 }} justify='center'> <CircularProgress /> </Grid>) :
                                        (Object.entries(hazardCount).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) :
                                            (<div className={classes.pieContainer}>
                                                <SocialPieChart
                                                    prefix='hazard'
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
                                (tweetsStats.error || filtersState.error) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:fetch_error")}</Typography>) :
                                    (tweetsStats.isLoading) ? <Grid container style={{ padding: 8 }} justify='center'> <CircularProgress /></Grid> :
                                        (Object.entries(infoCount).length === 0) ? (<Typography style={{ margin: 4 }} align="center" variant="caption">{t("social:no_results")}</Typography>) :
                                            (<div className={classes.pieContainer}>
                                                <SocialPieChart
                                                    prefix='information'
                                                    data={infoCount} />
                                            </div>)
                            }
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default SocialComponent;