/*  
This component is meant to render dynamically the content 
in src\pages\protected\map\map-filters-init.state.ts
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import useLanguage from '../../hooks/use-language.hook'
// import DateFnsUtils from '@date-io/date-fns' // TODO remove
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Typography from '@mui/material/Typography'
import {
  Checkbox,
  Divider,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  useTheme
} from '@mui/material'

import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { _MS_PER_DAY, forceFiltersDateRange } from '../../utils/utils.common'
import ClearIcon from '@mui/icons-material/Clear'
import TodayIcon from '@mui/icons-material/Today'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => { return {
  tab: {
    margin: '15px',
    marginRight: '0px'
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
}})

// Content part for the first tab in the floating filter
export function Tab1(props) {
  // Import temi and i18n
  const {classes} = useStyles()
  const theme = useTheme()
  const { dateFormat } = useLanguage()
  const { t } = useTranslation(['labels'])

  // Filter state from the parent component
  const filters = props.filters
  //inside states which will keep track of the start and end dates
  const [selectedStartDate, setStartDate] = useState<Date | null>(
    filters.datestart.selected ? new Date(filters.datestart.selected) : null
  )
  const [selectedEndDate, setEndDate] = useState<Date | null>(
    filters.dateend.selected ? new Date(filters.dateend.selected) : null
  )

  // manage the open and close of the accordion. When one is open, the others get all closed (open only one per time)
  const [expanded, setExpanded] = React.useState<string | false>(false)
  const handleAccordionChange =
    (panel: string) => (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false)
    }

  // Date filter logic to handle the date range
  const handleStartDateChange = async (date: Date | null, e: null | React.MouseEvent = null) => {
    if (e) {
      e.stopPropagation()
    }
    const newFilter = filters
    newFilter['datestart'].selected = date
    props.setFilters({ ...newFilter })
    setStartDate(date)
  }

  const handleEndDateChange = useCallback( (date: Date | null, e: null | React.MouseEvent = null,filters:{},setFilters,setEndDate) => {
    if (e) {
      e.stopPropagation()
    }
    const newFilter = filters
    newFilter['dateend'].selected = date
    setFilters({ ...newFilter })
    setEndDate(date)
  },[])

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

  // if it has range, compute dateend
  useEffect(() => {
    if (props.filters['dateend'].range) {
      forceFiltersDateRange(
        selectedStartDate?.getTime(),
        selectedEndDate?.getTime(),
        props.filters['dateend'].range * _MS_PER_DAY,
        (newDate) => handleEndDateChange(new Date(newDate),null,props.filters,
                                          props.setFilters,setEndDate)
      )
    }
  }, [props.filters, selectedStartDate, selectedEndDate, handleEndDateChange, props.setFilters, setEndDate])

  // if exists date end|start set it, otherwhise set null
  useEffect(() => {
    setEndDate(filters.dateend.selected ? new Date(filters.dateend.selected) : null)
  }, [filters.dateend.selected])

  useEffect(() => {
    setStartDate(filters.datestart.selected ? new Date(filters.datestart.selected) : null)
  }, [filters.datestart.selected])

  return (
    <div className={classes.tab}>
      <div>
        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}> */}
          <span>
            {/* Date pickers */}
            {filters.datestart ? (
              <DateTimePicker
                // style={{ paddingTop: 0, marginTop: 0 }} TODO remove
                // disableToolbar
                // variant="inline" TODO remove
                format={dateFormat}
                // margin="normal" TODO remove
                // id="start-date-picker-inline" // TODO remove
                label={t('common:date_picker_test_start')}
                value={selectedStartDate}
                onChange={(date, e) => handleStartDateChange}
                // maxDate={selectedEndDate}
                disableFuture={false}
                // autoOk={true} // TODO remove
                ampm={false}
                className={classes.datePicker}
                // clearable={true} // TODO remove 
                // InputProps={{ // TODO fix
                //   endAdornment:
                //     filters.datestart.clear && selectedStartDate != null ? (
                //       <IconButton
                //         onClick={(e) => handleStartDateChange(null, e)}
                //         className={classes.clearButton}
                //       >
                //         <ClearIcon />
                //       </IconButton>
                //     ) : (
                //       <IconButton className={classes.clearButton}>
                //         <TodayIcon />
                //       </IconButton>
                //     )
                // }}
              />
            ) : null}
            {filters.dateend ? (
              <DateTimePicker
                // style={{ paddingTop: 0, marginTop: 0 }} // TODO remove
                // disableToolbar
                // variant="inline" // TODO remove
                format={dateFormat}
                // margin="normal" // TODO remove
                // id="end-date-picker-inline" // TODO remove
                label={t('common:date_picker_test_end')}
                value={selectedEndDate}
                onChange={(d)=>handleEndDateChange(d,null,props.filters,
                  props.setFilters,setEndDate)}
                disableFuture={false}
                // autoOk={true} // TODO remove
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
                // InputProps={{ // TODO fix
                //   endAdornment:
                //     filters.dateend.clear && selectedEndDate != null ? (
                //       <IconButton
                //         onClick={(e) => handleEndDateChange(null, e,props.filters,
                //           props.setFilters,setEndDate)}
                //         className={classes.clearButton}
                //       >
                //         <ClearIcon />
                //       </IconButton>
                //     ) : (
                //       <IconButton className={classes.clearButton}>
                //         <TodayIcon />
                //       </IconButton>
                //     )
                // }}
                className={classes.datePicker}
              />
            ) : null}
          </span>
        {/* </MuiPickersUtilsProvider> */}
      </div>
      <br />
      {Object.keys(filters).map((widget, i) => {
        switch (filters[widget].type) {
          // if the element required is an accordion, render it with the correct components inside
          case 'accordion':
            return (
              <Accordion
                key={i}
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
                      //render select within accordion
                      case 'select':
                        return (
                          <div key={elem.name} className={classes.block}>
                            <FormControl className={classes.formControl}>
                              <InputLabel id={'demo-simple-select-label_' + i}>
                              {t('labels:' + elem.name)}
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id={"demo-simple-select"+elem.name}
                                value={elem.selected}
                                renderValue={(v) => t('labels:' + (v as String).toLowerCase())}
                                onChange={(event) => {
                                  const newFilter = filters
                                  newFilter[widget].content[i].selected = event.target
                                    .value as string
                                  props.setFilters({ ...newFilter })
                                }}
                                style={{ textAlign: 'start' }}
                              >
                                {elem.options.map(e => {
                                  return (
                                    <MenuItem key={e} value={e}>{t('labels:' + e.toLowerCase())}</MenuItem>
                                  )
                                })}
                              </Select>
                            </FormControl>
                          </div>
                        )
                      case 'multipleselect':
                        //render multipleselect within accordion
                        return (
                          <div key={elem.name} className={classes.block}>
                            <FormControl className={classes.formControl}>
                              <InputLabel id="demo-mutiple-checkbox-label">
                                {t('labels:' + elem.name.toLowerCase())}
                              </InputLabel>
                              <Select
                                labelId={'demo-mutiple-checkbox-label_' + i}
                                id={'demo-mutiple-checkbox_' + i}
                                multiple
                                value={elem.selected || ''}
                                renderValue={(v) => renderValues(v, 'labels:')}
                                onChange={(event) => {
                                  const newFilter = filters
                                  if (
                                    newFilter[widget].content[i].selected.includes(
                                      event.target.value
                                    )
                                  ) {
                                    newFilter[widget].content[i].selected = 
                                    newFilter[widget].content[i].selected.filter((e) => e !== event.target.value)
                                  } else {
                                    newFilter[widget].content[i].selected.push(event.target.value)
                                  }
                                  newFilter[widget].content[i].selected = event.target
                                    .value as string
                                  props.setFilters({ ...newFilter })
                                }}
                                input={<Input />}
                              >
                                {elem.options.map((value, key) => (
                                  <MenuItem key={'report-select-' + key} value={value}>
                                    <Checkbox checked={elem.selected.indexOf(value) > -1} />
                                    <ListItemText primary={t('labels:' + value.toLowerCase())} />
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>
                        )
                      default: return (<div></div>)
                    }
                  })}
                </AccordionDetails>
              </Accordion>
            )
          case 'select':
            //render select outside accordion
            return (
              <div key={i} className={classes.block}>
                <FormControl className={classes.formControl}>
                  <InputLabel id={'demo-simple-select-label_' + i}>
                    {filters[widget].name}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={filters[widget].selected}
                    renderValue={(v) => t('labels:' + v)}
                    onChange={(event) => {
                      const newFilter = filters
                      newFilter[widget].selected = event.target.value as string
                      props.setFilters({ ...newFilter })
                    }}
                    style={{ textAlign: 'start' }}
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
            //render multipleselect outside accordion
            return (
              <FormControl key={i} className={classes.formControl}>
                <InputLabel id={'demo-mutiple-checkbox-label_' + i}>
                  {t('labels:filter_by_' + filters[widget].name.toLowerCase())}
                </InputLabel>
                <Select
                  labelId={'demo-mutiple-checkbox-label_' + i}
                  id={'demo-mutiple-checkbox_' + i}
                  multiple
                  value={filters[widget].selected || ''}
                  renderValue={(v) => renderValues(v, 'labels:')}
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
                >
                  {filters[widget].options.map((value, key) => (
                    <MenuItem key={'report-select-' + key} value={value}>
                      <Checkbox checked={filters[widget].selected.indexOf(value) > -1} />
                      <ListItemText primary={t('labels:' + value.toLowerCase())} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          default: return (<div key={i}></div>)
        }
      })}
    </div>
  )
}

// Content part for the second tab in the floating filter
export function Tab2(props) {

  const filters = props.filters
  const filtersMultiCheckActivities = useMemo(()=>filters?.multicheckActivities, [filters])
  
  const { t } = useTranslation(['labels'])

  // return true if all the filters are selected, otherwise false
  const handleSelectAll = useCallback( () => {
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
  },[filters])

  // create a varaible to track the selected objects
  const [selectAll, setSelectAll] = useState<boolean>(handleSelectAll())

  // if select all, either set everything to true if any false, 
  // or set everything to false if all true
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

  useEffect(() => {
    setSelectAll(handleSelectAll())
  }, [filtersMultiCheckActivities, handleSelectAll])

  return (
    <>
    {/* Checkbox for select all */}
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
        {/* Checks for the categories filtering for everything but people */}
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

          {/* Checks for subfiltering the people */}
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
                        for (let elem of Object.keys(
                          newFilter?.multicheckActivities?.options || {}
                        )) {
                          newFilter!.multicheckActivities!.options[elem] = true
                        }
                      } else {
                        for (let elem of Object.keys(
                          newFilter?.multicheckActivities?.options || {}
                        )) {
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
                            for (let elem of Object.keys(
                              newFilter?.multicheckActivities?.options || {}
                            )) {
                              newFilter!.multicheckActivities!.options[elem] = true
                            }
                          } else {
                            for (let elem of Object.keys(
                              newFilter?.multicheckActivities?.options || {}
                            )) {
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
