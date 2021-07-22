import React, { useState, useEffect } from 'react'
import { MapContainer } from './common.components'
import { MapLayout } from './map-layout.component'
import { CulturalProps } from './provisional-data/cultural.component'
import { MapStateContextProvider } from './map.contest'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers'
import Grid from '@material-ui/core/Grid'
import DateFnsUtils from '@date-io/date-fns'
import { useTranslation } from 'react-i18next'
import Container from '@material-ui/core/Container'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import CircularProgress from '@material-ui/core/CircularProgress'
import FloatingFilterTab from './floatingfiltertab.component'
// import { EmergencyType } from './map/api-data/emergency.component'
import { GetApiGeoJson } from '../../../hooks/get-apigeojson.hook'
import useActivitiesList from '../../../hooks/use-activities.hook'
import MapDrawer from './map-drawer/map-drawer.component'
import ViewCompactIcon from '@material-ui/icons/ViewCompact'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import useLanguage from '../../../hooks/use-language.hook'
import { Spiderifier } from '../../../utils/map-spiderifier.utils'

type MapFeature = CulturalProps

export function Map() {
  // Retrieve json data, and the function to make the call to filter by date
  const { prepGeoData, isGeoJsonPrepared, filterByDate } = GetApiGeoJson()
  // translate library
  const { t } = useTranslation(['common'])

  //states which will keep track of the start and end dates
  const [selectedStartDate, setStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setEndDate] = useState<Date | null>(null)

  // set list of wanted type of emergencies (for filter)
  const [filterList, setFilterList] = useState<String[]>([
    'ReportRequest',
    'Communication',
    'Mission',
    'Report'
  ])

  // const [testMem, setTestMem, removeTestMem] = useMemoryState('testtag', 'some object there')

  // useEffect(() => {
  //   console.log('TEST MEM', testMem)
  // }, [testMem])

  const initObjectState = {
    tabs: 1,
    xystart: [60, 60],
    filters: {
      datestart: {
        selected: '2021-10-12',
        type: 'date',
        tab: 1
      },
      dateend: {
        selected: '2021-10-12',
        type: 'date',
        tab: 1
      },
      report: {
        title: 'report',
        type: 'accordion',
        tab: 1,
        content: [
          {
            name: 'hazard_select',
            options: ['option1', 'option2'],
            type: 'multipleselect',
            selected: []
          },
          {
            name: 'status',
            options: ['option1', 'option2', 'option3'],
            type: 'select',
            selected: null
          }
        ]
      },
      mission: {
        title: 'mission',
        type: 'accordion',
        tab: 1,
        content: [
          {
            name: 'status',
            options: ['option1', 'option2', 'option3'],
            type: 'select',
            selected: null
          }
        ]
      },
      persons: {
        title: 'persons',
        type: 'accordion',
        tab: 1,
        content: [
          {
            name: 'status',
            options: ['option1', 'option2', 'option3'],
            type: 'select',
            selected: null
          },
          {
            name: 'activity_select',
            options: ['option1', 'option2'],
            type: 'multipleselect',
            selected: []
          }
        ]
      },
      somethingelse: {
        name: 'hazard_select',
        options: ['option1', 'option2'],
        type: 'multipleselect',
        selected: []
      },
      somethingmore: {
        name: 'status',
        options: ['option1', 'option2', 'option3'],
        type: 'select',
        selected: null
      }
    }
  } as FiltersDescriptorType

  const [filtersObj, setFiltersObj] = useState<FiltersDescriptorType | undefined>(initObjectState)
  const resetFiltersObj = () => {
      // console.log(filtersObj)
    setFiltersObj(initObjectState)
    // setFiltersObj(initObjectState)
  }
  const { data: activitiesList } = useActivitiesList()

  // toggle variable for te type filter tab
  const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState<boolean>(false)

  // Toggle for the side drawer
  const [toggleSideDrawer, setToggleSideDrawer] = useState<boolean>(false)

  const { dateFormat } = useLanguage()
  // Coordinates for the fly to
  const [goToCoord, setGoToCoord] = useState<{ latitude: number; longitude: number } | undefined>(
    undefined
  )

  // data filter logic
  const handleStartDateChange = async (date: Date | null) => {
    setStartDate(date)
  }

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date)
  }
  const searchByDates = async function () {
    await filterByDate(selectedStartDate, selectedEndDate)
  }

  const [map, setMap] = useState(undefined)
  const [mapHoverState, setMapHoverState] = useState({ set: false })
  const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
  const [spiderifierRef, setSpiderifierRef] = useState<Spiderifier | null>(null)
  // if I close the filter tab, all the filters get reselected
  // useEffect(() => {
  //   if (toggleActiveFilterTab === false) {
  //     setFilterList(['ReportRequest', 'Communication', 'Mission', 'Report', 'Person'])
  //   }
  // }, [toggleActiveFilterTab])

  return (
    <>
      <AppBar position="static">
        {/* Top bar to filter by the dates */}
        {/* <Toolbar variant="dense">
          <IconButton
            aria-label="view-drawer"
            color="inherit"
            onClick={() => {
              settoggleSideDrawer(!toggleSideDrawer)
            }}
          >
            {!toggleSideDrawer ? <ViewCompactIcon /> : <ArrowBackIcon />}
          </IconButton>
          <Container maxWidth="sm">
            <Grid container justify="space-around">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                
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
                />
                <KeyboardDateTimePicker
                  style={{ paddingTop: 0, marginTop: 0 }}
                  // disableToolbar
                  variant="inline"
                  format={dateFormat}
                  margin="normal"
                  id="start-date-picker-inline"
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
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Container>
          {isGeoJsonPrepared ? (
            <IconButton
              aria-label="search"
              color="inherit"
              onClick={() => {
                searchByDates()
              }}
            >
              <SearchIcon />
            </IconButton>
          ) : (
            <CircularProgress color="secondary" size={30} />
          )}
        </Toolbar> */}
      </AppBar>
      <MapDrawer
        toggleSideDrawer={toggleSideDrawer}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        setGoToCoord={setGoToCoord}
        map={map}
        setMapHoverState={setMapHoverState}
        spiderLayerIds={spiderLayerIds}
        spiderifierRef={spiderifierRef}
        setToggleDrawerTab={setToggleSideDrawer}
      />
      <MapContainer initialHeight={window.innerHeight - 112}>
        {/* Hidden filter tab */}
        {/* {toggleActiveFilterTab ? ( */}
        <FloatingFilterTab
          toggleActiveFilterTab={toggleActiveFilterTab}
          setFilterList={setFilterList}
          activitiesList={activitiesList}
        ></FloatingFilterTab>
        {/* ) : null} */}

        <MapStateContextProvider<MapFeature>>
          <MapLayout
            toggleActiveFilterTab={toggleActiveFilterTab}
            setToggleActiveFilterTab={setToggleActiveFilterTab}
            toggleDrawerTab={toggleSideDrawer}
            setToggleDrawerTab={setToggleSideDrawer}
            filterList={filterList}
            prepGeoJson={prepGeoData}
            isGeoJsonPrepared={isGeoJsonPrepared}
            setGoToCoord={setGoToCoord}
            goToCoord={goToCoord}
            setMap={setMap}
            mapHoverState={mapHoverState}
            spiderLayerIds={spiderLayerIds}
            setSpiderLayerIds={setSpiderLayerIds}
            setSpiderifierRef={setSpiderifierRef}
          />
        </MapStateContextProvider>
      </MapContainer>
    </>
  )
}
