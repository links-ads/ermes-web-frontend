import { Avatar, CardContent, CardHeader, Chip, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next'
import { HAZARD_SOCIAL_ICONS } from '../../../../utils/utils.common';
import { Theme } from '@mui/material/styles';
import useLanguage from '../../../../hooks/use-language.hook';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { clearEventMap } from '../../../../common/map/map-common';
import { IconButton } from '@mui/material';
// import MaterialTable from 'material-table'
import MaterialTable from '@material-table/core'
import { localizeMaterialTable } from '../../../../common/localize-material-table'
import { makeStyles } from 'tss-react/mui';




const EventContent = (props) => {
    const { dateLocale } = useLanguage()
    let dateOptions = { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' } as Intl.DateTimeFormatOptions
    let formatter = new Intl.DateTimeFormat(dateLocale, dateOptions)
    let hazardName = props.mapIdsToHazards[props.item.hazard_id]
    const { t } = useTranslation(['social', 'labels','tables'])

    const useStyles = makeStyles()((theme: Theme) =>
        {return {
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
        }});

    const impactEstimation = useMemo(() => {
        if (!props.item.impact_estimation) return null
        const impact =  Object.entries(props.item.impact_estimation).flatMap((e: any) => Object.entries(e[1]))
            .filter((e: any) => e[1]['impacted'])
            .map((e: any) => {
                return { "category": e[0], "estimate": e[1]['count'] }
            })
        return impact.length === 0 ? null : impact
    }, [props.item.impact_estimation])

    const impactEstimationColumn = useMemo(() => {
        return [
            {
                title: t('category'), field: 'category', render: (rowData) => t("labels:" + rowData.category)
            },
            { title: t('estimate'), field: 'estimate' }
        ]
    }, [t])

    const {classes} = useStyles();

    const textSizes = props.textSizes

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

    const locationButton = (props.pointCoordinates && props.renderLocation) ? (
        <IconButton onClick={() => {
            if (props.mapRef.current) {
                try {
                    const map = props.mapRef?.current.getMap()
                    const centroid = props.item.hotspots_centroid.coordinates
                    clearEventMap(map, props.setLeftClickState, props.leftClickState)
                    map?.flyTo(
                        {
                            center: centroid
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
    ) : (
        <div style={{ marginTop: 8 }}>
            {cardChips}
        </div>
    )

    const chipSection = props.expandButton && (
        <CardContent className={classes.content}>
            <Grid container direction='row'>
                <Grid container style={{ width: '90%' }} justifyContent='flex-start' alignItems='center'>
                    {cardChips}
                </Grid>
                <Grid container style={{ width: '10%' }} justifyContent='center' alignItems='flex-end'>
                    {props.expandButton}
                </Grid>
            </Grid>
        </CardContent>)

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
                {props.item.updatet_at && (
                    <React.Fragment>
                        <Typography align="left" variant={textSizes.body} display='inline'>{t("social:event_update") + ' : '}</Typography>
                        <Typography align="left" variant={textSizes.body} display='inline'>{' ' + formatter.format(new Date(props.item.updated_at))}</Typography>
                        <br />
                    </React.Fragment>
                )}
                {props.item.ended_at && (
                    <React.Fragment>
                        <Typography align="left" variant={textSizes.body} display='inline'>{t("social:event_end") + ' : '}</Typography>
                        <Typography align="left" variant={textSizes.body} display='inline'>{' ' + formatter.format(new Date(props.item.ended_at))}</Typography>
                        <br />
                    </React.Fragment>
                )}
            </CardContent>
            {chipSection}
            {
                (impactEstimation && !props.renderLocation) && (
                    <div style={{ margin: 5, padding: 5, overflowY: 'auto' }}>
                        <Typography align="center" variant={textSizes.title} display='inline'>{t("social:impact_estimation")}</Typography>
                        <MaterialTable
                            data={impactEstimation}
                            columns={impactEstimationColumn}
                            options={{
                                search: false,
                                toolbar: false,
                                showTitle: false,
                                paging: false,
                                emptyRowsWhenPaging: false,
                                doubleHorizontalScroll: false,
                                // exportButton: false,
                                exportAllData: false
                            }}
                            localization={{
                                ...localizeMaterialTable(t),
                            }}
                        />
                    </div>
                )
            }
        </React.Fragment >
    )
}

export default EventContent;