import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { useMapPreferences } from '../../../../state/preferences/preferences.hooks';

import { useTranslation } from 'react-i18next'
import { Card, CircularProgress, Grid, Slide, Typography } from '@material-ui/core';
import InteractiveMap, { Layer, Source } from 'react-map-gl';
import { MapStyleToggle } from '../../map/map-style-toggle.component';
import { clearEventMap, DEFAULT_MAP_VIEWPORT, parseEventDataToGeoJson } from '../../common/map/map-common';
import debounce from 'lodash.debounce';
import { Spiderifier } from '../../../../utils/map-spiderifier.utils';
import MapSlide from '../../common/map/map-popup-card';
import EventContent from '../card/event-card-content';
import { mapClickHandler } from './map-click-handler';
import { SOURCE_ID, CLUSTER_LAYER_ID, EVENTS_LAYER_ID, unclusteredPointsProps, SOURCE_PROPS, EVENTS_LAYER_PROPS, CLUSTER_LAYER_PROPS,updateHazardMarkers } from './map-init';
import { mapOnLoadHandler } from '../../common/map/map-on-load-handler';
import { AppConfig, AppConfigContext } from '../../../../config';

const DEBOUNCE_TIME = 200 //ms

const EventMap = (props) => {
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
            }
        }));
    const classes = useStyles();

    const clusterMarkersRef = useRef<[object, object]>([{}, {}])

    const {
        mapTheme,
        apiKey,
        transformRequest,
        mapServerURL
    } = useMapPreferences()
    const { t } = useTranslation(['social'])
    const appConfig = useContext<AppConfig>(AppConfigContext)
    const mapConfig = appConfig.mapboxgl
    const [mapViewport, setMapViewport] = useState(mapConfig?.mapViewport || DEFAULT_MAP_VIEWPORT)
    const spiderifierRef = useRef<Spiderifier | null>(null)
    const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
    const [geoJsonData,setGeoJsonData] = useState<GeoJSON.FeatureCollection>({
        type: 'FeatureCollection',
        features: []
      })
    const updateMarkers = useCallback(
        debounce((map: mapboxgl.Map | undefined) => {
            if (map !== undefined) {
                clusterMarkersRef.current = updateHazardMarkers(SOURCE_ID, clusterMarkersRef, map)
            }
        }, DEBOUNCE_TIME),
        []
    )


    useEffect(() => {
        let map = props.mapRef?.current?.getMap()
        if (map !== undefined) {
            clearEventMap(map, props.setLeftClickState, props.leftClickState)
            console.log(props.data)
            setGeoJsonData(parseEventDataToGeoJson(props.data))
            updateMarkers(map)
        }
    }, [props.data, props.mapRef, updateMarkers])


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
                interactiveLayerIds={[EVENTS_LAYER_ID, CLUSTER_LAYER_ID, ...spiderLayerIds]}
                onClick={(evt) => mapClickHandler(evt, props.mapRef, props.leftClickState, props.setLeftClickState, mapViewport, spiderifierRef)}
                onLoad={() => {
                    if (props.mapRef.current) {
                        try {
                            let map = props.mapRef?.current?.getMap()
                            mapOnLoadHandler(map,
                                spiderifierRef,
                                setSpiderLayerIds,
                                setMapViewport,
                                SOURCE_ID,
                                EVENTS_LAYER_ID,
                                unclusteredPointsProps,
                                updateMarkers)
                            updateMarkers(map)

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
                    data={geoJsonData}
                    type='geojson'
                    {...SOURCE_PROPS}
                >
                    <Layer {...EVENTS_LAYER_PROPS} />
                    <Layer {...CLUSTER_LAYER_PROPS} />
                </Source>
                <Slide
                    direction='left'
                    in={props.leftClickState.showPoint}
                    mountOnEnter={true}
                    unmountOnExit={true}
                    timeout={800}
                >
                    <MapSlide>
                        <Card raised={false}>
                            <EventContent
                                mapIdsToHazards={props.mapIdsToHazards}
                                item={props.leftClickState.pointFeatures}
                                chipSize={'small'}
                                textSizes={{ title: 'body1', body: 'caption' }}
                            />
                        </Card>
                    </MapSlide>
                </Slide>
            </InteractiveMap>
            <MapStyleToggle mapViewRef={props.mapRef} spiderifierRef={spiderifierRef} direction="right"></MapStyleToggle>
        </div >
    );
}

export default EventMap;