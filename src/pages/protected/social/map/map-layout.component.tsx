import React, { useState, useRef, useEffect, useContext } from 'react';
import { InteractiveMap, Source, Layer } from 'react-map-gl';
import { useMapPreferences } from '../../../../state/preferences/preferences.hooks';
import { Spiderifier } from '../../../../utils/map-spiderifier.utils';
import { MapStyleToggle } from '../../map/map-style-toggle.component';
import MapSlide from '../../common/map/map-popup-card';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Button, Card, Grid, Slide, Typography } from '@material-ui/core';

import { useTranslation } from 'react-i18next'


import { DEFAULT_MAP_VIEWPORT, parseDataToGeoJson } from '../../common/map/map-common';
import { TweetContent } from '../card/tweet-card-content';
import { CLUSTER_COUNT_LAYER_PROPS, CLUSTER_LAYER_ID, CLUSTER_LAYER_PROPS, HOVER_TWEETS_LAYER_PROPS, SOURCE_ID, TWEETS_LAYER_ID, TWEETS_LAYER_PROPS, unclusteredPointsProps } from './map-init';
import { mapClickHandler } from './map-click-handler';
import { mapOnLoadHandler } from '../../common/map/map-on-load-handler';
import { AppConfig, AppConfigContext } from '../../../../config';
// import { updatePointFeatureLayerIdFilter } from '../../../../utils/map.utils';

const tweetImage = new Image(50, 50);
tweetImage.src = require('../../../../assets/twitterIcon/twitter.png');
const tweetImageHover = new Image(50, 50);
tweetImageHover.src = require('../../../../assets/twitterIcon/twitterHover.png');

