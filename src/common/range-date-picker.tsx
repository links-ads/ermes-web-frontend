import React, { useCallback, useEffect, useState } from 'react'
import { Grid, makeStyles } from '@material-ui/core'
import { DatePicker, LocaleProvider } from 'antd'
import { Locale } from 'antd/es/locale-provider'
import it_IT from 'antd/es/locale/it_IT'
import en_GB from 'antd/es/locale/en_GB'
import moment from 'moment'
import 'moment/locale/it'
import 'moment/locale/en-gb'
import '../pages/protected/dashboard/filters.css'
import { useTranslation } from 'react-i18next'
import { _MS_PER_DAY } from '../utils/utils.common'

const useStyles = makeStyles((theme) => ({
  label: {
    color: 'rgba(255, 255, 255, 0.7)'
  }
}))

const RangeDatePicker: React.FC<{
  editState
  dispatchEditAction
  maxDaysRangeDate?
}> = (props) => {
  const classes = useStyles()
  const { t, i18n } = useTranslation(['social', 'filters'])
  const { language } = i18n
  const [locale, setLocale] = useState<Locale>(language === it_IT.locale ? it_IT : en_GB)
  const [dateErrorStatus, setDateErrorStatus] = useState<boolean>(false)
  const [dateErrorMessage, setDateErrorMessage] = useState<string>('')
  const { editState, dispatchEditAction, maxDaysRangeDate } = props as any
  const [startDate, setStartDate] = useState<Date>(editState.startDate)
  const [endDate, setEndDate] = useState<Date>(editState.endDate)

  const disabledStartDate = (startValue) => {
    if (!startValue || !endDate) {
      return false
    }
    return startValue.valueOf() > endDate.valueOf()
  }

  const disabledEndDate = (endValue) => {
    if (!endValue || !startDate) {
      return false
    }

    const maxDaysRangeDateValue = maxDaysRangeDate !== null ? maxDaysRangeDate : 0

    return (
      endValue.valueOf() <= startDate.valueOf() ||
      endValue.valueOf() > startDate.valueOf() + maxDaysRangeDateValue * _MS_PER_DAY
    )
  }

  const onStartChange = (value) => {
    let startD = new Date((value?.toDate() as Date).setHours(0, 0, 0, 0))
    setStartDate(startD)
    dispatchEditAction({
      type: 'START_DATE',
      value: startD
    })
  }

  const onEndChange = (value) => {
    let endD = new Date((value?.toDate() as Date).setHours(23, 59, 59, 0))
    setEndDate(endD)
    dispatchEditAction({
      type: 'END_DATE',
      value: endD
    })
  }

  const checkDateValidity = useCallback((startD, endD) => {
    const momentStartDate = moment(startD)
    const momentEndDate = moment(endD)

    if (momentStartDate.isAfter(momentEndDate, 'minute')) {
      setDateErrorStatus(true)
      setDateErrorMessage('date_filters_after_error')
    } else if (momentStartDate.isSame(momentEndDate, 'minute')) {
      setDateErrorStatus(true)
      setDateErrorMessage('date_filters_same_error')
    } else {
      setDateErrorStatus(false)
      setDateErrorMessage('')
    }
  }, [])

  useEffect(() => {
    checkDateValidity(startDate, endDate)
  }, [startDate, endDate])

  useEffect(() => {
    moment.locale(language)
    setLocale(language === it_IT.locale ? it_IT : en_GB)
  }, [language])

  return (
    <>
      <Grid item>
        <Grid container direction="row">
          <Grid item xs={6}>
            <label className={classes.label}>{t('social:starting_date')}</label>
          </Grid>
          <Grid item xs={6}>
            <label className={classes.label}>{t('social:end_date')}</label>
          </Grid>
        </Grid>
        <LocaleProvider locale={locale}>
          <DatePicker
            getCalendarContainer={(trigger) => trigger.parentNode as HTMLElement}
            disabledDate={disabledStartDate}
            format={'ddd DD MMMM YYYY'}
            placeholder={t('social:starting_date')}
            value={moment(startDate)}
            defaultValue={moment(startDate)}
            onChange={onStartChange}
            allowClear
            style={{ width: 280 }}
            locale={locale}
          />
          <DatePicker
            getCalendarContainer={(trigger) => trigger.parentNode as HTMLElement}
            disabledDate={disabledEndDate}
            format={'ddd DD MMMM YYYY'}
            placeholder={t('social:end_date')}
            value={endDate !== null ? moment(endDate) : null}
            defaultValue={endDate !== null ? moment(endDate) : null}
            onChange={onEndChange}
            allowClear
            style={{ width: 280 }}
            locale={locale}
          />
        </LocaleProvider>
        {dateErrorStatus && (
          <Grid container direction="row">
            <span style={{ display: 'flex', flexDirection: 'column', color: 'red' }}>
              {t(`filters:${dateErrorMessage}`)}
            </span>
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default RangeDatePicker
