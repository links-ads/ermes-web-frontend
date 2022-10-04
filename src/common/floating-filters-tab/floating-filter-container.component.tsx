/* This script takes care of the floating widget containing all the filter the
user can decide to select or deselect by clicking the third button on the top left list
in the map page */

import React, { useState, useEffect, useMemo } from 'react'
import CardContent from '@material-ui/core/CardContent'
import {
  Button,
  CardActions,
  CircularProgress,
  IconButton,
  makeStyles,
  useTheme
} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useTranslation } from 'react-i18next'
import { Tab1, Tab2 } from './floating-filter-content.component'
import CloseIcon from '@material-ui/icons/Close'
import FloatingCardContainer from './floating-card-container.component'

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const useStyles = makeStyles((theme) => ({
  cardAction: {
    justifyContent: 'flex-end',
    paddingLeft: 16,
    paddingTop: 4,
    paddingBottom: 8,
    paddingRight: 0
  },
  buttonApply: {
    marginRight: 15,
    backgroundColor: theme.palette.secondary.main
  },
  buttonReset: {
    marginRight: 15
  },
  indicator: {
    backgroundColor: '#FFF'
  },
  titleContainer: {
    width: '100px',
    display: 'inline-block',
    paddingLeft: 32,
    paddingTop: 11,
    paddingBottom: 11,
    marginRight: 32
  },
  tabsContainer: {
    width: 'auto',
    display: 'inline-block',
    contentAlign: 'center'
  },
  circularProgressContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))

export default function FloatingFilterContainer(props) {
  // Translation and theming
  const { t } = useTranslation(['filters', 'labels'])
  const theme = useTheme()
  const classes = useStyles()

  // Tab selector
  const [tab, setTab] = React.useState(0)
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue)
  }
  // handle change by clicking the tab
  const handleChangeIndex = (index: number) => {
    setTab(index)
  }

  // State for dimension of the windows
  const [dim, setDim] = useState({
    width: props.width ? props.width : 500,
    height: props.height ? props.height : 400
  })
  const onResize = (event, data) => {
    setDim({ height: data.size.height, width: data.size.width })
  }

  // Filters object with reset
  const [filters, setFilters] = useState(props.filtersObj ? props.filtersObj.filters : null)

  //if teamList has changed then update the filters with the new teams availables
  useEffect(() => {
    if(Object.keys(props.teamList).length>0){
      var l:string[] = []
      for(let key in props.teamList){
        l.push(props.teamList[key])
      }
      let tmp = filters
    tmp.persons.content[1].options = l
    setFilters(tmp)
  }
  }, [props.teamList])

  const resetFilters = () => {
    setFilters(props.initObj ? JSON.parse(JSON.stringify(props.initObj.filters)) : null)
  }

  // when filters change, update the filters object
  useEffect(() => {
    setFilters(props.filtersObj.filters)
  }, [props.filtersObj])

  // Toggle for on/off the tab
  useEffect(() => {
    if (props.toggleActiveFilterTab) {
      setFilters(props.filtersObj ? JSON.parse(JSON.stringify(props.filtersObj.filters)) : null)
    }
  }, [props.toggleActiveFilterTab, props.filtersObj])

  return (
    <>
      <FloatingCardContainer
        bounds={props.filtersObj.bounds ? props.filtersObj.bounds : 'parent'}
        defaultPosition={props.defaultPosition}
        position={props.position}
        onPositionChange={props.onPositionChange}
        toggleActiveFilterTab={props.toggleActiveFilterTab}
        dim={dim}
        onResize={onResize}
        resizable={true}
      >
        <>
        <AppBar
          position="static"
          color="default"
          style={{
            backgroundColor: theme.palette.primary.dark,
            boxShadow: 'none',
            display: 'block'
          }}
          className="handle handleResize"
        >
          <span className={classes.titleContainer}>
            <Typography align="left" variant="h4">
              {t('labels:filters')}
            </Typography>
          </span>
          {props.filtersObj.tabs > 1 ? (
            <span className={classes.tabsContainer}>
              <Tabs
                value={tab}
                onChange={handleChange}
                indicatorColor="primary"
                classes={{ indicator: classes.indicator }}
                color="white"
                variant="scrollable"
                aria-label="full width tabs example"
              >
                <Tab label={t('labels:tab1')} {...a11yProps(0)} />
                <Tab label={t('labels:tab2')} {...a11yProps(1)} />
              </Tabs>
            </span>
          ) : null}
          <span>
            <IconButton
              style={{ marginTop: '10px', position: 'absolute', right: '10px' }}
              onClick={() => {
                props.setToggleActiveFilterTab(false)
              }}
            >
              <CloseIcon />
            </IconButton>
          </span>
        </AppBar>
        {/* </CardHeader> */}
        <CardContent
          style={{
            backgroundColor: theme.palette.primary.main,
            padding: '0px',
            overflowY: 'scroll',
            overflowX: 'hidden',
            height: dim.height - 100
          }}
        >
          {props.filtersObj.filters ? (
            props.filtersObj.tabs > 1 ? (
              <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={tab}
                onChangeIndex={handleChangeIndex}
                component={'span'}
                style={{
                  overflowX: 'hidden'
                }}
              >
                <Tab1 filters={filters} setFilters={setFilters} />

                <Tab2 filters={filters} setFilters={setFilters} />
              </SwipeableViews>
            ) : (
              <Tab1 filters={filters} setFilters={setFilters} />
            )
          ) : (
            <div className={classes.circularProgressContainer}>
              <CircularProgress color="secondary" size={60} />
            </div>
          )}
        </CardContent>
        <CardActions
          className={classes.cardAction}
          style={{ backgroundColor: theme.palette.primary.main }}
        >
          <Button
            variant="contained"
            size="small"
            className={classes.buttonReset}
            onClick={() => resetFilters()}
          >
            {t('labels:filter_reset')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.buttonApply}
            size="small"
            onClick={() => {
              const newObj = props.filtersObj
              newObj.filters = filters
              props.applyFiltersObj(newObj)
            }}
          >
            {t('labels:filter_apply')}
          </Button>
        </CardActions>
        </>
      </FloatingCardContainer>
    </>
  )
}
