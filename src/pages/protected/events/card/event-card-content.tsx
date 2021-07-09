import { Avatar, CardContent, CardHeader, Chip, Grid, Typography } from '@material-ui/core';
import React from 'react';

import { useTranslation } from 'react-i18next'
import { HAZARD_SOCIAL_ICONS } from '../../../../utils/utils.common';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import useLanguage from '../../../../hooks/use-language.hook';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { clearEventMap } from '../../../../common/map/map-common';
import { IconButton } from '@material-ui/core';



const EventContent = (props) => {
    const { dateLocale } = useLanguage()
    let dateOptions = { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' } as Intl.DateTimeFormatOptions
    let formatter = new Intl.DateTimeFormat(dateLocale, dateOptions)
    let hazardName = props.mapIdsToHazards[props.item.hazard_id]
    const { t } = useTranslation(['social', 'labels'])

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            header: {
                margin: '5px',
                padding: 5
            },
            content: {
                margin: '5px',
                padding: 5,
                "&:last-child": {
                    paddingBottom: 0
                }
            }
        }));


    const classes = useStyles();

    const textSizes = props.textSizes

    const locationButton = (props.pointCoordinates && props.renderLocation) && (
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
    )

    const cardChips = (
        <React.Fragment>
            {
                (Object.entries(props.mapIdsToHazards).length > 0) &&
                (<Chip
                    avatar={<Avatar>{HAZARD_SOCIAL_ICONS[hazardName]}</Avatar>}
                    size={props.chipSize}
                    label={t("labels:" + hazardName)} style={{ margin: '3px' }} />)
            }
        </React.Fragment>
    )
    const chipSection = props.expandButton ? (
        <Grid container direction='row'>
            <Grid container style={{ width: '90%' }} justify='flex-start' alignItems='center'>
                {cardChips}
            </Grid>
            <Grid container style={{ width: '10%' }} justify='center' alignItems='flex-end'>
                {props.expandButton}
            </Grid>
        </Grid>) : cardChips
    return (
        <React.Fragment>
            <CardHeader className={classes.header}
                title={props.item.name}
                titleTypographyProps={{ variant: textSizes.title }}
                action={locationButton}
            />
            <CardContent className={classes.content}>
                <Typography align="left" variant={textSizes.body} display='inline'>{t("social:event_start") + ' : '}</Typography>
                <Typography align="left" variant={textSizes.body} display='inline'>{' ' + formatter.format(new Date(props.item.started_at))}</Typography>
                <br />
                {props.item.updatet_at !== null && (
                    <React.Fragment>
                        <Typography align="left" variant={textSizes.body} display='inline'>{t("social:event_update") + ' : '}</Typography>
                        <Typography align="left" variant={textSizes.body} display='inline'>{' ' + formatter.format(new Date(props.item.updated_at))}</Typography>
                        <br />
                    </React.Fragment>
                )}
                {props.item.ended_at !== null && (
                    <React.Fragment>
                        <Typography align="left" variant={textSizes.body} display='inline'>{t("social:event_end") + ' : '}</Typography>
                        <Typography align="left" variant={textSizes.body} display='inline'>{' ' + formatter.format(new Date(props.item.ended_at))}</Typography>
                        <br />
                    </React.Fragment>
                )}
            </CardContent>
            <CardContent className={classes.content}>
                {chipSection}
            </CardContent>
        </React.Fragment>
    )
}

export default EventContent;