import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/core/styles'
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
  DateTimePicker
} from '@material-ui/pickers'

import useLanguage from '../../hooks/use-language.hook'
import DateFnsUtils from '@date-io/date-fns'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import {
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  useTheme
} from '@material-ui/core'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { useMemoryState } from '../../hooks/use-memory-state.hook'
import { forceFiltersDateRange } from '../filters/filters'
import { _MS_PER_DAY } from '../../utils/utils.common'
import ClearIcon from '@material-ui/icons/Clear'
import TodayIcon from '@material-ui/icons/Today'

const useStyles = makeStyles((theme) => ({
  tab: {
    margin: '15px',
    marginRight: '0px'
    // height: 'auto',
  },
  datePicker: {
    width: '48%',
    marginRight: '1%',
    marginLeft: '1%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  formControl: {
    // margin: theme.spacing(1),
    width: '100%',
    paddingLeft: 0,
    paddingRight: 10
  },
  block: {
    display: 'inline-block',
    minWidth: '200px',
    verticalAlign: 'start',
    textAlign: 'center',
    marginBottom: '15px',
    maxWidth: '-webkit-fill-available'
  },
  accordionDetails: {
    display: 'block'
  },
  clearButton: {
    padding: 0,
    paddingRight: 5
  }
}))

const dateToISO = (date: Date | null | undefined) => {
  return date?.toISOString().replace(/T/, ' ').replace(/\..+/, '')
}

