import React, { useState, useEffect } from 'react'
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles'

import Slide from '@material-ui/core/Slide'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import useCommList from '../../../hooks/use-comm-list.hook'
import useReportList from '../../../hooks/use-report-list.hook'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useTranslation } from 'react-i18next'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardMedia from '@material-ui/core/CardMedia'

const useStyles = makeStyles((theme) => ({
  root: {
    width: 850,
    maxWidth: 450,
    height: '101%',
    backgroundColor: theme.palette.primary.dark,
    position: 'absolute',
    zIndex: 99
  },
  cardList: {
    overflowY: 'scroll',
    height: '90%'
  },
  container: {
    height: window.innerHeight - 270,
    overflowY: 'scroll'
  },
  container_without_search: {
    height: window.innerHeight - 190,
    overflowY: 'scroll'
  },
  card: {
    marginBottom: 15
  },
  cardAction: {
    justifyContent: 'space-between',
    padding: 16
  },
  searchField: {
    marginTop: 20,
    width: '88%',
    marginBottom: 20
  },
  searchButton: {
    marginBottom: 20,
    marginTop: 20,
    padding: 9,
    marginLeft: 6
  },
  indicator: {
    backgroundColor: '#FFF'
  },
  media: {
    height: 140
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
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions

  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)
  const classes = useStyles()
  const {
    commsData,
    isCommsLoading,
    getNextValues,
    recordsTotal,
    filterByText,
    setStartDate,
    setEndDate
  } = useCommList()
  const [repsData, getRepsData] = useReportList()
  const [value, setValue] = React.useState(0)
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }
  const theme = useTheme()
  const handleChangeIndex = (index: number) => {
    setValue(index)
  }
  const [searchText, setSearchText] = React.useState('')

  useEffect(() => {
    if (!isCommsLoading) {
      console.log(commsData)
    }
  }, [commsData, isCommsLoading])
  // getRepsData()
  useEffect(() => {
    getRepsData(0,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, [])

  useEffect(() => {
    if (!repsData.isLoading) {
      console.log('REPS DATA', repsData)
      // console.log(repsData?[0].mediaURIs?[0].thumbnailURI)
    }
  }, [repsData])
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }
  const searchInComm = () => {
    console.log(searchText)
    if (searchText !== undefined) {
      filterByText(searchText)
    }
  }

  useEffect(() => {
    setStartDate(props.selectedStartDate)
  }, [props.selectedStartDate, setStartDate])

  useEffect(() => {
    setEndDate(props.selectedEndDate)
  }, [props.selectedEndDate, setEndDate])

  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  const { t } = useTranslation(['common'])

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
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            classes={{ indicator: classes.indicator }}
            color="white"
            variant="scrollable"
            aria-label="full width tabs example"
          >
            <Tab label="Report" {...a11yProps(0)} />
            <Tab label="Comunicazione" {...a11yProps(1)} />
            <Tab label="Missione" {...a11yProps(2)} />
            <Tab label="Persona" {...a11yProps(3)} />
          </Tabs>
        </AppBar>

        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
          component={'span'}
        >
          {/* REPORTS */}
          <TabPanel value={value} index={0}>
            <div className="container_without_search">
              {/* <span>
                <TextField
                  id="outlined-basic"
                  label="Search"
                  variant="outlined"
                  size="small"
                  className={classes.searchField}
                  onChange={handleSearchTextChange}
                />
                {!isCommsLoading ? (
                  <IconButton
                    aria-label="search"
                    color="inherit"
                    onClick={searchInComm}
                    className={classes.searchButton}
                  >
                    <SearchIcon />
                  </IconButton>
                ) : (
                  <CircularProgress color="secondary" size={30} className={classes.searchButton} />
                )}
              </span> */}
              {!repsData.isLoading ? (
                <div className={classes.container_without_search} id="scrollableElem">
                  <List
                    component="span"
                    aria-label="main mailbox folders"
                    className={classes.cardList}
                  >
                    <InfiniteScroll
                      next={() => {
                        getRepsData(
                          repsData.data.length,
                          (data) => {
                            return data
                          },
                          {},
                          (data) => {
                            return data
                          }
                        )
                      }}
                      dataLength={repsData.data.length}
                      hasMore={repsData.data.length >= repsData.tot? false : true}
                      loader={<h4>{t('common:loading')}</h4>}
                      endMessage={
                        <div style={{ textAlign: 'center' }}>
                          <b>{t('common:end_of_list')}</b>
                        </div>
                      }
                      scrollableTarget="scrollableElem"
                      // className={classes.cardList}
                    >
                      {repsData.data.map((elem, i) => {
                        return (
                          <Card key={elem.id} className={classes.card}>
                            <CardActionArea>
                              <CardMedia
                                className={classes.media}
                                image={
                                  elem.mediaURIs &&
                                  elem.mediaURIs?.length > 0 &&
                                  elem.mediaURIs[0].thumbnailURI
                                    ? elem.mediaURIs[0].thumbnailURI
                                    : 'https://via.placeholder.com/400x200.png?text=' +
                                      t('common:image_not_available')
                                }
                                // image="https://via.placeholder.com/150C/O"
                                title="Contemplative Reptile"
                              />
                              <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                  {elem.hazard}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                  {elem.description} {elem.notes ? ' - ' + elem.notes : null}
                                </Typography>
                                <Typography color="textSecondary">
                                  {' '}
                                  {formatter.format(new Date(elem.timestamp as string))}
                                </Typography>
                              </CardContent>
                              <CardActions className={classes.cardAction}>
                                <Typography color="textSecondary">
                                  {(elem!.location!.latitude as number).toFixed(4) +
                                    ' , ' +
                                    (elem!.location!.longitude as number).toFixed(4)}
                                </Typography>
                                <Button
                                  size="medium"
                                  onClick={() =>
                                    flyToCoords(
                                      elem!.location!.latitude as number,
                                      elem!.location!.longitude as number
                                    )
                                  }
                                >
                                  {t('common:view_in_map')}
                                </Button>
                              </CardActions>
                            </CardActionArea>
                          </Card>
                        )
                      })}
                    </InfiniteScroll>
                  </List>
                </div>
              ) : null}
            </div>
          </TabPanel>

          {/* COMMUNICATION */}
          <TabPanel value={value} index={1}>
            <div className="container">
              <span>
                <TextField
                  id="outlined-basic"
                  label={t('common:search')}
                  variant="outlined"
                  size="small"
                  className={classes.searchField}
                  onChange={handleSearchTextChange}
                />
                {!isCommsLoading ? (
                  <IconButton
                    aria-label="search"
                    color="inherit"
                    onClick={searchInComm}
                    className={classes.searchButton}
                  >
                    <SearchIcon />
                  </IconButton>
                ) : (
                  <CircularProgress color="secondary" size={30} className={classes.searchButton} />
                )}
              </span>
              {!isCommsLoading ? (
                <div className={classes.container} id="scrollableElem">
                  <List
                    component="span"
                    aria-label="main mailbox folders"
                    className={classes.cardList}
                  >
                    <InfiniteScroll
                      next={getNextValues}
                      dataLength={commsData.length}
                      hasMore={!(recordsTotal === Number(commsData.length))}
                      loader={<h4>{t('common:loading')}</h4>}
                      endMessage={
                        <div style={{ textAlign: 'center' }}>
                          <b>{t('common:end_of_list')}</b>
                        </div>
                      }
                      scrollableTarget="scrollableElem"
                      // className={classes.cardList}
                    >
                      {commsData.map((elem, i) => {
                        return (
                          <Card key={elem.id} className={classes.card}>
                            <CardContent>
                              <Typography variant="h5" component="h2" gutterBottom>
                                {elem.message}
                              </Typography>
                              <Typography color="textSecondary">
                                {' '}
                                {formatter.format(
                                  new Date(elem.duration?.lowerBound as string)
                                )} -{' '}
                                {formatter.format(new Date(elem.duration?.upperBound as string))}
                                {/* {elem.duration?.lowerBound} - {elem.duration?.upperBound} */}
                              </Typography>
                            </CardContent>
                            <CardActions className={classes.cardAction}>
                              <Typography color="textSecondary">
                                {(elem!.centroid!.latitude as number).toFixed(4) +
                                  ' , ' +
                                  (elem!.centroid!.longitude as number).toFixed(4)}
                              </Typography>
                              <Button
                                size="medium"
                                onClick={() =>
                                  flyToCoords(
                                    elem!.centroid!.latitude as number,
                                    elem!.centroid!.longitude as number
                                  )
                                }
                              >
                                {t('common:view_in_map')}
                              </Button>
                            </CardActions>
                          </Card>
                        )
                      })}
                    </InfiniteScroll>
                  </List>
                </div>
              ) : null}
            </div>
          </TabPanel>

          <TabPanel value={value} index={2}>
            Item Three
          </TabPanel>
          <TabPanel value={value} index={3}>
            Item Four
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
