import { Avatar, CardContent, CardHeader, Chip, Grid, Typography } from '@material-ui/core';
import React from 'react';

import { useTranslation } from 'react-i18next'
import { HAZARD_SOCIAL_ICONS } from '../common/utils/utils.common';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';


const EventContent = (props) => {
    let dateOptions = { dateStyle: 'short', timeStyle: 'short', hour12: false } as Intl.DateTimeFormatOptions
    let formatter = new Intl.DateTimeFormat('en-US', dateOptions)
    let hazardName = props.mapIdsToHazards[props.item.hazard_id]
    const { t } = useTranslation(['social'])

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            header: {
                margin: '5px',
                padding: 5
            },
            content: {
                margin: '5px',
                padding: '5px 10px'
            }
        }));


    const classes = useStyles();

    const textSizes = props.textSizes

    return (
        <React.Fragment>
            <CardHeader className={classes.header}
                title={props.item.name}
                titleTypographyProps={{ variant: textSizes.title }}
            />
            <CardContent className={classes.content}>
                    <Typography align="left" variant={textSizes.body} display='inline'>{t("social:event_start") + ' : '}</Typography>
                    <Typography align="left" variant={textSizes.body} display='inline'>{' '+formatter.format(new Date(props.item.started_at))}</Typography>
                <br/>
                {props.item.updatet_at !== null && (
                    <React.Fragment>
                        <Typography align="left" variant={textSizes.body} display='inline'>{t("social:event_update") + ' : '}</Typography>
                        <Typography align="left" variant={textSizes.body} display='inline'>{' '+formatter.format(new Date(props.item.updated_at))}</Typography>
                        <br/>
                    </React.Fragment>
                )}
                {props.item.ended_at !== null && (
                    <React.Fragment>
                        <Typography align="left" variant={textSizes.body} display='inline'>{t("social:event_end") + ' : '}</Typography>
                        <Typography align="left" variant={textSizes.body} display='inline'>{' '+formatter.format(new Date(props.item.ended_at))}</Typography>
                        <br/>
                    </React.Fragment>
                )}
            </CardContent>
            <CardContent className={classes.content}>
                {
                    (Object.entries(props.mapIdsToHazards).length > 0) &&
                    (<Chip
                    avatar={<Avatar>{HAZARD_SOCIAL_ICONS[hazardName]}</Avatar>}
                    size={props.chipSize}
                    label={t("social:hazard_" + hazardName)} style={{ margin: '3px' }} />)
                }
            </CardContent>
        </React.Fragment>
    )
}

export default EventContent;