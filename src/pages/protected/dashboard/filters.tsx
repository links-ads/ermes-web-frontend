import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  Grid,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Select,
  Typography
} from '@material-ui/core'
import { DatePicker, LocaleProvider } from 'antd'
import { Locale } from 'antd/es/locale-provider'
import it_IT from 'antd/es/locale/it_IT'
import en_GB from 'antd/es/locale/en_GB'

import { useTranslation } from 'react-i18next'

import { FiltersType } from '../../../common/filters/reducer'

import { getFiltersStyle, _MS_PER_DAY } from '../../../utils/utils.common'

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import moment from 'moment'
import 'moment/locale/it'
import 'moment/locale/en-gb'
import './filters.css'
import { ArrowDropDown } from '@material-ui/icons'
import { EmergencyColorMap } from '../map/api-data/emergency.component'
import {
  CommunicationRestrictionType,
  CommunicationScopeType,
  EntityType,
  MapRequestStatusType,
  TeamsApiFactory
} from 'ermes-ts-sdk'
import { useUser } from '../../../state/auth/auth.hooks'
import { ROLE_CITIZEN } from '../../../App.const'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import useAPIHandler from '../../../hooks/use-api-handler'
import {
  Accordion,
  FiltersDescriptorType
} from '../../../common/floating-filters-tab/floating-filter.interface'
import { MapDrawerTabVisibility } from '../../../hooks/use-filters-object.hook'

const MAP_REQUEST_STATUS_DEFAULT = [
  MapRequestStatusType.REQUEST_SUBMITTED,
  MapRequestStatusType.PROCESSING,
  MapRequestStatusType.CONTENT_AVAILABLE,
  MapRequestStatusType.CONTENT_NOT_AVAILABLE
]
const HAZARD_VISIBILITY_DEFAULT = 'Private'

