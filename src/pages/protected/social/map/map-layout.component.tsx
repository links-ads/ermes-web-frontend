import React, { useState, useEffect, useContext, useMemo } from 'react';
import { InteractiveMap, Source, Layer, NavigationControl } from 'react-map-gl';
import { useMapPreferences } from '../../../../state/preferences/preferences.hooks';
import { MapStyleToggle } from '../../map/map-style-toggle.component';
import MapSlide from '../../../../common/map/map-popup-card';

import { Card, Slide } from '@mui/material';
import { MapContainer } from '../../map/common.components';


import { DEFAULT_MAP_VIEWPORT, parseDataToGeoJson, MapLoadingDiv } from '../../../../common/map/map-common';
import { TweetContent } from '../card/tweet-card-content';
import { CLUSTER_COUNT_LAYER_PROPS, CLUSTER_LAYER_ID, CLUSTER_LAYER_PROPS, HOVER_TWEETS_LAYER_PROPS, SOURCE_ID, TWEETS_LAYER_ID, TWEETS_LAYER_PROPS, unclusteredPointsProps } from './map-init';
import { mapClickHandler } from './map-click-handler';
import { mapOnLoadHandler } from '../../../../common/map/map-on-load-handler';
import { AppConfig, AppConfigContext } from '../../../../config';
import { MapHeadDrawer } from '../../../../common/map/map-drawer';


import FloatingFilterContainer from '../../../../common/floating-filters-tab/floating-filter-container.component'
import { FilterButton } from '../../../../common/floating-filters-tab/filter-button.component'
import { getDefaultFilterArgs, getFilterObjFromFilters } from '../../../../utils/utils.common';
import mapboxgl from 'mapbox-gl';

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
    // Parse props
    const { mapRef, data,socialFilters,filtersState,leftClickState,setLeftClickState,spiderifierRef } = props

    const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState(false)
    const filtersObj = useMemo(() => {
        return getFilterObjFromFilters(socialFilters, filtersState.mapIdsToHazards, filtersState.mapIdsToInfos)
    }, [socialFilters, filtersState])

    const initObj = useMemo(() => {
        return getFilterObjFromFilters(getDefaultFilterArgs(mapConfig), filtersState.mapIdsToHazards, filtersState.mapIdsToInfos)
    }, [filtersState, mapConfig])

    const [floatingFilterContainerPosition, setFloatingFilterContainerPosition] = useState<{ x: number; y: number }| undefined>({x:50, y:55})
    useEffect(() => {
        let map = mapRef?.current?.getMap()
        // if (leftClickState.showPoint)        //decomment to hide the tweet slide
        //     setLeftClickState({ showPoint: false, clickedPoint: null, pointFeatures: { ...leftClickState.pointFeatures } })
        if (map) {
            spiderifierRef.current?.clearSpiders(map)
            setGeoJsonData(parseDataToGeoJson(data))
        }
    }, [mapRef, data,leftClickState,setLeftClickState,spiderifierRef])



    const applyFilters = (filtersObj) => {
        props.filterObjApplyHandler(filtersObj)
        setToggleActiveFilterTab(false)
    }

    return (
        <div    
        style={{
          display: 'flex',
          width: '100%',
          minHeight: 400,
          position: 'relative'
        }}
      >
            <MapHeadDrawer
                mapRef={props.mapRef}
                filterApplyHandler={() => props.filterObjApplyHandler(filtersObj)}
                mapViewport={mapViewport}
                isLoading={props.isLoading}
            />
            <FloatingFilterContainer
                setToggleActiveFilterTab={setToggleActiveFilterTab}
                toggleActiveFilterTab={toggleActiveFilterTab}
                filtersObj={filtersObj}
                applyFiltersObj={applyFilters}
                initObj={initObj}
                onPositionChange={setFloatingFilterContainerPosition}
                position={floatingFilterContainerPosition}
            ></FloatingFilterContainer>
            <MapContainer>
                <MapLoadingDiv
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
                    onClick={(evt) => mapClickHandler(evt, props.mapRef, leftClickState, setLeftClickState, mapViewport, spiderifierRef)}
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
                                    spiderifierRef,
                                    props.setSpiderLayerIds,
                                    setMapViewport,
                                    SOURCE_ID,
                                    TWEETS_LAYER_ID,
                                    unclusteredPointsProps,
                                    TWEETS_LAYER_PROPS.type,
                                    undefined,
                                    { paint: HOVER_TWEETS_LAYER_PROPS.paint as mapboxgl.SymbolPaint, layout: HOVER_TWEETS_LAYER_PROPS.layout as mapboxgl.AnyLayout })
                                map.fitBounds(new mapboxgl.LngLatBounds(socialFilters['southWest'], socialFilters['northEast']), {}, { how: 'fly' })
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
                        <Layer {...TWEETS_LAYER_PROPS} />
                        <Layer {...CLUSTER_LAYER_PROPS} />
                        <Layer {...CLUSTER_COUNT_LAYER_PROPS} />
                        <Layer {...HOVER_TWEETS_LAYER_PROPS} />
                    </Source>
                    <div className="controls-contaniner" style={{ top: '15%' }}>
                        <NavigationControl />
                    </div>
                    <Slide
                        direction='left'
                        in={leftClickState.showPoint}
                        mountOnEnter={true}
                        unmountOnExit={true}
                        timeout={800}
                    >
                        <MapSlide>
                            <Card raised={false} style={{ width: '30%', float: 'right', minWidth: 300 }}>
                                <TweetContent
                                    tweet={leftClickState.pointFeatures}
                                    mapIdsToHazards={filtersState.mapIdsToHazards}
                                    mapIdsToInfos={filtersState.mapIdsToInfos}
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
                <FilterButton
                    setToggleActiveFilterTab={setToggleActiveFilterTab}
                    toggleActiveFilterTab={toggleActiveFilterTab}
                ></FilterButton>
            </MapContainer>
            {
                (props.mapRef.current?.getMap()) &&
                (<MapStyleToggle mapViewRef={props.mapRef} spiderifierRef={spiderifierRef} onMapStyleChange={null} mapChangeSource={1} direction="right"></MapStyleToggle>)
            }
        </div>
    );
}

export default SocialMap;