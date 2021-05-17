import React from 'react';
import Card from '@material-ui/core/Card';

import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import LocationOnIcon from '@material-ui/icons/LocationOn';

import Carousel from 'react-material-ui-carousel'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';


import { getTweetLocation } from '../../common/map/map-common';
import { TweetContent } from './tweet-card-content';


export const TweetCard = (props) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            root: {
                width: '100%',
                marginBottom: '16px',
                textOverflow: "ellipsis",
                overflow: "hidden",
                display: 'inline-block',
                padding: 6,
                // filter:'brightness(1)',
                "&:hover": {
                    // backgroundColor: 'rgba(255,255,255, 0.05)',
                    // filter:'brightness(1.2)',
                    // box-shadow: inset 0 0 0 10em rgba(255, 255, 255, 0.3);
                    boxShadow: 'inset 0 0 0 20em rgba(255, 255, 255, 0.3)',
                    cursor:'pointer'
                }
            },
            grid_root: {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                overflow: 'hidden',
            },
            gridList: {
                flexWrap: 'nowrap',
                transform: 'translateZ(0)',
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
    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const parseTweetMedia = (medias) => {
        if (medias === undefined) return null
        let uniqueMediasId = [] as any[]
        let uniqueMedias = [] as any[]
        medias.forEach(media => {
            if (!uniqueMediasId.includes(media.id)) {
                uniqueMediasId.push(media.id)
                uniqueMedias.push(media)
            }
        });
        return uniqueMedias
    }

    const renderTweetMedia = (uniqueMedias, expanded) => {
        if (uniqueMedias == null || uniqueMedias.length === 0)
            return null;
        return (
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <div className={classes.grid_root}>
                    <Carousel
                        animation='slide'
                        autoPlay={false}
                        fullHeightHover={false}
                    >
                        {uniqueMedias.map((media) => {
                            return (
                                <div key={media.id_str} style={{ margin: 'auto', textAlign: 'center' }} >
                                    { (media.type === 'PHOTO') ?
                                        (<img src={media.url} alt='' width='80%' style={{ cursor: 'pointer' }}
                                            onClick={() => window.open(media.url)} />) :
                                        (media.type === 'VIDEO') ?
                                            (<video controls width='80%'>
                                                <source src={media.url}></source>
                                            </video>) : null

                                    }
                                </div>
                            )
                        })}
                    </Carousel>
                </div>
            </Collapse >
        );
    }

    let tweet = props.item
    const coord = getTweetLocation(tweet)

    let uniqueMedias = parseTweetMedia(tweet.media)
    const expandButton = (uniqueMedias === null || uniqueMedias!.length === 0) ? null : (<IconButton
        className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
        })}
        onClick={handleExpandClick}
        aria-expanded={expanded}
        aria-label="show more"
    >
        <ExpandMoreIcon />
    </IconButton>)

    return (
        <Card className={classes.root} raised={true}
            onPointerEnter={() => console.log("ENTER", tweet.id)}
            onPointerLeave={() => console.log("LEAVE", tweet.id)}
        >
            <TweetContent
                tweet={tweet}
                mapIdsToHazards={props.mapIdsToHazards}
                mapIdsToInfos={props.mapIdsToInfos}
                textSizes={{
                    subheader: 'subtitle2',
                    body: 'body1'
                }}
                chipSize='medium'
            />
            <CardActions disableSpacing className={classes.action}>
                {coord === undefined ? null : (
                    <IconButton onClick={() => {
                        if (coord !== undefined) {
                            if (props.mapRef.current) {
                                try {
                                    const map = props.mapRef?.current.getMap()
                                    map?.flyTo(
                                        {
                                            center: coord,
                                            zoom: 15
                                        },
                                        {
                                            how: 'fly'
                                        }
                                    )
                                    if (props.mapLeftClickState.showPoint) {
                                        props.setMapLeftClickState({ showPoint: false, clickedPoint: null, pointFeatures: { ...props.mapLeftClickState.pointFeatures } })
                                    }
                                }
                                catch (err) {
                                    console.error('MAP Load Error', err)
                                }
                            }
                        }
                    }}>
                        <LocationOnIcon />
                    </IconButton>
                )}
                {expandButton}
            </CardActions>
            {renderTweetMedia(uniqueMedias, expanded)}
        </Card>
    );
}