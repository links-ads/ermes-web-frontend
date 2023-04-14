import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  ClickAwayListener,
  FormControl,
  FormControlLabel,
  Grid,
  Grow,
  IconButton,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Select as MUISelect,
  SvgIcon,
  Typography
} from '@material-ui/core'
import { DatePicker, LocaleProvider, Select } from 'antd'
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
  const { t, i18n } = useTranslation(['social'])
  const [filters, dispatch] = useReducer(filterReducer, props.filters)
  const useStyles = makeStyles((theme: Theme) => createStyles(getFiltersStyle(theme)))
  const [hasReset, setHasReset] = useState(false)
  const { language } = i18n
  const [locale, setLocale] = useState<Locale>(language === it_IT.locale ? it_IT : en_GB)
  const { localStorageFilters } = props
  const { filters: allFilters } = localStorageFilters
  const [filtersState, setFiltersState] = useState(allFilters)

  const classes = useStyles()

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
  }

  const updateStartDate = (date) => {
    dispatch({ type: 'START_DATE', value: date?.toDate() })
    setHasReset(false)
  }

  const updateEndDate = (date) => {
    dispatch({ type: 'END_DATE', value: date?.toDate() })
    setHasReset(false)
  }

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
                onChange={updateStartDate}
                showTime={{ defaultValue: moment(moment(filters.datestart), 'HH:mm') }}
                defaultValue={moment(filters.datestart)}
                value={moment(filters.datestart)}
                allowClear
                format="ddd DD MMMM YYYY - HH:mm"
                style={{ width: '280px' }}
                locale={locale}
              />
            </LocaleProvider>
          </Grid>
          <Grid item style={{ marginLeft: 8 }}>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              {t('social:end_date')}
            </label>
            <LocaleProvider locale={locale}>
              <DatePicker
                id="end-date"
                onChange={updateEndDate}
                showTime={{ defaultValue: moment(moment(filters.dateend), 'HH:mm') }}
                defaultValue={moment(filters.dateend)}
                value={moment(filters.dateend)}
                allowClear
                format="ddd DD MMMM YYYY - HH:mm"
                style={{ width: '280px' }}
                locale={locale}
              />
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
          style={{ flex: 2 }}
        >
          <Grid item sm={2} direction="row" container>
            <CategoryFilter
              t={t}
              classes={classes}
              label="persons"
              emergencyLabel="Person"
              category={filtersState.persons}
              applyFilters={applyPersonFilters}
            />
          </Grid>
          <Grid item sm={3} direction="row" container>
            <CategoryFilter
              t={t}
              classes={classes}
              label="report"
              emergencyLabel="Report"
              category={filtersState.report}
              applyFilters={applyReportFilters}
            />
          </Grid>
          <Grid item sm={2} direction="row" container>
            <CategoryFilter
              t={t}
              classes={classes}
              label="mission"
              emergencyLabel="Mission"
              category={filtersState.mission}
              applyFilters={applyMissionFilters}
            />
          </Grid>
          <Grid item sm={2} direction="row" container>
            <CategoryFilter
              t={t}
              classes={classes}
              label="Communication"
              emergencyLabel="Communication"
            />
          </Grid>
          <Grid item sm={3} direction="row" container>
            <CategoryFilter
              t={t}
              classes={classes}
              label="MapRequest"
              emergencyLabel="MapRequest"
              category={filtersState.mapRequests}
              applyFilters={applyMapRequestFilters}
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
  const { t, classes, label, category, applyFilters } = props
  const [categoryFilters, setCategoryFilters] = useState(category)

  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const { Option } = Select

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

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event) => {
    if (anchorRef.current && (anchorRef.current as any).contains(event.target)) {
      return
    }

    setOpen(false)
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const applyCategoryFilters = useCallback(() => {
    applyFilters(categoryFilters)
    setOpen(false)
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
    setOpen(false)
  }, [])

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open)
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      ;(anchorRef.current as any).focus()
    }

    prevOpen.current = open
  }, [open])

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            icon={<CategoryPinBorderIcon colorlabel={props.emergencyLabel} />}
            checkedIcon={<CategoryPinIcon colorlabel={props.emergencyLabel} />}
            name="checkedH"
            size="small"
          />
        }
        label={<Typography variant="body2">{t('labels:' + label)}</Typography>}
      />
      {category && category.content && category.content.length > 0 ? (
        <div>
          <IconButton
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <ArrowDropDown fontSize="small" />
          </IconButton>
          <Popper
            key={'category-popper-' + label}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-end"
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
                }}
              >
                <Paper key={'category-paper-' + label} elevation={3}>
                  {/* <ClickAwayListener onClickAway={handleClose}> */}
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    {category.content.map((elem, i) => (
                      <div key={label + '-div-' + i}>
                        <MenuItem key={label + '-' + i}>
                          <FormControl fullWidth>
                            <Select
                              id={'demo-mutiple-checkbox_' + i}
                              allowClear
                              showArrow
                              maxTagTextLength={5}
                              maxTagCount={1}
                              mode={elem.type === 'multipleselect' ? 'multiple' : 'default'}
                              value={elem.selected}
                              placeholder={t('labels:' + elem.name.toLowerCase())}
                              onChange={(value) => {
                                const newCategoryFilter = categoryFilters
                                newCategoryFilter.content[i].selected = value
                                setCategoryFilters({ ...newCategoryFilter })
                              }}
                            >
                              {elem.options.map((value, key) => (
                                <Option key={'category-select-' + key} value={value}>
                                  {t('labels:' + value.toLowerCase())}
                                </Option>
                              ))}
                            </Select>
                          </FormControl>
                        </MenuItem>
                        <MenuItem key={label + '-' + (i + 6) * 10}>
                          <FormControl fullWidth>
                            <InputLabel id="demo-mutiple-checkbox-label">
                              {t('labels:' + elem.name.toLowerCase())}
                            </InputLabel>
                            <MUISelect
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
                            </MUISelect>
                          </FormControl>
                        </MenuItem>
                      </div>
                    ))}
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
                  {/* </ClickAwayListener> */}
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      ) : undefined}
    </>
  )
}
