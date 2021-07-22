// This script takes care of the floating widget containing all the filter the
// user can decide to select or deselect by clicking the third button on the top left list
// in the map page

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Draggable from 'react-draggable'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import { Button, CardActions, makeStyles, useTheme } from '@material-ui/core'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Checkbox from '@material-ui/core/Checkbox'
import { EmergencyColorMap } from '../../pages/protected/map/api-data/emergency.component'
import Typography from '@material-ui/core/Typography'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { useTranslation } from 'react-i18next'
import { Tab1, Tab2 } from './flating-filter-content.component'
import Box from '@material-ui/core/Box'
import { ResizableBox } from 'react-resizable'
import { FiltersDescriptorType } from './floating-filter.interface'
// import { useController, useForm } from 'react-hook-form'

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
  buttonAction: {
    marginRight: 15
  },
  floatingFilter: {
    position: 'absolute',
    zIndex: 9
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
  resizable: {
    position: 'relative',
    '& .react-resizable-handle': {
      position: 'absolute',
      width: 20,
      height: 20,
      bottom: 0,
      right: 0,
      background:
        "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
      'background-position': 'bottom right',
      padding: '0 3px 3px 0',
      'background-repeat': 'no-repeat',
      'background-origin': 'content-box',
      'box-sizing': 'border-box',
      cursor: 'se-resize'
    }
  }
}))

export default function FloatingFilterContainer(props) {
  // function for translation (we load map json)
  const { t } = useTranslation(['filters'])
  const theme = useTheme()
  const classes = useStyles()
  const [tab, setTab] = React.useState(0)
  const [dim, setDim] = useState({
    width: props.width ? props.width : 500,
    height: props.height ? props.height : 400
  })

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue)
  }
  const handleChangeIndex = (index: number) => {
    setTab(index)
  }
  const onResize = (event, data) => {
    setDim({ height: data.size.height, width: data.size.width })
  }
  const [filters, setFilters] = useState(props.filtersObj ? props.filtersObj.filters : {})

  useEffect(() => {
    console.log(props.filtersObj)
  }, [props.filtersObj])

  return (
    <>
      <Draggable
        axis="both"
        handle=".handle"
        defaultPosition={{ x: props.filtersObj.xystart[0], y: props.filtersObj.xystart[1] }}
        position={undefined}
        scale={1}
        onStart={(e) => e.preventDefault()}
        onDrag={(e) => e.preventDefault()}
        onStop={(e) => e.preventDefault()}
      >
        <div
          style={{ display: props.toggleActiveFilterTab ? undefined : 'none' }}
          className={classes.floatingFilter}
        >
          <Card>
            <ResizableBox
              height={dim.height}
              width={dim.width}
              onResize={onResize}
              className={classes.resizable}
              minConstraints={[500, 300]}
              maxConstraints={[1000, 800]}
            >
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
                    {t('filters:filters')}
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
                      <Tab label={t('maps:Report')} {...a11yProps(0)} />
                      <Tab label={t('maps:Communication')} {...a11yProps(1)} />
                    </Tabs>
                  </span>
                ) : null}
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
                {filters !== {} ? (
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
                ) : <div>LOADING</div>}
              </CardContent>
              <CardActions
                className={classes.cardAction}
                style={{ backgroundColor: theme.palette.primary.main }}
              >
                <Button
                  variant="contained"
                  size="small"
                  className={classes.buttonAction}
                  onClick={() => {
                    props.resetFiltersObj()
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.buttonAction}
                  size="small"
                  onClick={() => {
                    const newObj = props.filtersObj
                    newObj.filters = filters
                    props.setFiltersObj(newObj)
                  }}
                >
                  Apply
                </Button>
              </CardActions>
            </ResizableBox>
          </Card>
        </div>
      </Draggable>
    </>
  )
}
