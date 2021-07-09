import React, { useState, useEffect, useContext } from 'react';
import { InteractiveMap, Source, Layer } from 'react-map-gl';
import { useMapPreferences } from '../../../../state/preferences/preferences.hooks';
import { MapStyleToggle } from '../../map/map-style-toggle.component';
import MapSlide from '../../../../common/map/map-popup-card';

import CircularProgress from '@material-ui/core/CircularProgress';

import { Card, Grid, Slide } from '@material-ui/core';


import { DEFAULT_MAP_VIEWPORT, parseDataToGeoJson } from '../../../../common/map/map-common';
import { TweetContent } from '../card/tweet-card-content';
import { CLUSTER_COUNT_LAYER_PROPS, CLUSTER_LAYER_ID, CLUSTER_LAYER_PROPS, HOVER_TWEETS_LAYER_PROPS, SOURCE_ID, TWEETS_LAYER_ID, TWEETS_LAYER_PROPS, unclusteredPointsProps } from './map-init';
import { mapClickHandler } from './map-click-handler';
import { mapOnLoadHandler } from '../../../../common/map/map-on-load-handler';
import { AppConfig, AppConfigContext } from '../../../../config';
import { MapHeadDrawer } from '../../../../common/map/map-drawer';

const tweetImage = new Image(50, 50);
tweetImage.src = require('../../../../assets/twitterIcon/twitter.png');
const tweetImageHover = new Image(50, 50);
tweetImageHover.src = require('../../../../assets/twitterIcon/twitterHover.png');

const SocialMap = (props) => {

    const {
        mapTheme,
        apiKey,
        transformRequest,
        mapServerURL
    } = useMapPreferences()

    const appConfig = useContext<AppConfig>(AppConfigContext)
    const mapConfig = appConfig.mapboxgl
    const [mapViewport, setMapViewport] = useState(mapConfig?.mapViewport || DEFAULT_MAP_VIEWPORT)

    const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection>({
        type: 'FeatureCollection',
        features: []
    })


    useEffect(() => {
        let map = props.mapRef?.current?.getMap()
        if (props.leftClickState.showPoint)
            props.setLeftClickState({ showPoint: false, clickedPoint: null, pointFeatures: { ...props.leftClickState.pointFeatures } })
        if (map) {
            props.spiderifierRef.current?.clearSpiders(map)
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
            <MapHeadDrawer
                mapRef={props.mapRef}
                filterApplyHandler={props.filterApplyHandler}
                mapViewport={mapViewport}
                isLoading={props.isLoading}
            />
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
                interactiveLayerIds={[TWEETS_LAYER_ID, CLUSTER_LAYER_ID, ...props.spiderLayerIds]}
                onClick={(evt) => mapClickHandler(evt, props.mapRef, props.leftClickState, props.setLeftClickState, mapViewport, props.spiderifierRef)}
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
                            mapOnLoadHandler(
                                map,
                                props.spiderifierRef,
                                props.setSpiderLayerIds,
                                setMapViewport,
                                SOURCE_ID,
                                TWEETS_LAYER_ID,
                                unclusteredPointsProps,
                                TWEETS_LAYER_PROPS.type,
                                undefined,
                                { paint: HOVER_TWEETS_LAYER_PROPS.paint as mapboxgl.SymbolPaint, layout: HOVER_TWEETS_LAYER_PROPS.layout as mapboxgl.AnyLayout })
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
                                renderLocation={false}
                            />
                        </Card>
                    </MapSlide>
                </Slide>
            </InteractiveMap>
            {
                (props.mapRef.current?.getMap()) &&
                (<MapStyleToggle mapViewRef={props.mapRef} spiderifierRef={props.spiderifierRef} direction="right"></MapStyleToggle>)
            }
        </div>
    );
}

export default SocialMap;