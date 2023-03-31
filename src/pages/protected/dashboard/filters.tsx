import React, { useEffect, useReducer } from 'react'
import { Button, Grid } from '@material-ui/core'
import { IconButton, InputAdornment } from '@material-ui/core'
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'

import EventIcon from '@material-ui/icons/Event'
import { DatePicker } from 'antd'

import { useTranslation } from 'react-i18next'

import filterReducer from '../../../common/filters/reducer'

import { getFiltersStyle, _MS_PER_DAY, forceFiltersDateRange } from '../../../utils/utils.common'

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import useLanguage, { useFiltersLocale } from '../../../hooks/use-language.hook'
import moment from 'moment'

export const DashboardFilters = (props) => {
  const { t, i18n } = useTranslation(['social'])
  const [filters, dispatch] = useReducer(filterReducer, props.filters)
  const useStyles = makeStyles((theme: Theme) => createStyles(getFiltersStyle(theme)))

  const classes = useStyles()

  const applyFilters = () => {
    props.onFilterApply({
      datestart: filters.datestart,
      dateend: filters.dateend
    })
  }

  const locale = useFiltersLocale()

  useEffect(() => {
    forceFiltersDateRange(
      filters.datestart.getTime(),
      filters.dateend.getTime(),
      _MS_PER_DAY * 30,
      (newDate) => dispatch({ type: 'END_DATE', value: new Date(newDate) })
    )
  }, [filters.datestart, filters.dateend])

  return (
    <Grid
      container
      direction={'row'}
      justifyContent="space-around"
      className={classes.filterContainer}
    >
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
          <DatePicker
            id="starting-date"
            onChange={(date) => dispatch({ type: 'START_DATE', value: date?.toDate() })}
            showTime={{ defaultValue: moment(moment(filters.datestart), 'HH:mm') }}
            defaultValue={moment(filters.datestart)}
            allowClear
            format="dddd DD MMMM YYYY - HH:mm"
            style={{ width: '250px' }}
            locale={locale}
          />
          {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker
              disableToolbar={false}
              disableFuture={true}
              variant="inline"
              format={dateFormat}
              
              label={t('social:starting_date')}
              value={filters.datestart}
              autoOk={true}
              ampm={false}
              onChange={(date) => dispatch({ type: 'START_DATE', value: date })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton>
                      {<EventIcon /> }
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </MuiPickersUtilsProvider> */}
        </Grid>
        <Grid item style={{ marginLeft: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column' }}>{t('social:end_date')}</label>
          <DatePicker
            id="end-date"
            onChange={(date) => dispatch({ type: 'END_DATE', value: date?.toDate() })}
            showTime={{ defaultValue: moment(moment(filters.dateend), 'HH:mm') }}
            defaultValue={moment(filters.dateend)}
            allowClear
            format="dddd DD MMMM YYYY - HH:mm"
            style={{ width: '250px' }}
          />
          {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker
              disableToolbar={false}
              disableFuture={true}
              variant="inline"
              format={dateFormat}
              id="end-date"
              label={t('social:end_date')}
              value={filters.dateend}
              minDate={new Date(filters.datestart)}
              maxDate={new Date(new Date(filters.datestart).valueOf() + _MS_PER_DAY * 30)}
              autoOk={true}
              onChange={(date) => dispatch({ type: 'END_DATE', value: date })}
              ampm={false}
              hideTabs={true}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton>
                      <EventIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </MuiPickersUtilsProvider> */}
        </Grid>
      </Grid>
      <Grid
        container
        direction={'row'}
        justifyContent="center"
        alignContent="center"
        style={{ display: 'flex', flex: 1 }}
      >
        <Grid>
          <Button
            className={classes.applyButton}
            onClick={applyFilters}
            size="small"
            color="primary"
            variant="contained"
          >
            {t('social:filter_apply')}
          </Button>
        </Grid>
        <Grid>
          <Button
            className={classes.resetButton}
            onClick={() => dispatch({ type: 'RESET' })}
            size="small"
            variant="contained"
          >
            {t('social:filter_reset')}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}
