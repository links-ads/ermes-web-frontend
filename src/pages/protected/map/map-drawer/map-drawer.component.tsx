import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Slide from '@material-ui/core/Slide'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import ReportPanel from './report-panel.component'
import CommunicationPanel from './communication-panel.component'
import PeoplePanel from './people-panel.component'
import MissionsPanel from './missions-panel.component'
import MapRequestsPanel from './map-requests-panel.component'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 850,
    maxWidth: 450,
    height: '108%',
    backgroundColor: theme.palette.primary.dark,
    position: 'absolute',
    zIndex: 99
  },
  indicator: {
    backgroundColor: '#FFF'
  }
}))

interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: any
  value: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

export default function MapDrawer(props) {
  const classes = useStyles()
  const theme = useTheme()
  const { t } = useTranslation('maps')

  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }

  const handleChangeIndex = (index: number) => {
    setValue(index)
  }
  const onClick = function () {
    props.setToggleDrawerTab(false)
  }
  return (
    <Slide direction="right" in={props.toggleSideDrawer} mountOnEnter unmountOnExit>
      <div className={classes.root}>
        <AppBar
          position="static"
          color="default"
          style={{
            backgroundColor: theme.palette.primary.main,
            boxShadow: 'none'
          }}
        >
          <IconButton
            onClick={onClick}
            aria-label="toggle-selection"
            className="mapboxgl-ctrl-icon"
            style={{ width: '60px', marginLeft: '25px' }}
          // disabled={disabled}
          >
            <ArrowBackIcon />
          </IconButton>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            classes={{ indicator: classes.indicator }}
            color="white"
            variant="scrollable"
            aria-label="full width tabs example"
          >
            <Tab label={t('maps:Report')} {...a11yProps(0)} />
            <Tab label={t('maps:Communication')} {...a11yProps(1)} />
            <Tab label={t('maps:Mission')} {...a11yProps(2)} />
            <Tab label={t('maps:Person')} {...a11yProps(3)} />
            <Tab label={t('maps:MapRequest')} {...a11yProps(4)} />
          </Tabs>
        </AppBar>

        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
          component={'span'}
        >
          {/* REPORTS */}
          <TabPanel value={value} index={0} key={'report-' + props.rerenderKey}>
            <ReportPanel
              setGoToCoord={props.setGoToCoord}
              map={props.map}
              setMapHoverState={props.setMapHoverState}
              spiderLayerIds={props.spiderLayerIds}
              spiderifierRef={props.spiderifierRef}
            />
          </TabPanel>

          {/* COMMUNICATION */}
          <TabPanel value={value} index={1} key={'comm-' + props.rerenderKey}>
            <CommunicationPanel
              setGoToCoord={props.setGoToCoord}
              map={props.map}
              setMapHoverState={props.setMapHoverState}
              spiderLayerIds={props.spiderLayerIds}
              spiderifierRef={props.spiderifierRef}
            />
          </TabPanel>

          <TabPanel value={value} index={2} key={'mission-' + props.rerenderKey}>
            <MissionsPanel
              setGoToCoord={props.setGoToCoord}
              map={props.map}
              setMapHoverState={props.setMapHoverState}
              spiderLayerIds={props.spiderLayerIds}
              spiderifierRef={props.spiderifierRef}
            />
          </TabPanel>

          <TabPanel value={value} index={3} key={'people-' + props.rerenderKey}>
            <PeoplePanel
              setGoToCoord={props.setGoToCoord}
              map={props.map}
              setMapHoverState={props.setMapHoverState}
              spiderLayerIds={props.spiderLayerIds}
              spiderifierRef={props.spiderifierRef}
            />
          </TabPanel>
          <TabPanel value={value} index={4} key={'map-request-' + props.rerenderKey}>
            <MapRequestsPanel
              setGoToCoord={props.setGoToCoord}
              map={props.map}
              setMapHoverState={props.setMapHoverState}
              spiderLayerIds={props.spiderLayerIds}
              spiderifierRef={props.spiderifierRef} />
          </TabPanel>

        </SwipeableViews>
        <AppBar
          position="static"
          color="default"
          style={{
            backgroundColor: theme.palette.primary.main
          }}
        ></AppBar>
      </div>
    </Slide>
  )
}