export const DashboardFilters: React.FC<{
  filters: FiltersType
  localStorageFilters: FiltersDescriptorType | undefined
  mapDrawerTabVisibility: MapDrawerTabVisibility
  lastUpdate: string
  onDateFilterApply: (filters) => void
  onFilterApply: (filtersObj) => void
  onFilterChecked: (tabName, tabVisibility, clickCounter) => void
  onTeamListUpdate: (teamList) => void
  onFilterReset: () => void
}> = (props) => {
  const { profile } = useUser()
  const { t, i18n } = useTranslation(['social', 'filters', 'labels'])
  const {
    filters,
    localStorageFilters,
    mapDrawerTabVisibility,
    lastUpdate,
    onDateFilterApply,
    onFilterApply,
    onFilterChecked,
    onTeamListUpdate,
    onFilterReset
  } = props
  const { datestart, dateend } = filters
  const [startDate, setStartDate] = useState<Date>(datestart)
  const [endDate, setEndDate] = useState<Date>(dateend)
  const useStyles = makeStyles((theme: Theme) => createStyles(getFiltersStyle(theme)))
  const [hasReset, setHasReset] = useState(false)
  const { language } = i18n
  const [locale, setLocale] = useState<Locale>(language === it_IT.locale ? it_IT : en_GB)
  const { filters: allFilters } = localStorageFilters!!
  const { Person, Report, Mission, Communication, MapRequest, Alert, Station } =
    mapDrawerTabVisibility
  const [personChecked, setPersonChecked] = useState<boolean>(Person)
  const [reportChecked, setReportChecked] = useState<boolean>(Report)
  const [missionChecked, setMissionChecked] = useState<boolean>(Mission)
  const [communicationChecked, setCommunicationChecked] = useState<boolean>(Communication)
  const [mapRequestChecked, setMapRequestChecked] = useState<boolean>(MapRequest)
  const [alertChecked, setAlertChecked] = useState<boolean>(Alert)
  const [cameraChecked, setCameraChecked] = useState<boolean>(Station)
  const [dateErrorStatus, setDateErrorStatus] = useState<boolean>(false)
  const [dateErrorMessage, setDateErrorMessage] = useState<string>('')
  const [lastUpdateState, setLastUpdateState] = useState<string>(lastUpdate)
  const [btnClickCounter, setBtnClickCounter] = useState<number>(0)
  const { RangePicker } = DatePicker

  const classes = useStyles()

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const teamsApiFactory = useMemo(() => TeamsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [teamsApiHandlerState, handleTeamsAPICall] = useAPIHandler(false)

  useEffect(() => {
    handleTeamsAPICall(() => {
      return teamsApiFactory.teamsGetTeams(1000)
    })
  }, [teamsApiFactory, handleTeamsAPICall])

  useEffect(() => {
    if (
      !teamsApiHandlerState.loading &&
      !!teamsApiHandlerState.result &&
      teamsApiHandlerState.result.data
    ) {
      //update starting filter object with actual team names from http
      const teamNamesList = teamsApiHandlerState.result.data.data.map((t) => t.name)
      onTeamListUpdate(teamNamesList)
    }
  }, [teamsApiHandlerState])

  useEffect(() => {
    setPersonChecked(Person)
    setReportChecked(Report)
    setMissionChecked(Mission)
    setCommunicationChecked(Communication)
    setMapRequestChecked(MapRequest)
    setAlertChecked(Alert)
    setCameraChecked(Station)
  }, [Person, Report, Mission, Communication, MapRequest, Alert, Station])

  useEffect(() => {
    setLastUpdateState(lastUpdate)
  }, [lastUpdate])

  const applyPersonFilters = (personFilters) => {
    const newFilters = allFilters!!
    const newPersonFilters = newFilters.persons as Accordion
    const contentLength = newPersonFilters.content.length
    for (let i = 0; i < contentLength; i++) {
      newPersonFilters.content[i].selected = personFilters.content[i].selected
    }
    newFilters.persons = newPersonFilters
    onFilterApply({
      ...localStorageFilters,
      filters: newFilters
    })
  }

  const applyReportFilters = (reportFilters) => {
    const newFilters = allFilters!!
    const newReportFilters = newFilters.report as Accordion
    const contentLength = newReportFilters.content.length
    for (let i = 0; i < contentLength; i++) {
      newReportFilters.content[i].selected = reportFilters.content[i].selected
    }
    newFilters.report = newReportFilters
    onFilterApply({
      ...localStorageFilters,
      filters: newFilters
    })
  }

  const applyMissionFilters = (missionFilters) => {
    const newFilters = allFilters!!
    const newMissionFilters = newFilters.mission as Accordion
    const contentLength = newMissionFilters.content.length
    for (let i = 0; i < contentLength; i++) {
      newMissionFilters.content[i].selected = missionFilters.content[i].selected
    }
    newFilters.mission = newMissionFilters
    onFilterApply({
      ...localStorageFilters,
      filters: newFilters
    })
  }

  const applyCommunicationFilters = (communicationFilters) => {
    const newFilters = allFilters!!
    const newCommunicationFilters = newFilters.communication as Accordion
    const contentLength = newCommunicationFilters.content.length
    for (let i = 0; i < contentLength; i++) {
      newCommunicationFilters.content[i].selected = communicationFilters.content[i].selected
    }
    if (profile?.role === ROLE_CITIZEN) {
      if (
        !newCommunicationFilters.content[0].selected!!.includes(CommunicationScopeType.RESTRICTED)
      ) {
        const citizenRestrictionIdx = (
          newCommunicationFilters.content[1].selected!! as string[]
        ).findIndex((e) => e === CommunicationRestrictionType.CITIZEN)
        if (citizenRestrictionIdx >= 0) {
          ;(newCommunicationFilters.content[1].selected!! as string[]).splice(
            citizenRestrictionIdx,
            1
          )
        }
      }
    }
    newFilters.communication = newCommunicationFilters
    onFilterApply({
      ...localStorageFilters,
      filters: newFilters
    })
  }

  const applyMapRequestFilters = (mapRequestFilters) => {
    const newFilters = allFilters!!
    const newMapRequestFilters = newFilters.mapRequests as Accordion
    const contentLength = newMapRequestFilters.content.length
    for (let i = 0; i < contentLength; i++) {
      newMapRequestFilters.content[i].selected = mapRequestFilters.content[i].selected
    }
    newFilters.mapRequests = newMapRequestFilters
    onFilterApply({
      ...localStorageFilters,
      filters: newFilters
    })
  }

  const applyAlertFilters = (alertFilters) => {
    const newFilters = allFilters!!
    const newAlertFilters = newFilters.alert as Accordion
    const contentLength = newAlertFilters.content.length
    for (let i = 0; i < contentLength; i++) {
      newAlertFilters.content[i].selected = alertFilters.content[i].selected
    }
    newFilters.alert = newAlertFilters
    onFilterApply({
      ...localStorageFilters,
      filters: newFilters
    })
  }

  const applyFilters = () => {
    onDateFilterApply({
      datestart: startDate,
      dateend: endDate
    })
  }

  const resetFilters = () => {
    onFilterReset()
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

  function disabledRangeTime(current, type) {
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

  const checkDateValidity = useCallback((startDate, endDate) => {
    const momentStartDate = moment(startDate)
    const momentEndDate = moment(endDate)

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

  const updateRangeDate = (dates) => {
    const startDate = dates[0]
    const endDate = dates[1]
    setStartDate(startDate.toDate())
    setEndDate(endDate.toDate())
    setHasReset(false)
  }

  useEffect(() => {
    checkDateValidity(datestart, dateend)
  }, [datestart, dateend])

  useEffect(() => {
    if (hasReset) {
      setHasReset(false)
      setStartDate(datestart)
      setEndDate(dateend)
      setBtnClickCounter(0)
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
      <Grid container direction={'column'} item xs={9} className={classes.filterSection}>
        <Grid
          container
          direction={'row'}
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
          style={{ flex: 2 }}
        >
          <Grid item>
            <Grid container direction="row">
              <Grid item xs={6}>
                <label>{t('social:starting_date')}</label>
              </Grid>
              <Grid item xs={6}>
                <label>{t('social:end_date')}</label>
              </Grid>
            </Grid>
            <Grid container direction="row">
              <LocaleProvider locale={locale}>
                <RangePicker
                  disabledTime={disabledRangeTime}
                  onChange={updateRangeDate}
                  showTime={{
                    defaultValue: [
                      moment(moment(startDate), 'HH:mm'),
                      moment(moment(endDate), 'HH:mm')
                    ],
                    format: 'HH:mm'
                  }}
                  defaultValue={[moment(startDate), moment(endDate)]}
                  value={[moment(startDate), moment(endDate)]}
                  allowClear
                  format="ddd DD MMMM YYYY - HH:mm"
                  style={{ width: '560px' }}
                  locale={locale}
                />
              </LocaleProvider>
            </Grid>
            <Grid container direction="row">
              <span style={{ display: 'flex', flexDirection: 'column', color: 'red' }}>
                {t(`filters:${dateErrorMessage}`)}
              </span>
            </Grid>
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
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
          style={{ flexGrow: 1, marginTop: 3 }}
        >
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label="persons"
              emergencyLabel={EntityType.PERSON}
              category={allFilters!.persons}
              applyFilters={applyPersonFilters}
              filterCheckedHandler={onFilterChecked}
              isChecked={personChecked}
              clickCounter={btnClickCounter}
              setClickCounter={setBtnClickCounter}
              userProfile={profile}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label="report"
              emergencyLabel={EntityType.REPORT}
              category={allFilters!.report}
              applyFilters={applyReportFilters}
              filterCheckedHandler={onFilterChecked}
              isChecked={reportChecked}
              clickCounter={btnClickCounter}
              setClickCounter={setBtnClickCounter}
              userProfile={profile}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label="mission"
              emergencyLabel={EntityType.MISSION}
              category={allFilters!.mission}
              applyFilters={applyMissionFilters}
              filterCheckedHandler={onFilterChecked}
              isChecked={missionChecked}
              clickCounter={btnClickCounter}
              setClickCounter={setBtnClickCounter}
              userProfile={profile}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label={EntityType.STATION}
              emergencyLabel={EntityType.STATION}
              filterCheckedHandler={onFilterChecked}
              isChecked={cameraChecked}
              clickCounter={btnClickCounter}
              setClickCounter={setBtnClickCounter}
              userProfile={profile}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label={EntityType.ALERT}
              emergencyLabel={EntityType.ALERT}
              category={allFilters!.alert}
              applyFilters={applyAlertFilters}
              filterCheckedHandler={onFilterChecked}
              isChecked={alertChecked}
              clickCounter={btnClickCounter}
              setClickCounter={setBtnClickCounter}
              userProfile={profile}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label={EntityType.COMMUNICATION}
              emergencyLabel={EntityType.COMMUNICATION}
              category={allFilters!.communication}
              applyFilters={applyCommunicationFilters}
              filterCheckedHandler={onFilterChecked}
              isChecked={communicationChecked}
              clickCounter={btnClickCounter}
              setClickCounter={setBtnClickCounter}
              userProfile={profile}
            />
          </Grid>
          <Grid item>
            <CategoryFilter
              t={t}
              classes={classes}
              label={EntityType.MAP_REQUEST}
              emergencyLabel={EntityType.MAP_REQUEST}
              category={allFilters!.mapRequests}
              applyFilters={applyMapRequestFilters}
              isChecked={mapRequestChecked}
              filterCheckedHandler={onFilterChecked}
              clickCounter={btnClickCounter}
              setClickCounter={setBtnClickCounter}
              userProfile={profile}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item style={{ position: 'absolute', right: 24, bottom: 8 }}>
        <Grid container direction={'row'}>
          <Grid item>
            <Typography variant="body2" align="right">
              {t('labels:timestamp')}: {moment(lastUpdateState).format('HH:mm')}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

const CategoryFilter = (props) => {
  const {
    t,
    classes,
    label,
    emergencyLabel,
    category,
    applyFilters,
    isChecked,
    filterCheckedHandler,
    clickCounter,
    setClickCounter,
    userProfile
  } = props
  const [categoryFilters, setCategoryFilters] = useState(category)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const getApplyButtonClass = (label) => {
    if (label === EntityType.COMMUNICATION) return classes.communicationApplyButton
    if (label === EntityType.MAP_REQUEST) return classes.mapRequestApplyButton
    if (label === EntityType.MISSION) return classes.missionApplyButton
    if (label === EntityType.PERSON) return classes.personApplyButton
    if (label === EntityType.REPORT) return classes.reportApplyButton
    if (label === EntityType.ALERT) return classes.alertApplyButton
    if (label === EntityType.STATION) return classes.cameraApplyButton
    return classes.applyButton
  }

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

  const handleCheckBoxChange = () => {
    // by default, the first click on the feature button will filter by the clicked feature and will deactivate the other buttons,
    // after the first click, it will behave as a toggle button
    if (clickCounter > 0) {
      filterCheckedHandler(emergencyLabel, !isChecked, clickCounter + 1)
    } else {
      filterCheckedHandler(emergencyLabel, true, clickCounter + 1)
      setClickCounter((i) => i + 1)
    }
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

  const disabledSelect =
    category &&
    category.content &&
    category.content.length > 1 &&
    category.content[0].name === 'scope' &&
    category.content[1].name === 'restriction' &&
    category.content[1].type === 'conditional_multipleselect' &&
    !category.content[0].selected.includes(CommunicationScopeType.RESTRICTED)

  return (
    <>
      <Paper elevation={3}>
        <ButtonGroup variant="contained" color="primary" aria-label="split button">
          <Button
            onClick={handleCheckBoxChange}
            className={!isChecked ? 'Mui-disabled' : ''}
            style={{ textTransform: 'capitalize', pointerEvents: 'all', cursor: 'pointer' }}
          >
            <Typography
              variant="body2"
              style={{
                color: clickCounter && isChecked ? EmergencyColorMap[emergencyLabel] : 'inherit'
              }}
            >
              {t('labels:filter_' + label.toLowerCase())}
            </Typography>
          </Button>
          {category &&
          category.content &&
          category.content.length > 0 &&
          !(category.title === 'alert' && userProfile?.role === ROLE_CITIZEN) ? (
            <Button aria-describedby={id} size="small" disabled={!isChecked} onClick={handleClick}>
              <ArrowDropDown htmlColor={EmergencyColorMap[emergencyLabel]} />
            </Button>
          ) : null}
        </ButtonGroup>
        {category &&
        category.content &&
        category.content.length > 0 &&
        !(category.title === 'alert' && userProfile?.role === ROLE_CITIZEN) ? (
          <>
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
                    if (
                      elem.name === 'hazard_content' ||
                      (elem.name === 'restriction' && userProfile?.role === ROLE_CITIZEN)
                    ) {
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
                              multiple={
                                elem.type === 'multipleselect' ||
                                elem.type === 'conditional_multipleselect'
                              }
                              value={elem.selected}
                              renderValue={
                                elem.type === 'multipleselect' ||
                                elem.type === 'conditional_multipleselect'
                                  ? (v) => renderValues(v, 'labels:')
                                  : (v) => t('labels:' + (v as String).toLowerCase())
                              }
                              disabled={elem.name === 'restriction' && disabledSelect}
                              onChange={(event) => {
                                event.stopPropagation()
                                const newCategoryFilter = categoryFilters
                                const checkedOptions = event.target.value
                                newCategoryFilter.content[i].selected = checkedOptions

                                var scope = newCategoryFilter.content.filter(
                                  (a) => a.name === 'scope'
                                )[0]
                                if (
                                  scope &&
                                  scope.selected.findIndex(
                                    (a) => a == CommunicationScopeType.RESTRICTED
                                  ) < 0
                                ) {
                                  newCategoryFilter.content.filter(
                                    (a) => a.name === 'restriction'
                                  )[0].selected = []
                                }
                                setCategoryFilters({ ...newCategoryFilter })
                              }}
                              input={<Input />}
                            >
                              {elem.options.map((value, key) => (
                                <MenuItem key={'category-select-' + key} value={value}>
                                  {elem.type === 'multipleselect' ||
                                  elem.type === 'conditional_multipleselect' ? (
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
                  <MenuItem style={{ justifyContent: 'end' }}>
                    <Button
                      className={classes.resetButton}
                      style={{ textTransform: 'capitalize' }}
                      onClick={resetCategoryFilters}
                      size="small"
                      variant="contained"
                    >
                      {t('social:filter_reset')}
                    </Button>
                    <Button
                      className={getApplyButtonClass(emergencyLabel)}
                      style={{ textTransform: 'capitalize' }}
                      onClick={applyCategoryFilters}
                      size="small"
                      color="primary"
                      variant="contained"
                    >
                      {t('social:filter_apply')}
                    </Button>
                  </MenuItem>
                </MenuList>
              </Paper>
            </Popover>
          </>
        ) : undefined}
      </Paper>
    </>
  )
}
