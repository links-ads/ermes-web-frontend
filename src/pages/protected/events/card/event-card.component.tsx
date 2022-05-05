import React, { useState } from 'react';

import { makeStyles, Theme, createStyles, useTheme } from '@material-ui/core/styles';
import { Card, Collapse, Grid, IconButton } from '@material-ui/core';



import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


import clsx from 'clsx';
import { queryHoveredFeature } from '../../../../common/map/map-common';
import { getSocialCardStyle, ParsedTweet } from '../../../../utils/utils.common';
import EventContent from './event-card-content';
import { CLUSTER_LAYER_ID, EVENTS_LAYER_ID, SOURCE_ID } from '../map/map-init';

export const EventCard = (props) => {

    const useStyles = makeStyles((theme: Theme) =>
        createStyles(
            getSocialCardStyle(theme)
        ));


    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);
    const [featureToHover, setFeatureHover] = useState<{ type: "leaf" | "point" | "cluster" | null, id: string | number | null, source?: string }>({ type: null, id: null })
    const theme = useTheme()
    const hasTweets = props.item.tweets.length > 0
    const expandButton = (hasTweets) ? (<IconButton
        className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
        })}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label="show more"
    >
        <ExpandMoreIcon />
    </IconButton>) : null

    const event = props.item
    return (
        <Card className={classes.root} raised={true}
            onPointerEnter={() => {
                const coord = props.item.hotspots_centroid.coordinates
                if (!coord) return
                const map = props.mapRef.current.getMap()
                if (!map) return
                const result = queryHoveredFeature(
                  map,
                  coord,
                  [EVENTS_LAYER_ID, CLUSTER_LAYER_ID, ...props.spiderLayerIds],
                  EVENTS_LAYER_ID,
                  CLUSTER_LAYER_ID,
                  event.id,
                  undefined
                )
                if (result.type) {
                    map.setFeatureState({
                        source: result.type === 'leaf' ? result.source : SOURCE_ID,
                        id: result.id,
                    }, {
                        hover: true
                    })
                    if (result.type === 'cluster')
                        props.setMapHoverState({ set: true })
                    setFeatureHover(result)
                }
            }}
            onPointerLeave={() => {
                const map = props.mapRef.current.getMap()
                if (!map) return
                if (featureToHover.type) {
                    map.setFeatureState({
                        source: featureToHover.type === 'leaf' ? featureToHover.source : SOURCE_ID,
                        id: featureToHover.id,
                    }, {
                        hover: false
                    })
                    if (featureToHover.type === 'cluster')
                        props.setMapHoverState({ set: false })
                }
                setFeatureHover({ type: null, id: null })
            }}
        >
            <EventContent
                mapIdsToHazards={props.mapIdsToHazards}
                item={props.item}
                chipSize='small'
                textSizes={{ title: 'body1', body: 'subtitle2' }}
                renderLocation={true}
                mapRef={props.mapRef}
                leftClickState={props.leftClickState}
                setLeftClickState={props.setLeftClickState}
                pointCoordinates={props.item.hotspots.coordinates}
                expandButton={expandButton}
            />
            {hasTweets && (<Collapse in={expanded} timeout="auto" unmountOnExit>
                <div style={{ height: 200, width: '100%', overflow: 'auto', backgroundColor: theme['palette']['background']['default'] }}>
                    {
                        props.item.tweets.map(tweet => (
                            <Grid key={tweet.id_str} style={{ margin: 5, padding: 5, backgroundColor: theme['palette']['background']['paper'] }}>
                                <ParsedTweet
                                    text={tweet.text}
                                    textSizes={{ body: 'body2' }}
                                />
                            </Grid>
                        ))
                    }
                </div>
            </Collapse>)}
        </Card>
    )
}