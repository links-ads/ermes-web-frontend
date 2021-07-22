import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers'
import { useTranslation } from 'react-i18next'
import useLanguage from '../../hooks/use-language.hook'
import DateFnsUtils from '@date-io/date-fns'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Typography from '@material-ui/core/Typography'
import { Checkbox, FormControlLabel, Input, ListItemText, useTheme } from '@material-ui/core'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { useMemoryState } from '../../hooks/use-memory-state.hook'
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
    maxWidth: '200px'
  },
  block: {
    display: 'block',
    width: '200px',
    verticalAlign: 'start',
    textAlign: 'center'
  },
  accordionDetails: {
    display: 'flex',
    justifyContent: 'space-around'
  }
}))

export function Tab1(props) {
  const classes = useStyles()
  const theme = useTheme()
  const { dateFormat } = useLanguage()
  const { t } = useTranslation(['common'])
  //states which will keep track of the start and end dates
  const [selectedStartDate, setStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setEndDate] = useState<Date | null>(null)

  // data filter logic
  const handleStartDateChange = async (date: Date | null) => {
    setStartDate(date)
  }

  const handleEndDateChange = async (date: Date | null) => {
    setEndDate(date)
  }
  //  props.filters
  let filters = props.filters
  // useEffect(()=>{
  //   const filters = props.filters
  // }, [props.filters])
  return (
    <div className={classes.tab}>
      <div>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <span>
            {/* Date pickers */}
            {filters.datestart ? (
              <KeyboardDateTimePicker
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
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
                className={classes.datePicker}
              />
            ) : null}
            {filters.dateend ? (
              <KeyboardDateTimePicker
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
                // minDate={selectedStartDate}
                KeyboardButtonProps={{
                  'aria-label': 'change date'
                }}
                className={classes.datePicker}
              />
            ) : null}
          </span>
        </MuiPickersUtilsProvider>
      </div>
      <br />
      {Object.keys(filters).map((widget) => {
        switch (filters[widget].type) {
          case 'accordion':
            return (
              <Accordion
                color="primary"
                style={{
                  backgroundColor: theme.palette.primary.dark
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={filters[widget].title + '-content'}
                  id={filters[widget].title + '-header'}
                >
                  <Typography className={classes.heading}>
                    {t('filters:' + filters[widget].title)}
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
                                value={elem.selected || ''}
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
                              value={elem.selected || ''}
                              onChange={(event) => {
                                const newFilter = filters
                                if (
                                  newFilter[widget].content[i].selected.includes(event.target.value)
                                ) {
                                  newFilter[widget].content[i].selected = newFilter[widget].content[
                                    i
                                  ].selected.filter((e) => e !== event.target.value)
                                } else {
                                  newFilter[widget].content[i].selected.push(event.target.value)
                                }
                                newFilter[widget].content[i].selected = event.target.value as string
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
                                  <ListItemText primary={value} />
                                  {/* {t('maps:' + HazardType[key].toLowerCase())} */}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
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
                  <InputLabel id="demo-simple-select-label">
                    {filters[widget].name}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={filters[widget].selected || ''}
                    onChange={(event) => {
                      const newFilter = filters
                      newFilter[widget].selected = event.target.value as string
                      props.setFilters({ ...newFilter })
                    }}
                  >
                    {filters[widget].options.map((e) => {
                      return <MenuItem value={e}>{e}</MenuItem>
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
                      <ListItemText primary={value} />
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
  const classes = useStyles()
  return <div className={classes.tab}>Tab2</div>
}