export function Tab1(props) {
  const classes = useStyles()
  const theme = useTheme()
  const { dateFormat } = useLanguage()
  const { t } = useTranslation(['labels'])
  //  props.filters
  const filters = props.filters
  //states which will keep track of the start and end dates
  const [selectedStartDate, setStartDate] = useState<Date | null>(
    filters.datestart.selected ? new Date(filters.datestart.selected) : null
  )
  const [selectedEndDate, setEndDate] = useState<Date | null>(
    filters.dateend.selected ? new Date(filters.dateend.selected) : null
  )
  const [expanded, setExpanded] = React.useState<string | false>(false)

  const handleAccordionChange =
    (panel: string) => (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false)
    }

  // data filter logic
  const handleStartDateChange = async (date: Date | null, e: null | React.MouseEvent = null) => {
    if (e) {
      e.stopPropagation()
    }
    const newFilter = filters
    newFilter['datestart'].selected = dateToISO(date)
    props.setFilters({ ...newFilter })
    setStartDate(date)
  }

  const handleEndDateChange = async (date: Date | null, e: null | React.MouseEvent = null) => {
    if (e) {
      e.stopPropagation()
    }
    const newFilter = filters
    newFilter['dateend'].selected = dateToISO(date)
    props.setFilters({ ...newFilter })
    setEndDate(date)
  }

  // const handleStartClear = (e) => {
  //   e.stopPropagation()
  //   const newFilter = filters
  //   newFilter['datestart'].selected = null
  //   props.setFilters({ ...newFilter })
  //   setStartDate(null)
  // }
  // const handleEndClear = (e) => {
  //   e.stopPropagation()
  //   const newFilter = filters
  //   newFilter['datestart'].selected = null
  //   props.setFilters({ ...newFilter })
  //   setEndDate(null)
  // }
  useEffect(() => {
    if (props.filters['dateend'].range) {
      forceFiltersDateRange(
        selectedStartDate?.getTime(),
        selectedEndDate?.getTime(),
        props.filters['dateend'].range * _MS_PER_DAY,
        (newDate) => setEndDate(new Date(newDate))
      )
    }
  }, [props.filters, selectedStartDate, selectedEndDate])

  useEffect(() => {
    setEndDate(filters.dateend.selected ? new Date(filters.dateend.selected) : null)
  }, [filters.dateend.selected])

  useEffect(() => {
    setStartDate(filters.datestart.selected ? new Date(filters.datestart.selected) : null)
  }, [filters.datestart.selected])

  return (
    <div className={classes.tab}>
      <div>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <span>
            {/* Date pickers */}
            {filters.datestart ? (
              <DateTimePicker
                style={{ paddingTop: 0, marginTop: 0 }}
                // disableToolbar

                variant="inline"
                format={dateFormat}
                margin="normal"
                id="end-date-picker-inline"
                label={t('common:date_picker_test_start')}
                value={selectedStartDate}
                onChange={handleStartDateChange}
                // maxDate={selectedEndDate}
                disableFuture={false}
                autoOk={true}
                ampm={false}
                // KeyboardButtonProps={{
                //   'aria-label': 'change date'
                // }}
                className={classes.datePicker}
                // InputAdornmentProps={{}}
                clearable={true}
                InputProps={{
                  endAdornment:
                    filters.datestart.clear && selectedStartDate != null ? (
                      <IconButton
                        onClick={(e) => handleStartDateChange(null, e)}
                        className={classes.clearButton}
                      >
                        <ClearIcon />
                      </IconButton>
                    ) : (
                      <IconButton className={classes.clearButton}>
                        <TodayIcon />
                      </IconButton>
                    )
                }}
              />
            ) : null}
            {filters.dateend ? (
              <DateTimePicker
                style={{ paddingTop: 0, marginTop: 0 }}
                // disableToolbar
                variant="inline"
                format={dateFormat}
                margin="normal"
                id="end-date-picker-inline"
                label={t('common:date_picker_test_end')}
                value={selectedEndDate}
                onChange={handleEndDateChange}
                disableFuture={false}
                autoOk={true}
                ampm={false}
                minDate={selectedStartDate}
                maxDate={
                  filters['dateend'].range
                    ? new Date(
                        new Date(selectedStartDate!).valueOf() +
                          _MS_PER_DAY * filters['dateend'].range
                      )
                    : undefined
                }
                InputProps={{
                  endAdornment:
                    filters.dateend.clear && selectedEndDate != null ? (
                      <IconButton
                        onClick={(e) => handleEndDateChange(null, e)}
                        className={classes.clearButton}
                      >
                        <ClearIcon />
                      </IconButton>
                    ) : (
                      <IconButton className={classes.clearButton}>
                        <TodayIcon />
                      </IconButton>
                    )
                }}
                className={classes.datePicker}
              />
            ) : null}
          </span>
        </MuiPickersUtilsProvider>
      </div>
      <br />
      {Object.keys(filters).map((widget, i) => {
        switch (filters[widget].type) {
          case 'accordion':
            return (
              <Accordion
                color="primary"
                style={{
                  backgroundColor: theme.palette.primary.dark
                }}
                expanded={expanded === 'panel' + i}
                onChange={handleAccordionChange('panel' + i)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={filters[widget].title + '-content'}
                  id={filters[widget].title + '-header'}
                >
                  <Typography className={classes.heading}>
                    {t('labels:' + filters[widget].title)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionDetails}>
                  {filters[widget].content.map((elem, i) => {
                    switch (elem.type) {
                      case 'select':
                        return (
                          <div className={classes.block}>
                            <FormControl className={classes.formControl}>
                              <InputLabel id="demo-simple-select-label">{elem.name}</InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={t('labels:' + elem.selected.toLowerCase()) || ''}
                                onChange={(event) => {
                                  const newFilter = filters
                                  newFilter[widget].content[i].selected = event.target
                                    .value as string
                                  props.setFilters({ ...newFilter })
                                }}
                              >
                                {elem.options.map((e) => {
                                  return <MenuItem value={e}>{e}</MenuItem>
                                })}
                              </Select>
                            </FormControl>
                          </div>
                        )
                      case 'multipleselect':
                        return (
                          <div className={classes.block}>
                            <FormControl className={classes.formControl}>
                              <InputLabel id="demo-mutiple-checkbox-label">
                                {t('labels:' + elem.name.toLowerCase())}
                              </InputLabel>
                              <Select
                                labelId="demo-mutiple-checkbox-label"
                                id="demo-mutiple-checkbox"
                                multiple
                                value={elem.selected || ''}
                                onChange={(event) => {
                                  const newFilter = filters
                                  if (
                                    newFilter[widget].content[i].selected.includes(
                                      event.target.value
                                    )
                                  ) {
                                    newFilter[widget].content[i].selected = newFilter[
                                      widget
                                    ].content[i].selected.filter((e) => e !== event.target.value)
                                  } else {
                                    newFilter[widget].content[i].selected.push(event.target.value)
                                  }
                                  newFilter[widget].content[i].selected = event.target
                                    .value as string
                                  props.setFilters({ ...newFilter })
                                }}
                                input={<Input />}
                                renderValue={(selected) => {
                                  return elem.selected.join(', ')
                                }}
                              >
                                {elem.options.map((value, key) => (
                                  <MenuItem key={'report-select-' + key} value={value}>
                                    <Checkbox checked={elem.selected.indexOf(value) > -1} />
                                    <ListItemText primary={t('labels:' + value.toLowerCase())} />
                                    {/* {t('maps:' + HazardType[key].toLowerCase())} */}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        )
                    }
                  })}
                  {/* <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada
                  lacus ex, sit amet blandit leo lobortis eget.
                </Typography> */}
                </AccordionDetails>
              </Accordion>
            )
          case 'select':
            return (
              <div className={classes.block}>
                <FormControl className={classes.formControl}>
                  <InputLabel id="demo-simple-select-label">{filters[widget].name}</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={t('labels:' + filters[widget].selected).toLowerCase() || ''}
                    onChange={(event) => {
                      const newFilter = filters
                      newFilter[widget].selected = event.target.value as string
                      props.setFilters({ ...newFilter })
                    }}
                  >
                    {filters[widget].options.map((e) => {
                      return <MenuItem value={e}>{t('labels:' + e.toLowerCase())}</MenuItem>
                    })}
                  </Select>
                </FormControl>
                <br />
              </div>
            )
          case 'multipleselect':
            return (
              <FormControl className={classes.formControl}>
                <InputLabel id="demo-mutiple-checkbox-label">
                  {t('maps:filter_by_hazard')}
                </InputLabel>
                <Select
                  labelId="demo-mutiple-checkbox-label"
                  id="demo-mutiple-checkbox"
                  multiple
                  value={filters[widget].selected || ''}
                  onChange={(event) => {
                    const newFilter = filters
                    if (newFilter[widget].selected.includes(event.target.value)) {
                      newFilter[widget].selected = newFilter[widget].selected.filter(
                        (e) => e !== event.target.value
                      )
                    } else {
                      newFilter[widget].selected.push(event.target.value)
                    }
                    newFilter[widget].selected = event.target.value as string
                    props.setFilters({ ...newFilter })
                  }}
                  input={<Input />}
                  renderValue={(selected) => {
                    return filters[widget].selected.join(', ')
                  }}
                >
                  {filters[widget].options.map((value, key) => (
                    <MenuItem key={'report-select-' + key} value={value}>
                      <Checkbox checked={filters[widget].selected.indexOf(value) > -1} />
                      <ListItemText primary={t('labels:' + value.toLowerCase())} />
                      {/* {t('maps:' + HazardType[key].toLowerCase())} */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
        }
      })}
    </div>
  )
}

export function Tab2(props) {
  // const classes = useStyles()
  const filters = props.filters
  const { t } = useTranslation(['labels'])


  const handleSelectAll = () => {
    for (let elem of Object.keys(filters?.multicheckCategories.options)) {
      if (!filters?.multicheckCategories.options[elem]) {
        return false
      }
    }

    for (let elem of Object.keys(filters?.multicheckPersons.options)) {
      if (!filters?.multicheckPersons.options[elem]) {
        return false
      }
    }

    for (let elem of Object.keys(filters?.multicheckActivities?.options || {})) {
      if (!filters?.multicheckActivities.options[elem]) {
        return false
      }
    }
    return true
  }

  const [selectAll, setSelectAll] = useState<boolean>(handleSelectAll())
  
  const handleClickSelectAll = () => {
    const newFilters = filters
    if (!selectAll) {
      for (let elem of Object.keys(newFilters?.multicheckCategories.options)) {
        newFilters!.multicheckCategories!.options[elem] = true
      }

      for (let elem of Object.keys(newFilters?.multicheckPersons.options)) {
        newFilters!.multicheckPersons!.options[elem] = true
      }
      for (let elem of Object.keys(newFilters?.multicheckActivities?.options || {})) {
        newFilters!.multicheckActivities!.options[elem] = true
      }
    } else {
      for (let elem of Object.keys(newFilters?.multicheckCategories.options)) {
        newFilters!.multicheckCategories!.options[elem] = false
      }

      for (let elem of Object.keys(newFilters?.multicheckPersons.options)) {
        newFilters!.multicheckPersons!.options[elem] = false
      }
      for (let elem of Object.keys(newFilters?.multicheckActivities?.options || {})) {
        newFilters!.multicheckActivities!.options[elem] = false
      }
    }
    props.setFilters({ ...newFilters })
    setSelectAll(!selectAll)
  }

  // useEffect(()=>{
  //   handleSelectAll()
  // }, [filters?.multicheckActivities])

  return (
    <>
      <List style={{ paddingRight: 7 }}>
        <ListItem
          disableRipple
          key={'checkbox-list-label-all'}
          role={undefined}
          dense
          button
          onClick={(e) => handleClickSelectAll()}
        >
          <Typography id="checkbox-list-label-all" color="textSecondary">
            {t('labels:all')}
          </Typography>
          <ListItemSecondaryAction>
            <Checkbox
              edge="start"
              checked={selectAll}
              onChange={() => handleClickSelectAll()}
              color="default"
              inputProps={{ 'aria-labelledby': 'all' }}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
      <Divider />
      <div>
        <List>
          {Object.keys(filters?.multicheckCategories?.options).map((key) => {
            const labelId = `checkbox-list-label-${key}`
            return (
              <ListItem
                key={key}
                role={undefined}
                dense
                button
                onClick={() => {
                  const newFilter = filters
                  newFilter!.multicheckCategories.options[key] =
                    !filters?.multicheckCategories.options[key]
                  props.setFilters({ ...newFilter })
                  setSelectAll(handleSelectAll)
                }}
              >
                <ListItemText id={labelId} primary={`${t('labels:' + key)}`} />
                <ListItemSecondaryAction>
                  <Checkbox
                    edge="start"
                    checked={filters!.multicheckCategories.options[key]}
                    tabIndex={-1}
                    onChange={() => {
                      const newFilter = filters
                      newFilter!.multicheckCategories.options[key] =
                        !filters?.multicheckCategories.options[key]
                      props.setFilters({ ...newFilter })
                      setSelectAll(handleSelectAll)
                    }}
                    color="default"
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            )
          })}

          <ListItem key={'people'} role={undefined} dense button>
            <ListItemText id={'checkbox-list-label-people'} primary={t('labels:Person')} />
          </ListItem>
          <List component="div" disablePadding style={{ marginLeft: 20 }}>
            <br />
            {Object.keys(filters?.multicheckPersons?.options).map((key) => {
              const labelId = `checkbox-list-label-${key}`

              return (
                <ListItem
                  key={key}
                  role={undefined}
                  dense
                  button
                  onClick={() => {
                    const newFilter = filters
                    newFilter!.multicheckPersons.options[key] =
                      !filters?.multicheckPersons.options[key]
                    if (key === 'Active') {
                      if (newFilter!.multicheckPersons.options[key]) {
                        for (let elem of Object.keys(newFilter?.multicheckActivities?.options || {})) {
                          newFilter!.multicheckActivities!.options[elem] = true
                        }
                      } else {
                        for (let elem of Object.keys(newFilter?.multicheckActivities?.options || {})) {
                          newFilter!.multicheckActivities!.options[elem] = false
                        }
                      }
                    }
                    props.setFilters({ ...newFilter })
                    setSelectAll(handleSelectAll)
                  }}
                >
                  <ListItemText id={labelId} primary={`${t('labels:' + key)}`} />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="start"
                      checked={filters?.multicheckPersons.options[key]}
                      tabIndex={-1}
                      onChange={() => {
                        const newFilter = filters
                        newFilter!.multicheckPersons.options[key] =
                          !filters?.multicheckPersons.options[key]
                        if (key === 'Active') {
                          if (newFilter!.multicheckPersons.options[key]) {
                            for (let elem of Object.keys(newFilter?.multicheckActivities?.options || {})) {
                              newFilter!.multicheckActivities!.options[elem] = true
                            }
                          } else {
                            for (let elem of Object.keys(newFilter?.multicheckActivities?.options || {})) {
                              newFilter!.multicheckActivities!.options[elem] = false
                            }
                          }
                        }
                        props.setFilters({ ...newFilter })
                        setSelectAll(handleSelectAll)
                      }}
                      color="default"
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              )
            })}
            <br />
            <Divider />
            <br />

            {filters?.multicheckActivities?.options
              ? Object.keys(filters?.multicheckActivities?.options).map((key) => {
                  const labelId = `checkbox-list-label-${key}`
                  return (
                    <ListItem
                      key={key}
                      role={undefined}
                      dense
                      button
                      onClick={() => {
                        const newFilter = filters
                        newFilter!.multicheckActivities.options[key] =
                          !filters?.multicheckActivities.options[key]

                        let allTrue = true
                        for (let elem of Object.keys(filters?.multicheckActivities.options)) {
                          if (!filters?.multicheckActivities.options[elem]) {
                            allTrue = false
                          }
                        }
                        newFilter!.multicheckPersons.options['Active'] = allTrue

                        props.setFilters({ ...newFilter })
                        setSelectAll(handleSelectAll)
                      }}
                    >
                      <ListItemText id={labelId} primary={`${t('labels:' + key)}`} />
                      <ListItemSecondaryAction>
                        <Checkbox
                          edge="start"
                          checked={filters?.multicheckActivities.options[key]}
                          tabIndex={-1}
                          onChange={() => {
                            const newFilter = filters
                            newFilter!.multicheckActivities.options[key] =
                              !filters?.multicheckActivities.options[key]

                            let allTrue = true
                            for (let elem of Object.keys(filters?.multicheckActivities.options)) {
                              if (!filters?.multicheckActivities.options[elem]) {
                                allTrue = false
                              }
                            }
                            newFilter!.multicheckPersons.options['Active'] = allTrue

                            props.setFilters({ ...newFilter })
                            setSelectAll(handleSelectAll)
                          }}
                          color="default"
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  )
                })
              : null}
          </List>
        </List>
      </div>
    </>
  )
}
