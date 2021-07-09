import React from 'react'
import { Card, CardContent, CircularProgress, Grid, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import InfiniteScroll from "react-infinite-scroll-component";

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

// import EventCard from './card/event-card.component';

export const CardsList = (props) => {

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            root: {
                width: '100%',
                height:'100%',
                // marginBottom: '8 px',
                textOverflow: "ellipsis",
                overflow: "hidden",
                display: 'inline-block',
                padding: 6
            },
            content: {
                margin: '5px',
                padding: 5
            }
        }));

    const { t } = useTranslation(['social'])

    const classes = useStyles();

 
    const itemList = props.data.map((item)=>props.renderItem(item))

    const errorString = (props.isError) ? "social:fetch_error" : "social:no_results"

    const noResultsCard = (<Card className={classes.root} raised={true}>
        <CardContent className={classes.content}>
            <Typography align="left" variant="h4">{t(errorString)}</Typography>
        </CardContent>
    </Card>)

    const cardToShow = (props.isLoading && props.data.length === 0) ?
        (<Grid container justify="center"><CircularProgress disableShrink /></Grid>) :
        (props.isError || (!props.isLoading && props.data.length === 0)) ? noResultsCard : itemList
    return (
        <div id="scrollableDiv" style={{
            width: '100%',
            height: '80vh', minHeight: 400,
            overflow: "auto"
        }}>
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
        </div>
    );

}
