import React, { useEffect, useReducer, useState } from 'react'
import { Button, Grid } from '@material-ui/core'
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

export const DashboardFilters = (props) => {
  const { t, i18n } = useTranslation(['social'])
  const [filters, dispatch] = useReducer(filterReducer, props.filters)
  const useStyles = makeStyles((theme: Theme) => createStyles(getFiltersStyle(theme)))
  const [hasReset, setHasReset] = useState(false)
  const { language } = i18n
  const [locale, setLocale] = useState<Locale>(language === it_IT.locale ? it_IT : en_GB)

  const classes = useStyles()

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
          <label style={{ display: 'flex', flexDirection: 'column' }}>{t('social:end_date')}</label>
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
    </Grid>
  )
}
