import React, { useReducer, useMemo, useEffect, useState } from 'react';
// import DateFnsUtils from '@date-io/date-fns';
// import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
// import Grid from '@material-ui/core/Grid';
// import FormControl from '@material-ui/core/FormControl';

// import { IconButton, InputAdornment, Typography } from "@material-ui/core";
// import EventIcon from '@material-ui/icons/Event';

// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';
// import ListItemText from '@material-ui/core/ListItemText';
// import Input from '@material-ui/core/Input';

// import Button from '@material-ui/core/Button';
// import CircularProgress from '@material-ui/core/CircularProgress';


// import InputLabel from '@material-ui/core/InputLabel';
// import Checkbox from '@material-ui/core/Checkbox';

// import { useTranslation } from 'react-i18next'

// import { SocialModuleLanguageType } from 'ermes-backoffice-ts-sdk';

// import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

// import filterReducer from './reducer';
// import { getFiltersStyle, _MS_PER_DAY } from '../../utils/utils.common';
// import useLanguage from '../../hooks/use-language.hook';

// import Collapse from '@material-ui/core/Collapse';



const SocialFilter = (props) => {
//     const useStyles = makeStyles((theme: Theme) =>
//         createStyles(getFiltersStyle(theme)));

//     const classes = useStyles();


//     const { t, i18n } = useTranslation(['social', 'labels'])
//     const langKeys = useMemo(() => Object.values(SocialModuleLanguageType), [])
//     const informativeValues = ["true", "false"]

//     const [filters, dispatch] = useReducer(filterReducer, props.filters)
//     const dateOptions = { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' } as Intl.DateTimeFormatOptions

//     const { dateFormat, dateLocale } = useLanguage()

//     const resetFilters = () => {
//         dispatch({ type: 'RESET' })
//     }

//     // useEffect(() => {
//     //     forceFiltersDateRange(filters.startDate.getTime(), filters.endDate.getTime(), _MS_PER_DAY * 4, (newDate) => dispatch({ type: 'END_DATE', value: new Date(newDate) }))
//     // }, [filters.startDate, filters.endDate])

//     // const applyFilters = () => {

//     //     let hazardIds = filters.hazardSelect?.map(item => props.mapHazardsToIds[item])
//     //     let infoIds = filters.infoTypeSelect?.map(item => props.mapInfosToIds[item])
//     //     let informative = filters.informativeSelect === '' ? undefined : filters.informativeSelect === 'true'
//     //     let args = {
//     //         languageSelect: filters.languageSelect, informativeSelect: informative, startDate: filters.startDate.toISOString(),
//     //         endDate: filters.endDate.toISOString(), infoTypeSelect: infoIds, hazardSelect: hazardIds
//     //     }
//     //     setExpanded(false)
//     //     setLastUpdate(new Date())
//     //     props.onFilterApply(args)
//     // }


//     const selectionChangeHandler = (event, names, type) => {
//         let selectedValues = event.target.value
//         const value = selectedValues.length === names.length ? [] : selectedValues
//         dispatch({ type: type, value: value })
//     };

//     const renderValues = (selected, prefix) => {
//         if (selected.length <= 2)
//             return selected.map(key => t(prefix + key)).join(', ')
//         else
//             return selected.slice(0, 2).map(key => t(prefix + key)).join(', ') + ", ..."
//     }

//     const renderOptions = (names, state, prefix) => {
//         if (names.length === 0 && props.isError)
//             return (<Grid style={{ padding: 2 }}><Typography align="left" variant="caption">{t("social:fetch_error")}</Typography></Grid>)
//         if (names.length === 0)
//             return (<Grid container justify="center"><CircularProgress disableShrink /></Grid>)
//         else
//             return names.map((value) => (
//                 <MenuItem
//                     key={value}
//                     value={value}
//                 >
//                     <Checkbox checked={state.indexOf(value) > -1} />
//                     <ListItemText primary={t(prefix + value)} />
//                 </MenuItem>
//             ))
//     }
//     const [expanded, setExpanded] = useState(false);
//     const [lastUpdate, setLastUpdate] = useState(new Date());

//     // const filtersString = useMemo(() => {
//     //     const sep = ' • '
//     //     let formatter = new Intl.DateTimeFormat(dateLocale, dateOptions)
//     //     let filterRep = ''
//     //     let dateRep = formatter.format(filters.startDate) + sep + formatter.format(filters.endDate)
//     //     let langRep = filters.languageSelect!.length === 0 ? t('social:lang_none') : filters.languageSelect!.join(',')
//     //     let hazardRep = filters.hazardSelect!.length === 0 ? t('social:lang_none') : filters.hazardSelect!.map(e => t('labels:' + e)).join(',')
//     //     let infoTypeRep = filters.infoTypeSelect!.length === 0 ? t('social:lang_none') : filters.infoTypeSelect!.map(e => t('labels:' + e)).join(',')
//     //     console.log(filters.informativeSelect)
//     //     let informativeRep = props.renderInformative ? (filters.informativeSelect === '' ? sep + t("social:information_none") : sep + t("social:informative_" + filters.informativeSelect)) : ''
//     //     filterRep = dateRep + sep + langRep + sep + hazardRep + sep + infoTypeRep + informativeRep
//     //     return filterRep
//     // }, [i18n.language, lastUpdate])

//     return (
//         <Grid container direction={'column'} className={classes.filterContainer}>
//             <Grid container style={{cursor: 'pointer'}} onClick={() => setExpanded(!expanded)} justify='center'>
//                 <Typography variant='body1' display="inline">
//                     {filtersString}
//                 </Typography>
//             </Grid>
//             <Collapse in={expanded} timeout="auto" unmountOnExit>
//                 <Grid container direction={'row'} justify="space-evenly" alignItems="flex-start" className={classes.filterContainer}>
//                     <Grid style={{ display: 'flex', flex: 1.5 }} container className={classes.filterSection} direction={'column'}
//                         justify="space-around" >
//                         <Grid item >
//                             <MuiPickersUtilsProvider utils={DateFnsUtils}>
//                                 <DateTimePicker
//                                     disableToolbar={false}
//                                     disableFuture={true}
//                                     variant="inline"
//                                     format={dateFormat}
//                                     id="starting-date"
//                                     label={t("social:starting_date")}
//                                     value={filters.startDate}
//                                     autoOk={true}
//                                     ampm={false}
//                                     onChange={(date) => dispatch({ type: 'START_DATE', value: date })}
//                                     InputProps={{
//                                         startAdornment: (
//                                             <InputAdornment position="start">
//                                                 <IconButton>
//                                                     <EventIcon />
//                                                 </IconButton>
//                                             </InputAdornment>
//                                         ),
//                                     }}
//                                 />
//                             </MuiPickersUtilsProvider>
//                         </Grid>
//                         <Grid item >
//                             <MuiPickersUtilsProvider utils={DateFnsUtils}>
//                                 <DateTimePicker
//                                     disableToolbar={false}
//                                     disableFuture={true}
//                                     variant="inline"
//                                     format={dateFormat}
//                                     id="end-date"
//                                     label={t("social:end_date")}
//                                     value={filters.endDate}
//                                     minDate={new Date(filters.startDate)}
//                                     maxDate={new Date(new Date(filters.startDate).valueOf() + _MS_PER_DAY * 4)}
//                                     autoOk={true}
//                                     onChange={(date) => dispatch({ type: 'END_DATE', value: date })}
//                                     ampm={false}
//                                     margin="normal"
//                                     InputProps={{
//                                         startAdornment: (
//                                             <InputAdornment position="start">
//                                                 <IconButton>
//                                                     <EventIcon />
//                                                 </IconButton>
//                                             </InputAdornment>
//                                         ),
//                                     }}
//                                 />
//                             </MuiPickersUtilsProvider>
//                         </Grid>
//                     </Grid>
//                     <Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} direction={'column'} alignItems="flex-start" justify="space-around" >
//                         <FormControl
//                             className={classes.selectOption}
//                         >
//                             <InputLabel id={'multi-lang-label'}>{t("social:filter_language")}</InputLabel>
//                             <Select
//                                 labelId={'multi-lang-label'}
//                                 id={"multi-lang-select"}
//                                 multiple
//                                 value={filters.languageSelect}
//                                 onChange={(event, value) => selectionChangeHandler(event, langKeys, 'LANGUAGES')}
//                                 input={<Input />}
//                                 renderValue={(selected) => renderValues(selected, "social:lang_")}
//                             >
//                                 {renderOptions(langKeys, filters.languageSelect, "social:lang_")}
//                             </Select>
//                         </FormControl>
//                     </Grid>
//                     <Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} alignItems="flex-start" justify="space-around" >
//                         <FormControl
//                             className={classes.selectOption}
//                         >
//                             <InputLabel id={'multi-hazard-label'}>{t("social:filter_hazard")}</InputLabel>
//                             <Select
//                                 labelId={'multi-hazard-label'}
//                                 id={"multi-hazard-select"}
//                                 multiple
//                                 value={filters.hazardSelect}
//                                 onChange={(event, value) => selectionChangeHandler(event, props.hazardNames, 'HAZARDS')}
//                                 input={<Input />}
//                                 renderValue={(selected) => renderValues(selected, "labels:")}
//                             >
//                                 {renderOptions(props.hazardNames, filters.hazardSelect, "labels:")}
//                             </Select>
//                         </FormControl>
//                     </Grid>
//                     <Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} alignItems="flex-start" justify="space-around" >
//                         <FormControl
//                             className={classes.selectOption}
//                         >
//                             <InputLabel id={'multi-info-label'}>{t("social:filter_info")}</InputLabel>
//                             <Select
//                                 labelId={'multi-info-label'}
//                                 id={"multi-info-select"}
//                                 multiple
//                                 value={filters.infoTypeSelect}
//                                 onChange={(event, value) => selectionChangeHandler(event, props.infoNames, 'INFORMATIONS')}
//                                 input={<Input />}
//                                 renderValue={(selected) => renderValues(selected, "labels:")}
//                             >
//                                 {renderOptions(props.infoNames, filters.infoTypeSelect, "labels:")}
//                             </Select>
//                         </FormControl>
//                     </Grid>
//                     {props.renderInformative && (<Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} alignItems="flex-start" justify="space-around" >
//                         <FormControl
//                             className={classes.selectOption}
//                         >
//                             <InputLabel id="informative-select-label">{t("social:informative_info")}</InputLabel>
//                             <Select
//                                 labelId="informative-select-label"
//                                 id="informative-select"
//                                 value={filters.informativeSelect}
//                                 onChange={(event, value) => dispatch({ type: 'INFORMATIVE', value: event.target.value as string })}
//                                 input={<Input />}
//                                 renderValue={item => t("social:informative_" + item)}
//                             >
//                                 <MenuItem key="none" value="">{t("social:information_none")}</MenuItem>
//                                 {informativeValues.map((value) => (
//                                     <MenuItem
//                                         key={value}
//                                         value={value}
//                                     >
//                                         <ListItemText primary={t("social:informative_" + value)} />
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                     </Grid>)}
//                     <Grid style={{ display: 'flex', flex: 1 }} container className={classes.filterSection} direction={'column'} justify="space-evenly" alignContent='center'>
//                         <Grid>
//                             <Button className={classes.resetButton} onClick={resetFilters} size='small' variant='contained'>{t("social:filter_reset")}</Button>
//                         </Grid>
//                         <Grid>
//                             <Button className={classes.applyButton} onClick={applyFilters} size='small' color='primary' variant='contained'>{t("social:filter_apply")}</Button>
//                         </Grid>
//                     </Grid>
//                 </Grid>
//             </Collapse>
//         </Grid>
//     );
    return null
}


export default SocialFilter;

export const forceFiltersDateRange = (startDate, endDate, range, updateEndDate) => {
    if (Math.abs(endDate - startDate) > range) {
        updateEndDate(startDate + range)
    }
}