const SocialMap = (props) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            popup: {
                padding: 0,
                margin: 0
            },
            headerBoldText: {
                fontWeight: 600,
                color: 'white'
            },
            headerText: {
                color: 'white'
            },
            button: {
                borderColor: 'white',
                color: 'white',
                borderWidth: 1,
                "&:disabled": {
                    color: 'rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                },
                "&:hover": {
                    backgroundColor: 'rgba(255, 255, 255, 0.4)'
                },
            }
        }));
    const classes = useStyles();

    const {
        mapTheme,
        apiKey,
        transformRequest,
        mapServerURL
    } = useMapPreferences()
    const { t } = useTranslation(['social'])
    const appConfig = useContext<AppConfig>(AppConfigContext)
    const mapConfig = appConfig.mapboxgl
    console.log(mapConfig)
    const [mapViewport, setMapViewport] = useState(mapConfig?.mapViewport || DEFAULT_MAP_VIEWPORT)
    const spiderifierRef = useRef<Spiderifier | null>(null)
    const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
    const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection>({
        type: 'FeatureCollection',
        features: []
    })

    const searchButtonHandler = () => {
        let map = props.mapRef?.current?.getMap()
        if (map !== undefined) {
            var bounds = map.getBounds().toArray()
            const obj = {
                southWest: bounds[0].map(i => Math.floor(i)) as [number, number],
                northEast: bounds[1].map(i => Math.floor(i)) as [number, number]
            }
            props.filterApplyHandler(obj)
        }

    }
    // useEffect(()=>{
    //     console.log(props.mapHoverState)
    //     let map = props.mapRef?.current?.getMap()
    //     if(map===undefined) return
    //     const hoverState = props.mapHoverState
    //     if (hoverState.type === 'point')
    //     {
    //         updatePointFeatureLayerIdFilter(map,HOVER_TWEETS_LAYER_ID,hoverState.id)
    //     }

    // },[props.mapHoverState])

    useEffect(() => {
        let map = props.mapRef?.current?.getMap()
        if (props.leftClickState.showPoint)
            props.setLeftClickState({ showPoint: false, clickedPoint: null, pointFeatures: { ...props.leftClickState.pointFeatures } })
        if (map !== undefined) {
            setGeoJsonData(parseDataToGeoJson(props.data))
        }
    }, [props.mapRef, props.data])

    return (
        <div style={{ display: 'flex', width: '100%', height: '70vh', minHeight: 400, position: 'relative' }}>
            {props.isLoading && (
                <Grid style={{
                    position: 'absolute', zIndex: 10, width: '100%', height: '90%',
                    top: '10%', backgroundColor: 'black', opacity: 0.65
                }}
                    container justify='center' alignItems='center'>
                    <Grid item style={{ top: '40%', left: '40%' }}>
                        <CircularProgress size={100} thickness={4} />
                    </Grid>
                </Grid>)}
            <div style={{ position: 'absolute', width: '100%', height: '10%', backgroundColor: 'black', zIndex: 10, opacity: 0.5 }}>
                <Grid container style={{ height: '100%' }} direction='row' justify='space-evenly' alignItems='center' alignContent='center'>
                    <Grid item>
                        <Typography display='inline' className={classes.headerText} variant='h6'>{t('social:map_longitude')} : </Typography>
                        <Typography display='inline' className={classes.headerBoldText} variant='h6'>{mapViewport.longitude.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography display='inline' className={classes.headerText} variant='h6'>{t('social:map_latitude')} : </Typography>
                        <Typography display='inline' className={classes.headerBoldText} variant='h6'>{mapViewport.latitude.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography display='inline' className={classes.headerText} variant='h6'>{t('social:map_zoom')} : </Typography>
                        <Typography display='inline' className={classes.headerBoldText} variant='h6'>{mapViewport.zoom.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='outlined'
                            onClick={searchButtonHandler}
                            disabled={props.isLoading || props.mapRef?.current?.getMap() === undefined}
                            className={classes.button}
                        >
                            {t("social:map_button_label")}
                        </Button>
                    </Grid>
                </Grid>
            </div>
            <InteractiveMap
                {...mapViewport}
                width='100%'
                height='100%'
                mapStyle={mapTheme?.style}
                mapboxApiUrl={mapServerURL}
                mapboxApiAccessToken={apiKey}
                transformRequest={transformRequest}
                onViewportChange={(nextViewport) => setMapViewport(nextViewport)}
                ref={props.mapRef}
                interactiveLayerIds={[TWEETS_LAYER_ID, CLUSTER_LAYER_ID, ...spiderLayerIds]}
                onClick={(evt) => mapClickHandler(evt, props.mapRef, props.leftClickState, props.setLeftClickState, mapViewport, spiderifierRef)}
                onLoad={() => {
                    if (props.mapRef.current) {
                        try {
                            let map = props.mapRef?.current?.getMap()
                            map.on('styleimagemissing', function () {
                                if (!map.hasImage('twitterIcon')) {
                                    map.addImage('twitterIcon', tweetImage);
                                }
                                if (!map.hasImage('twitterIconHover')) {
                                    map.addImage('twitterIconHover', tweetImageHover);
                                }
                            });
                            mapOnLoadHandler(map,
                                spiderifierRef,
                                setSpiderLayerIds,
                                setMapViewport,
                                SOURCE_ID,
                                TWEETS_LAYER_ID,
                                unclusteredPointsProps,
                                undefined)
                        }
                        catch (err) {
                            console.error('Map Load Error', err)
                        }
                    }
                }
                }
            >
                <Source
                    id={SOURCE_ID}
                    type='geojson'
                    data={geoJsonData}
                    cluster={true}
                    clusterMaxZoom={15}
                    clusterRadius={50}
                >
                </Source>
                <Layer {...TWEETS_LAYER_PROPS} />
                <Layer {...CLUSTER_LAYER_PROPS} />
                <Layer {...CLUSTER_COUNT_LAYER_PROPS} />
                <Layer {...HOVER_TWEETS_LAYER_PROPS} />
                <Slide
                    direction='left'
                    in={props.leftClickState.showPoint}
                    mountOnEnter={true}
                    unmountOnExit={true}
                    timeout={800}
                >
                    <MapSlide>
                        <Card raised={false}>

                            <TweetContent
                                tweet={props.leftClickState.pointFeatures}
                                mapIdsToHazards={props.mapIdsToHazards}
                                mapIdsToInfos={props.mapIdsToInfos}
                                textSizes={{
                                    subheader: 'caption',
                                    body: 'body2'
                                }}
                                chipSize='small'
                            />
                        </Card>
                    </MapSlide>

                </Slide>
            </InteractiveMap>
            <MapStyleToggle mapViewRef={props.mapRef} spiderifierRef={spiderifierRef} direction="right"></MapStyleToggle>
        </div>
    );
}

export default SocialMap;