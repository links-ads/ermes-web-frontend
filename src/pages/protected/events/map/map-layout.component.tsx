import React, { useRef, useState, useEffect, useCallback } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { useMapPreferences } from '../../../../state/preferences/preferences.hooks';

import { useTranslation } from 'react-i18next'
import { Card, CircularProgress, Grid, Slide, Typography } from '@material-ui/core';
import InteractiveMap from 'react-map-gl';
import { MapStyleToggle } from '../../decision-making/map/map-style-toggle.component';
import { clearEventMap, parseEventDataToGeoJson } from '../../common/map/map-common';
import debounce from 'lodash.debounce';
import {  updateHazardMarkers } from './map-cluster-util';
import { Spiderifier } from '../../../../utils/map-spiderifier.utils';
import MapSlide from '../../social/map/map-popup-card';
import EventContent from '../event-card-content';
import { mapClickHandler } from './map-click-handler';
import { SOURCE_ID, CLUSTER_LAYER_ID, EVENTS_LAYER_ID, initializeMap, DEFAULT_MAP_VIEWPORT } from './map-init';
import { FeatureCollection } from 'geojson';
import { MapOnLoad } from './map-on-load';

const DEBOUNCE_TIME = 250 //ms

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
    const [mapViewport, setMapViewport] = useState(DEFAULT_MAP_VIEWPORT)
    const spiderifierRef = useRef<Spiderifier | null>(null)
    const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
    const dataRef = useRef<FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties> | null>(null)
    const updateMarkers = useCallback(
        debounce((map: mapboxgl.Map | undefined) => {
            if (map !== undefined) {
                clusterMarkersRef.current = updateHazardMarkers(SOURCE_ID, clusterMarkersRef, map)
            }
        }, DEBOUNCE_TIME),
        []
    )
    const mapInit = useCallback(()=>initializeMap(props.mapRef?.current?.getMap(), dataRef.current),[]);

    useEffect(() => {
        dataRef.current = parseEventDataToGeoJson(props.data)
        let map = props.mapRef?.current?.getMap()
        if (map !== undefined) {
            clearEventMap(map, props.setLeftClickState, props.leftClickState)
            initializeMap(map, dataRef.current)
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
                            MapOnLoad(map,spiderifierRef,setSpiderLayerIds,setMapViewport,updateMarkers,mapInit)
                            updateMarkers(map)

                        }
                        catch (err) {
                            console.error('Map Load Error', err)
                        }
                    }
                }
                }
            >
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