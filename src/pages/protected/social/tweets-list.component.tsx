import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';


import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';


import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import LocationOnIcon from '@material-ui/icons/LocationOn';

import Carousel from 'react-material-ui-carousel'


import { useTranslation } from 'react-i18next'

import InfiniteScroll from "react-infinite-scroll-component";

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { GridList, GridListTile } from '@material-ui/core';


import { getTweetLocation } from '../common/map/map-common';
import { TweetContent } from './tweet-card-content.component';

const SocialList = (props) => {

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            root: {
                width: '100%',
                marginBottom: '16px',
                textOverflow: "ellipsis",
                overflow: "hidden",
                display: 'inline-block',
                padding: 6
            },
            grid_root: {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                overflow: 'hidden',
                // backgroundColor: theme.palette.background.paper,
            },
            gridList: {
                flexWrap: 'nowrap',
                // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
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

    const { t } = useTranslation(['social'])

    const classes = useStyles();


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
                {/* <CardContent className={classes.content}> */}
                {/* <Grid container direction='row' style={{width:'100%'}} justify="flex-start"> */}
                {/* <div style={{ overflowX: 'auto', overflowY: 'hidden', width: '100%',display:'flex'}}>
                            {uniqueMedias.map(media => {
                                return (<div key ={media.id} style={{flex:'0 0 50%',margin:'0px 4px'}}>
                                    <img alt='' id={media.id} src={media.url} width={200} />
                                </div>)
                            })}
                        </div> */}
                {/* <div style={{height:'100%',width:'80%',maxWidth:'80%',float:'left',overflow:'scroll',whiteSpace:'nowrap'}}>
                            {uniqueMedias.map(media => {
                                return (<div key ={media.id} style={{display:'inline-block'}}>
                                    <img alt='' id={media.id} src={media.url} width={200} />
                                </div>)
                            })}
                        </div> */}
                <div className={classes.grid_root}>
                    {/* <GridList className={classes.gridList} cols={1.5}>
                        {uniqueMedias.map((media) => (
                            <GridListTile key={media.id}>
                                <img width={'80%'} src={media.url} alt='' style={{ cursor: 'pointer' }} onClick={() => window.open(media.url)} />
                            </GridListTile>
                        ))}
                    </GridList> */}
                    <Carousel
                        animation='slide'
                        autoPlay={false}
                        // timeout={800}
                        fullHeightHover={false}
                    >
                        {uniqueMedias.map((media) => {
                            // if (media.type === 'PHOTO')
                            return (
                                <div key={media.id_str} style={{margin:'auto', textAlign:'center'}} >
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
                {/* </Grid> */}
                {/* </CardContent> */}
            </Collapse >
        );
    }

    const TweetCard = (props) => {
        const [expanded, setExpanded] = React.useState(false);

        const handleExpandClick = () => {
            setExpanded(!expanded);
        };
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
            <Card className={classes.root} raised={true}>
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

    // const tweet_ids = props.data.map((item)=>item.id_str)
    // const s = new Set(tweet_ids)
    // console.log("DATA",tweet_ids,tweet_ids.length,s.size)

    const itemList = props.data.map((item) => (
        <TweetCard item={item}
            key={item.id_str}
            mapIdsToHazards={props.mapIdsToHazards}
            mapIdsToInfos={props.mapIdsToInfos}
            mapRef={props.mapRef}
            mapLeftClickState={props.mapLeftClickState}
            setMapLeftClickState={props.setMapLeftClickState}
        />
    ))

    const errorString = (props.isError) ? "social:fetch_error" : "social:no_results"

    const noResultsCard = (<Card className={classes.root} raised={true}>
        <CardContent className={classes.content}>
            <Typography align="left" variant="h4">{t(errorString)}</Typography>
        </CardContent>
    </Card>)
    const cardToShow = (props.isLoading && props.data.length === 0) ?
        (<Grid container justify="center"><CircularProgress disableShrink /></Grid>) :
        (props.isError || (!props.isLoading && props.data.length === 0)) ?
            noResultsCard : itemList
    return (
        <Grid item id="scrollableDiv" style={{ width: '100%', height: '70vh', minHeight: 400, overflow: "auto" }}>
            <InfiniteScroll
                style={{ overflow: 'hidden' }}
                dataLength={props.data.length}
                next={props.moreData}
                hasMore={props.hasMore}
                endMessage={
                    <div></div>
                }
                loader={<Grid container justify="center"><CircularProgress disableShrink /></Grid>}
                scrollableTarget='scrollableDiv'
            >
                {cardToShow}
            </InfiniteScroll>
        </Grid>
    );
}

export default SocialList;