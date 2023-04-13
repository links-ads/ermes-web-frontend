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
  Select
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
import { Favorite, FavoriteBorder, ArrowDropDown } from '@material-ui/icons'

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
  }

  const applyReportFilters = (reportFilters) => {
    const newFilters = filtersState
    const contentLength = newFilters.report.content.length
    for (let i = 0; i < contentLength; i++) {
      newFilters.report.content[i].selected = reportFilters.content[i].selected
    }
    setFiltersState({ ...newFilters })
  }

  const applyMissionFilters = (missionFilters) => {
    const newFilters = filtersState
    const contentLength = newFilters.mission.content.length
    for (let i = 0; i < contentLength; i++) {
      newFilters.mission.content[i].selected = missionFilters.content[i].selected
    }
    setFiltersState({ ...newFilters })
  }

  const applyMapRequestFilters = (mapRequestFilters) => {
    const newFilters = filtersState
    const contentLength = newFilters.mapRequest.content.length
    for (let i = 0; i < contentLength; i++) {
      newFilters.mapRequest.content[i].selected = mapRequestFilters.content[i].selected
    }
    setFiltersState({ ...newFilters })
  }

  const applyFilters = () => {
    props.onFilterApply({
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
              category={filtersState.persons}
              applyFilters={applyPersonFilters}
            />
          </Grid>
          <Grid item sm={3} direction="row" container>
            <CategoryFilter
              t={t}
              classes={classes}
              label="report"
              category={filtersState.report}
              applyFilters={applyReportFilters}
            />
          </Grid>
          <Grid item sm={2} direction="row" container>
          <CategoryFilter
              t={t}
              classes={classes}
              label="mission"
              category={filtersState.mission}
              applyFilters={applyMissionFilters}
            />
          </Grid>
          <Grid item sm={2} direction="row" container>
          <CategoryFilter
              t={t}
              classes={classes}
              label="Communication"
            />
          </Grid>
          <Grid item sm={3} direction="row" container>
          <CategoryFilter
              t={t}
              classes={classes}
              label="MapRequest"
              category={filtersState.mapRequests}
              applyFilters={applyMapRequestFilters}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

const CategoryFilter = (props) => {
  const { t, classes, label, category, applyFilters } = props
  const [categoryFilters, setCategoryFilters] = useState(category)

  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

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
  }, [])

  const resetCategoryFilters = useCallback(() => {
    const newCategoryFilters = categoryFilters
    newCategoryFilters.content.forEach((c) => (c.selected = []))
    setCategoryFilters({ ...newCategoryFilters })
    applyFilters(newCategoryFilters)
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
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            name="checkedH"
            size="small"
          />
        }
        label={t('labels:' + label)}
      />
      { (category && category.content && category.content.length > 0) ? 
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
              <Paper key="persons-filter">
                {/* <ClickAwayListener onClickAway={handleClose}> */}
                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                  {category.content.map((elem, i) => (
                    <MenuItem key={i}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-mutiple-checkbox-label">
                          {t('labels:' + elem.name.toLowerCase())}
                        </InputLabel>
                        <Select
                          labelId={'demo-mutiple-checkbox-label_' + i}
                          id={'demo-mutiple-checkbox_' + i}
                          multiple={elem.type === 'multipleselect'}
                          value={elem.selected}
                          renderValue={elem.type === 'multipleselect' ? ((v) => renderValues(v, 'labels:')) : ((v) => t('labels:' + (v as String).toLowerCase()))}
                          onChange={(event) => {
                            const newCategoryFilter = categoryFilters
                            const checkedOptions = event.target.value
                            newCategoryFilter.content[i].selected = checkedOptions
                            setCategoryFilters({ ...newCategoryFilter })
                          }}
                          input={<Input />}
                        >
                          {elem.options.map((value, key) => (
                            <MenuItem key={'report-select-' + key} value={value}>
                              {elem.type === 'multipleselect' ? (
                                <>
                                  <Checkbox checked={elem.selected.indexOf(value) > -1} />
                                  <ListItemText primary={t('labels:' + value.toLowerCase())} />
                                </>
                              ) : 
                              t('labels:' + value.toLowerCase())
                              }
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleClose}>
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
      : undefined }
    </>
  )
}
