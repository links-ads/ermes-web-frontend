import React, { useReducer } from 'react';
import { Button, Grid } from '@material-ui/core';
import { IconButton, InputAdornment } from "@material-ui/core";
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import EventIcon from '@material-ui/icons/Event';

import { useTranslation } from 'react-i18next'


import filterReducer from '../common/filters/reducer'

import { getFiltersStyle, _MS_PER_DAY } from '../common/utils/utils.common'

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';



export const DashboardFilters = (props) => {
    const { t } = useTranslation(['social'])
    const [filters, dispatch] = useReducer(filterReducer, props.filters)
    const useStyles = makeStyles((theme: Theme) =>
        createStyles(getFiltersStyle(theme)));

    const classes = useStyles();

    const applyFilters = () =>{
        props.onFilterApply({startDate:filters.startDate.toISOString(),endDate:filters.endDate.toISOString()})
    }
    return (
        <Grid container direction={'row'} justify='space-around' className={classes.filterContainer}>
            <Grid container direction={'row'} justify='center' alignItems='center' style={{ display: 'flex', flex: 2, margin: 16 }}>
                <Grid item>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DateTimePicker
                            disableToolbar={false}
                            disableFuture={true}
                            invalidDateMessage={t("social:invalid_date_message")}
                            variant="inline"
                            format="MM/dd/yyyy - HH:mm"
                            id="starting-date"
                            label={t("social:starting_date")}
                            value={filters.startDate}
                            autoOk={true}
                            ampm={false}
                            onChange={(date) => dispatch({ type: 'START_DATE', value: date })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton>
                                            <EventIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
                <Grid item style={{ marginLeft: 8 }}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DateTimePicker
                            disableToolbar={false}
                            disableFuture={true}
                            variant="inline"
                            invalidDateMessage={t("social:invalid_date_message")}
                            format="MM/dd/yyyy - HH:mm"
                            id="end-date"
                            label={t("social:end_date")}
                            value={filters.endDate}
                            minDate={new Date(filters.startDate)}
                            maxDate={new Date(new Date(filters.startDate).valueOf() + _MS_PER_DAY * 30)}
                            maxDateMessage={t("social:time_span_error", { days: 30 })}
                            autoOk={true}
                            onChange={(date) => dispatch({ type: 'END_DATE', value: date })}
                            ampm={false}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton>
                                            <EventIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
            </Grid>
            <Grid container direction={'row'} justify="center" alignContent='center' style={{ display: 'flex', flex: 1 }}>
                <Grid>
                    <Button
                        className={classes.resetButton}
                        onClick={() => dispatch({ type: 'RESET', days: 30 })} size='small' variant='contained'>{t("social:filter_reset")}</Button>
                </Grid>
                <Grid>
                    <Button
                        className={classes.applyButton}
                        onClick={applyFilters} size='small' color='primary' variant='contained'>{t("social:filter_apply")}</Button>
                </Grid>
            </Grid>
        </Grid>
    )
}