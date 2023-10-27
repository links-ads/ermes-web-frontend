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

const useStyles = makeStyles((theme) => ({
  label: {
    color: 'rgba(255, 255, 255, 0.7)'
  }
}))

const RangeDateTimePicker: React.FC<{
  editState
  dispatchEditAction
}> = (props) => {
  const { RangePicker } = DatePicker
  const classes = useStyles()
  const { t, i18n } = useTranslation(['social', 'filters'])
  const { language } = i18n
  const [locale, setLocale] = useState<Locale>(language === it_IT.locale ? it_IT : en_GB)
  const [dateErrorStatus, setDateErrorStatus] = useState<boolean>(false)
  const [dateErrorMessage, setDateErrorMessage] = useState<string>('')
  const { editState, dispatchEditAction } = props as any
  const [startDate, setStartDate] = useState<Date>(editState.startDate)
  const [endDate, setEndDate] = useState<Date>(editState.endDate)

  const range = (start, end) => {
    const result: any[] = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }

  const disabledDate = (current) => {
    // Can not select days before today
    return current && current < moment().startOf('day')
  }

  const disabledRangeTime = (current, type) => {
    let notAvailableMinutes: number[] = []
    const start = current[0]
    const end = current[1]
    if (start && start != null && end && end != null) {
      if (start.isSame(end, 'hour')) {
        const minMinute = start.minute()
        notAvailableMinutes = range(0, minMinute + 1)
      }
    }

    if (type === 'start') {
      return {}
    }
    return {
      disabledMinutes: () => notAvailableMinutes
    }
  }

  const updateRangeDate = (dates) => {
    const startDate = dates[0]
    const endDate = dates[1]
    setStartDate(startDate?.toDate() as Date)
    setEndDate(endDate?.toDate() as Date)
    dispatchEditAction({
      type: 'DATES',
      value: { start: startDate?.toDate() as Date, end: endDate?.toDate() as Date }
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

  // set up null end date to a default one
  useEffect(() => {
    if (endDate === null && editState.endDate === null) {
      const defaultEnd = moment().endOf('day').toDate()
      setEndDate(defaultEnd)
      dispatchEditAction({ type: 'END_DATE', value: defaultEnd })
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
          <RangePicker
            getCalendarContainer={(trigger) => trigger.parentNode as HTMLElement}
            disabledDate={disabledDate}
            disabledTime={disabledRangeTime}
            onChange={updateRangeDate}
            showTime={{
              defaultValue: [moment(moment(startDate), 'HH:mm'), moment(moment(endDate), 'HH:mm')],
              format: 'HH:mm'
            }}
            defaultValue={[
              moment(startDate),
              endDate !== null ? moment(endDate) : moment().endOf('day')
            ]}
            value={[moment(startDate), endDate !== null ? moment(endDate) : moment().endOf('day')]}
            allowClear
            format={'ddd DD MMMM YYYY - HH:mm'}
            style={{ width: 560 }}
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

export default RangeDateTimePicker
