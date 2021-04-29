import React, { useReducer, useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment, Typography } from "@material-ui/core";
import EventIcon from '@material-ui/icons/Event';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Input from '@material-ui/core/Input';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';


import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { useTranslation } from 'react-i18next'

import { SocialModuleLanguageType } from 'ermes-backoffice-ts-sdk';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import filterReducer from './reducer';

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

const SocialFilter = (props) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            filterSection: {
                padding: '16px 8px',
                marginLeft: '8px',
                minWidth: 180,
                width: '15vw'
            },
            applyButton: {
                color: theme['palette']['text']['primary'],
                backgroundColor: theme['palette']['background']['paper'],
                margin: '8px'
            },
            resetButton: {
                color: theme['palette']['text']['primary'],
                backgroundColor: theme['palette']['grey']['600'],
                margin: '8px'
            },
            selectOption: {
                width: '100%',
                minWidth: 180,
                // maxWidth:180

            }

        }));

    const classes = useStyles();


    const { t } = useTranslation(['social'])
    const enumLangKeys = Object.values(SocialModuleLanguageType)
    const langKeys = enumLangKeys
    const informativeValues = ["true", "false"]

    const [dialogOpen, setDialogOpen] = useState(false)

    const [filters, dispatch] = useReducer(filterReducer,props.filters)

    const resetFilters = () => {
        dispatch({ type: 'RESET' })
    }

    const applyFilters = () => {
        if (Math.abs(filters.endDate.getTime() - filters.startDate.getTime()) > _MS_PER_DAY * 4) {
            setDialogOpen(true)
            return
        }
        let hazardIds = filters.hazardSelect.map(item => props.mapHazardsToIds[item])
        let infoIds = filters.infoTypeSelect.map(item => props.mapInfosToIds[item])
        let informative = filters.informativeSelect === '' ? undefined : filters.informativeSelect === 'true'
        let args = {
            languageSelect: filters.languageSelect, informativeSelect: informative, startDate: filters.startDate.toISOString(),
            endDate: filters.endDate.toISOString(), infoTypeSelect: infoIds, hazardSelect: hazardIds
        }
        props.onFilterApply(args)
    }


    const selectionChangeHandler = (event, names, type) => {
        let selectedValues = event.target.value
        const value = selectedValues.length === names.length ? [] : selectedValues
        dispatch({ type: type, value: value })
    };

    const renderValues = (selected, prefix) => {
        if (selected.length <= 2)
            return selected.map(key => t(prefix + key)).join(', ')
        else
            return selected.slice(0, 2).map(key => t(prefix + key)).join(', ') + ", ..."
    }

    const renderOptions = (names, state, prefix) => {
        if (names.length === 0 && props.isError)
            return (<Grid style={{ padding: 2 }}><Typography align="left" variant="caption">{t("social:fetch_error")}</Typography></Grid>)
        if (names.length === 0)
            return (<Grid container justify="center"><CircularProgress disableShrink /></Grid>)
        else
            return names.map((value) => (
                <MenuItem
                    key={value}
                    value={value}
                >
                    <Checkbox checked={state.indexOf(value) > -1} />
                    <ListItemText primary={t(prefix + value)} />
                </MenuItem>
            ))
    }

    return (
        <Grid container direction={'row'} justify="space-evenly" alignItems="flex-start" >
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{t("social:error")}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t("social:time_span_error")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary">Ok</Button>
                </DialogActions>
            </Dialog>
            <Grid style={{ display: 'flex', flex: 1.5 }} container className={classes.filterSection} direction={'column'}
                justify="space-around" >
                <Grid item >
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
                <Grid item >
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
                            maxDate={new Date(new Date(filters.startDate).valueOf() + _MS_PER_DAY * 4)}
                            maxDateMessage={t("social:time_span_error")}
                            autoOk={true}
                            onChange={(date) => dispatch({ type: 'END_DATE', value: date })}
                            ampm={false}
                            margin="normal"
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
            <Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} direction={'column'} alignItems="flex-start" justify="space-around" >
                <FormControl
                    className={classes.selectOption}
                >
                    <InputLabel id={'multi-lang-label'}>{t("social:filter_language")}</InputLabel>
                    <Select
                        labelId={'multi-lang-label'}
                        id={"multi-lang-select"}
                        multiple
                        value={filters.languageSelect}
                        onChange={(event, value) => selectionChangeHandler(event, langKeys, 'LANGUAGES')}
                        input={<Input />}
                        renderValue={(selected) => renderValues(selected, "social:lang_")}
                    >
                        {renderOptions(langKeys, filters.languageSelect, "social:lang_")}
                    </Select>
                </FormControl>
            </Grid>
            <Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} alignItems="flex-start" justify="space-around" >
                <FormControl
                    className={classes.selectOption}
                >
                    <InputLabel id={'multi-hazard-label'}>{t("social:filter_hazard")}</InputLabel>
                    <Select
                        labelId={'multi-hazard-label'}
                        id={"multi-hazard-select"}
                        multiple
                        value={filters.hazardSelect}
                        onChange={(event, value) => selectionChangeHandler(event, props.hazardNames, 'HAZARDS')}
                        input={<Input />}
                        renderValue={(selected) => renderValues(selected, "social:hazard_")}
                    >
                        {renderOptions(props.hazardNames, filters.hazardSelect, "social:hazard_")}
                    </Select>
                </FormControl>
            </Grid>
            <Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} alignItems="flex-start" justify="space-around" >
                <FormControl
                    className={classes.selectOption}
                >
                    <InputLabel id={'multi-info-label'}>{t("social:filter_info")}</InputLabel>
                    <Select
                        labelId={'multi-info-label'}
                        id={"multi-info-select"}
                        multiple
                        value={filters.infoTypeSelect}
                        onChange={(event, value) => selectionChangeHandler(event, props.infoNames, 'INFORMATIONS')}
                        input={<Input />}
                        renderValue={(selected) => renderValues(selected, "social:information_")}
                    >
                        {renderOptions(props.infoNames, filters.infoTypeSelect, "social:information_")}
                    </Select>
                </FormControl>
            </Grid>
            {props.renderInformative && (<Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} alignItems="flex-start" justify="space-around" >
                <FormControl
                    className={classes.selectOption}
                >
                    <InputLabel id="informative-select-label">{t("social:informative_info")}</InputLabel>
                    <Select
                        labelId="informative-select-label"
                        id="informative-select"
                        value={filters.informativeSelect}
                        onChange={(event, value) => dispatch({ type: 'INFORMATIVE', value: event.target.value as string })}
                        input={<Input />}
                        renderValue={item => t("social:informative_" + item)}
                    >
                        <MenuItem key="none" value="">{t("social:information_none")}</MenuItem>
                        {informativeValues.map((value) => (
                            <MenuItem
                                key={value}
                                value={value}
                            >
                                <ListItemText primary={t("social:informative_" + value)} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>)}
            <Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} direction={'column'} justify="space-evenly" alignContent='center'>
                <Grid>
                    <Button className={classes.resetButton} onClick={resetFilters} size='small' variant='contained'>{t("social:filter_reset")}</Button>
                </Grid>
                <Grid>
                    <Button className={classes.applyButton} onClick={applyFilters} size='small' color='primary' variant='contained'>{t("social:filter_apply")}</Button>
                </Grid>
            </Grid>
        </Grid>
    );
}


export default SocialFilter;