import React, { useReducer } from 'react'
import { Button, Grid } from '@material-ui/core'
import { DatePicker } from 'antd'

import { useTranslation } from 'react-i18next'

import filterReducer from '../../../common/filters/reducer'

import { getFiltersStyle, _MS_PER_DAY } from '../../../utils/utils.common'

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { useFiltersLocale } from '../../../hooks/use-language.hook'
import moment from 'moment'
import './filters.css'

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

  const resetFilters = () => {
    dispatch({ type: 'RESET' })
    applyFilters()
  }

  const locale = useFiltersLocale()

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
            value={moment(filters.datestart)}
            allowClear
            format="dddd DD MMMM YYYY - HH:mm"
            style={{ width: '260px' }}
            locale={locale}
          />
        </Grid>
        <Grid item style={{ marginLeft: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column' }}>{t('social:end_date')}</label>
          <DatePicker
            id="end-date"
            onChange={(date) => dispatch({ type: 'END_DATE', value: date?.toDate() })}
            showTime={{ defaultValue: moment(moment(filters.dateend), 'HH:mm') }}
            defaultValue={moment(filters.dateend)}
            value={moment(filters.dateend)}
            allowClear
            format="dddd DD MMMM YYYY - HH:mm"
            style={{ width: '260px' }}
          />
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
