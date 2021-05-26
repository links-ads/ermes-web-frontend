import React, { useState } from 'react';

import { makeStyles, Theme, createStyles, useTheme } from '@material-ui/core/styles';
import { Card, CardActions, Collapse, Grid, IconButton } from '@material-ui/core';

import LocationOnIcon from '@material-ui/icons/LocationOn';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


import clsx from 'clsx';
import { clearEventMap, queryHoveredFeature } from '../../common/map/map-common';
import { ParsedTweet } from '../../common/utils/utils.common';
import EventContent from './event-card-content';
import { CLUSTER_LAYER_ID, EVENTS_LAYER_ID, SOURCE_ID } from '../map/map-init';

export const EventCard = (props) => {

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            root: {
                width: '100%',
                marginBottom: '16px',
                textOverflow: "ellipsis",
                overflow: "hidden",
                display: 'inline-block',
                padding: 6,
                "&:hover": {
                    boxShadow: 'inset 0 0 0 20em rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer'
                }
            },
            expand: {
                transform: 'rotate(0deg)',
                marginLeft: 'auto',
                transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shortest,
                }),
            },
            expandOpen: {
                transform: 'rotate(180deg)',
            },
            content: {
                margin: '5px',
                padding: 5
            },
            action: {
                margin: '0px 5px',
                padding: 0
            }
        }));


    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);
    const [featureToHover, setFeatureHover] = useState<{ type: string | null, id: string | null }>({ type: null, id: null })
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
                const result = queryHoveredFeature(map,coord,[EVENTS_LAYER_ID, CLUSTER_LAYER_ID],EVENTS_LAYER_ID,CLUSTER_LAYER_ID,event.id,SOURCE_ID)
                if(result.type === 'point' || result.type ==='cluster')
                {
                    map.setFeatureState({
                        source: SOURCE_ID,
                        id: result.id,
                    }, {
                        hover: true
                    })
                    setFeatureHover({ type: result.type, id: result.id })
                    if(result.type === 'cluster')
                        props.setMapHoverState({set:true})
                }
            }}
            onPointerLeave={() => {
                const map = props.mapRef.current.getMap()
                if (!map) return
                if(featureToHover.type === 'point' || featureToHover.type ==='cluster')
                {
                    map.setFeatureState({
                        source: SOURCE_ID,
                        id: featureToHover['id'],
                    }, {
                        hover: false
                    })
                    setFeatureHover({ type: featureToHover.type, id: featureToHover.id })
                    if(featureToHover.type === 'cluster')
                        props.setMapHoverState({set:false})
                }
            }}
        >
            <EventContent
                mapIdsToHazards={props.mapIdsToHazards}
                item={props.item}
                chipSize={'medium'}
                textSizes={{ title: 'h6', body: 'body1' }}
            />
            <CardActions disableSpacing className={classes.action}>
                {props.item.hotspots.coordinates && (
                    <IconButton onClick={() => {
                        if (props.mapRef.current) {
                            try {
                                const map = props.mapRef?.current.getMap()
                                const centroid = props.item.hotspots_centroid.coordinates
                                clearEventMap(map, props.setLeftClickState, props.leftClickState)
                                map?.flyTo(
                                    {
                                        center: centroid,
                                        zoom: 8
                                    },
                                    {
                                        how: 'fly'
                                    }
                                )
                            }
                            catch (err) {
                                console.error('MAP Load Error', err)
                            }
                        }
                    }}>
                        <LocationOnIcon />
                    </IconButton>
                )}
                {expandButton}

            </CardActions>
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