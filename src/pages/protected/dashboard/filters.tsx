import React, { useCallback, useEffect, useReducer, useState } from 'react'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Select,
  SvgIcon,
  Typography
} from '@material-ui/core'
import { DatePicker, LocaleProvider } from 'antd'
import { Locale } from 'antd/es/locale-provider'
import it_IT from 'antd/es/locale/it_IT'
import en_GB from 'antd/es/locale/en_GB'

import { useTranslation } from 'react-i18next'

import filterReducer from '../../../common/filters/reducer'

import { getFiltersStyle, _MS_PER_DAY } from '../../../utils/utils.common'

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import moment from 'moment'
import 'moment/locale/it'
import 'moment/locale/en-gb'
import './filters.css'
import { ArrowDropDown } from '@material-ui/icons'
import { EmergencyColorMap } from '../map/api-data/emergency.component'

const MAP_REQUEST_STATUS_DEFAULT = ['RequestSubmitted', 'ContentAvailable', 'ContentNotAvailable']
const HAZARD_VISIBILITY_DEFAULT = 'Private'

export const DashboardFilters = (props) => {
  const { t, i18n } = useTranslation(['social', 'filters'])
  const [filters, dispatch] = useReducer(filterReducer, props.filters)
  const { datestart, dateend } = filters
  const useStyles = makeStyles((theme: Theme) => createStyles(getFiltersStyle(theme)))
  const [hasReset, setHasReset] = useState(false)
  const { language } = i18n
  const [locale, setLocale] = useState<Locale>(language === it_IT.locale ? it_IT : en_GB)
  const { localStorageFilters, mapDrawerTabVisibility, onFilterChecked } = props
  const { filters: allFilters } = localStorageFilters
  const { Person, Report, Mission, Communication, MapRequest } = mapDrawerTabVisibility
  const [personChecked, setPersonChecked] = useState<boolean>(Person)
  const [reportChecked, setReportChecked] = useState<boolean>(Report)
  const [missionChecked, setMissionChecked] = useState<boolean>(Mission)
  const [communicationChecked, setCommunicationChecked] = useState<boolean>(Communication)
  const [mapRequestChecked, setMapRequestChecked] = useState<boolean>(MapRequest)
  const [filtersState, setFiltersState] = useState(allFilters)
  const [dateErrorStatus, setDateErrorStatus] = useState<boolean>(false)
  const [dateErrorMessage, setDateErrorMessage] = useState<string>('')

  const classes = useStyles()

  useEffect(() => {
    setPersonChecked(Person)
    setReportChecked(Report)
    setMissionChecked(Mission)
    setCommunicationChecked(Communication)
    setMapRequestChecked(MapRequest)
  }, [Person, Report, Mission, Communication, MapRequest])

  const applyPersonFilters = (personFilters) => {
    const newFilters = filtersState
    const contentLength = newFilters.persons.content.length
    for (let i = 0; i < contentLength; i++) {
      newFilters.persons.content[i].selected = personFilters.content[i].selected
    }
    setFiltersState({ ...newFilters })
    props.onFilterApply({
      ...localStorageFilters,
      filters: filtersState
    })
  }

  const applyReportFilters = (reportFilters) => {
    const newFilters = filtersState
    const contentLength = newFilters.report.content.length
    for (let i = 0; i < contentLength; i++) {
      newFilters.report.content[i].selected = reportFilters.content[i].selected
    }
    setFiltersState({ ...newFilters })
    props.onFilterApply({
      ...localStorageFilters,
      filters: filtersState
    })
  }

  const applyMissionFilters = (missionFilters) => {
    const newFilters = filtersState
    const contentLength = newFilters.mission.content.length
    for (let i = 0; i < contentLength; i++) {
      newFilters.mission.content[i].selected = missionFilters.content[i].selected
    }
    setFiltersState({ ...newFilters })
    props.onFilterApply({
      ...localStorageFilters,
      filters: filtersState
    })
  }

  const applyMapRequestFilters = (mapRequestFilters) => {
    const newFilters = filtersState
    const contentLength = newFilters.mapRequests.content.length
    for (let i = 0; i < contentLength; i++) {
      newFilters.mapRequests.content[i].selected = mapRequestFilters.content[i].selected
    }
    setFiltersState({ ...newFilters })
    props.onFilterApply({
      ...localStorageFilters,
      filters: filtersState
    })
  }

  const applyFilters = () => {
    props.onDateFilterApply({
      datestart: filters.datestart,
      dateend: filters.dateend
    })
  }

  const resetFilters = () => {
    dispatch({ type: 'RESET' })
    setHasReset(true)
    setDateErrorStatus(false)
    setDateErrorMessage('')
  }

  function range(start, end) {
    const result: any[] = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }

  function disabledStartDate(current) {
    // Can not select days after end date
    return current && current > moment(filters.dateend).endOf('minute')
  }

  function disabledEndDate(current) {
    // Can not select days before start date
    return current && current < moment(filters.datestart).startOf('minute')
  }

  function disableStartDateTime() {
    const maxHour = moment(filters.dateend).hour()
    const maxMinute = moment(filters.dateend).minute()
    return {
      disabledHours: () => range(maxHour, 24),
      disabledMinutes: () => range(maxMinute, 60)
    }
  }

  function disableEndDateTime() {
    const minHour = moment(filters.datestart).hour()
    const minMinute = moment(filters.datestart).minute()
    return {
      disabledHours: () => range(0, minHour),
      disabledMinutes: () => range(0, minMinute + 1)
    }
  }

  const checkDateValidity = useCallback((startDate, endDate) => {
    const momentStartDate = moment(startDate)
    const momentEndDate = moment(endDate)

    if (momentStartDate.isAfter(momentEndDate, 'minute')) {
      setDateErrorStatus(true)
      setDateErrorMessage('date_filters_same_error')
    } else if (momentStartDate.isSame(momentEndDate, 'minute')) {
      setDateErrorStatus(true)
      setDateErrorMessage('date_filters_after_error')
    } else {
      setDateErrorStatus(false)
      setDateErrorMessage('')
    }
  }, [])

  const updateStartDate = (date) => {
    dispatch({ type: 'START_DATE', value: date?.toDate() })
    setHasReset(false)
  }

  const updateEndDate = (date) => {
    dispatch({ type: 'END_DATE', value: date?.toDate() })
    setHasReset(false)
  }

  useEffect(() => {
    checkDateValidity(datestart, dateend)
  }, [datestart, dateend])

  useEffect(() => {
    if (hasReset) {
      applyFilters()
      setHasReset(false)
    }
  }, [hasReset])

  useEffect(() => {
    moment.locale(language)
    setLocale(language === it_IT.locale ? it_IT : en_GB)
  }, [language])

  return (
    <Grid
      container
      direction={'row'}
      justifyContent="space-around"
      className={classes.filterContainer}
    >
      <Grid direction={'column'} container>
        <Grid
          container
          direction={'row'}
          justifyContent="center"
          alignItems="center"
          style={{ flex: 2 }}
        >
          <Grid item>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              {t('social:starting_date')}
            </label>
            <LocaleProvider locale={locale}>
              <DatePicker
                id="starting-date"
                disabledDate={disabledStartDate}
                disabledTime={disableStartDateTime}
                onChange={updateStartDate}
                showTime={{
                  defaultValue: moment(moment(filters.datestart), 'HH:mm'),
                  format: 'HH:mm'
                }}
                defaultValue={moment(filters.datestart)}
                value={moment(filters.datestart)}
                allowClear
                format="ddd DD MMMM YYYY - HH:mm"
                style={{ width: '280px' }}
                locale={locale}
              />
              <span style={{ display: 'flex', flexDirection: 'column', color: 'red' }}>
                {t(`filters:${dateErrorMessage}`)}
              </span>
            </LocaleProvider>
          </Grid>
          <Grid item style={{ marginLeft: 8 }}>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              {t('social:end_date')}
            </label>
            <LocaleProvider locale={locale}>
              <DatePicker
                id="end-date"
                disabledDate={disabledEndDate}
                disabledTime={disableEndDateTime}
                onChange={updateEndDate}
                showTime={{
                  defaultValue: moment(moment(filters.dateend), 'HH:mm'),
                  format: 'HH:mm'
                }}
                defaultValue={moment(filters.dateend)}
                value={moment(filters.dateend)}
                allowClear
                format="ddd DD MMMM YYYY - HH:mm"
                style={{ width: '280px' }}
                locale={locale}
              />
              <span style={{ display: 'flex', flexDirection: 'column', color: 'red' }}>
                {t(`filters:${dateErrorMessage}`)}
              </span>
            </LocaleProvider>
          </Grid>
          <Grid item style={{ marginLeft: 40 }}>
            <Button
              className={classes.applyButton}
              style={{ textTransform: 'capitalize' }}
              onClick={applyFilters}
              size="small"
              color="primary"
              variant="contained"
              disabled={dateErrorStatus}
            >
              {t('social:filter_apply')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              className={classes.resetButton}
              style={{ textTransform: 'capitalize' }}
              onClick={resetFilters}
              size="small"
              variant="contained"
            >
              {t('social:filter_reset')}
            </Button>
          </Grid>
        </Grid>
        <Grid
          container
          direction={'row'}
          justifyContent="center"
          alignItems="center"
          spacing={1}
          style={{ flexGrow: 1, marginTop: 3 }}
        >
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label="persons"
              emergencyLabel="Person"
              category={filtersState.persons}
              applyFilters={applyPersonFilters}
              filterCheckedHandler={onFilterChecked}
              isChecked={personChecked}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label="report"
              emergencyLabel="Report"
              category={filtersState.report}
              applyFilters={applyReportFilters}
              filterCheckedHandler={onFilterChecked}
              isChecked={reportChecked}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label="mission"
              emergencyLabel="Mission"
              category={filtersState.mission}
              applyFilters={applyMissionFilters}
              filterCheckedHandler={onFilterChecked}
              isChecked={missionChecked}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label="Communication"
              emergencyLabel="Communication"
              filterCheckedHandler={onFilterChecked}
              isChecked={communicationChecked}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label="MapRequest"
              emergencyLabel="MapRequest"
              category={filtersState.mapRequests}
              applyFilters={applyMapRequestFilters}
              isChecked={mapRequestChecked}
              filterCheckedHandler={onFilterChecked}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

const CategoryPinBorderIcon = (props) => {
  return (
    <SvgIcon
      {...props}
      viewBox="-1.5 -1.5 18.00 18.00"
      htmlColor={EmergencyColorMap[props.colorlabel]}
    >
      <path
        d="M7.5,14.941l-.4-.495c-.973-1.189-4.9-6.556-4.9-9.16A5.066,5.066,0,0,1,7.036,0q.222-.01.445,0a5.066,5.066,0,0,1,5.286,4.836q.01.225,0,.45c0,2.213-2.669,6.111-4.678,8.851ZM7.481.986a4.077,4.077,0,0,0-4.3,4.3c0,1.832,2.759,6.038,4.286,8.034,1.25-1.71,4.315-5.989,4.315-8.034a4.077,4.077,0,0,0-4.3-4.3Z"
        stroke={EmergencyColorMap[props.colorlabel]}
        strokeWidth={1.5}
      ></path>
    </SvgIcon>
  )
}

const CategoryPinIcon = (props) => {
  return (
    <SvgIcon
      {...props}
      viewBox="-1.5 -1.5 18.00 18.00"
      htmlColor={EmergencyColorMap[props.colorlabel]}
    >
      <path d="M7.5,0C5.0676,0,2.2297,1.4865,2.2297,5.2703 C2.2297,7.8378,6.2838,13.5135,7.5,15c1.0811-1.4865,5.2703-7.027,5.2703-9.7297C12.7703,1.4865,9.9324,0,7.5,0z"></path>
    </SvgIcon>
  )
}

const CategoryFilter = (props) => {
  const { t, classes, label, category, applyFilters, isChecked, filterCheckedHandler } = props
  const [categoryFilters, setCategoryFilters] = useState(category)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // function that renders in the dropdown menu the names, if 3+ it adds dots to avoid cluttering
  const renderValues = (selected, prefix) => {
    if (selected.length <= 2)
      return selected.map((key) => t(prefix + key.toLowerCase()) || key).join(', ')
    else
      return (
        selected
          .slice(0, 2)
          .map((key) => t(prefix + key.toLowerCase()) || key)
          .join(', ') + ', ...'
      )
  }

  const handleCheckBoxChange = (event, value) => {
    filterCheckedHandler(event.target.value, value)
  }

  const applyCategoryFilters = useCallback(() => {
    applyFilters(categoryFilters)
    handleClose()
  }, [])

  const resetCategoryFilters = useCallback(() => {
    const newCategoryFilters = categoryFilters
    newCategoryFilters.content.forEach((c) => {
      if (c.name === 'hazard_visibility') {
        c.selected = HAZARD_VISIBILITY_DEFAULT
      } else if (c.name === 'map_request_status') {
        c.selected = MAP_REQUEST_STATUS_DEFAULT
      } else {
        c.selected = []
      }
    })
    setCategoryFilters({ ...newCategoryFilters })
    applyFilters(newCategoryFilters)
    handleClose()
  }, [])

  return (
    <Paper elevation={3}>
      <FormControlLabel
        className={classes.filterCheckbox}
        control={
          <Checkbox
            icon={<CategoryPinBorderIcon colorlabel={props.emergencyLabel} />}
            checkedIcon={<CategoryPinIcon colorlabel={props.emergencyLabel} />}
            name={'checked-' + props.emergencyLabel}
            size="small"
            onChange={handleCheckBoxChange}
            value={props.emergencyLabel}
            checked={isChecked}
          />
        }
        label={<Typography variant="body2">{t('labels:' + label)}</Typography>}
      />
      {category && category.content && category.content.length > 0 ? (
        <>
          <IconButton aria-describedby={id} onClick={handleClick} disabled={!isChecked}>
            <ArrowDropDown fontSize="small" />
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <Paper key={'category-paper-' + label} elevation={3}>
              <MenuList autoFocusItem={open} id="menu-list-grow">
                {category.content.map((elem, i) => {
                  if (elem.name === 'hazard_status' || elem.name === 'hazard_content') {
                    return null
                  } else {
                    return (
                      <MenuItem key={label + '-' + (i + 6) * 10}>
                        <FormControl fullWidth>
                          <InputLabel id="demo-mutiple-checkbox-label">
                            {t('labels:' + elem.name.toLowerCase())}
                          </InputLabel>
                          <Select
                            labelId={'demo-mutiple-checkbox-label_' + i}
                            id={'demo-mutiple-checkbox_' + i}
                            multiple={elem.type === 'multipleselect'}
                            value={elem.selected}
                            renderValue={
                              elem.type === 'multipleselect'
                                ? (v) => renderValues(v, 'labels:')
                                : (v) => t('labels:' + (v as String).toLowerCase())
                            }
                            onChange={(event) => {
                              event.stopPropagation()
                              const newCategoryFilter = categoryFilters
                              const checkedOptions = event.target.value
                              newCategoryFilter.content[i].selected = checkedOptions
                              setCategoryFilters({ ...newCategoryFilter })
                            }}
                            input={<Input />}
                          >
                            {elem.options.map((value, key) => (
                              <MenuItem key={'category-select-' + key} value={value}>
                                {elem.type === 'multipleselect' ? (
                                  <>
                                    <Checkbox checked={elem.selected.indexOf(value) > -1} />
                                    <ListItemText primary={t('labels:' + value.toLowerCase())} />
                                  </>
                                ) : (
                                  t('labels:' + value.toLowerCase())
                                )}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </MenuItem>
                    )
                  }
                })}
                <MenuItem>
                  <Button
                    className={classes.applyButton}
                    style={{ textTransform: 'capitalize' }}
                    onClick={applyCategoryFilters}
                    size="small"
                    color="primary"
                    variant="contained"
                  >
                    {t('social:filter_apply')}
                  </Button>
                  <Button
                    className={classes.resetButton}
                    style={{ textTransform: 'capitalize' }}
                    onClick={resetCategoryFilters}
                    size="small"
                    variant="contained"
                  >
                    {t('social:filter_reset')}
                  </Button>
                </MenuItem>
              </MenuList>
            </Paper>
          </Popover>
        </>
      ) : undefined}
    </Paper>
  )
}
