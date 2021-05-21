import React, { useEffect } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'

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
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'

const useStyles = makeStyles((theme) => ({
  root: {
    width: 850,
    maxWidth: 550,
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
    height: window.innerHeight - 327,
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
    width: '90%',
    marginBottom: 20
  },
  searchButton: {
    marginBottom: 20,
    padding: 9,
    marginLeft: 6
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
      {value === index && <Box p={3}>{children}</Box>}
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
  const { commsData, isCommsLoading, getNextValues, recordsTotal, filterByText } = useCommList()
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
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }
  const searchInComm = () => {
    console.log(searchText)
    if(searchText !== undefined ){
      filterByText(searchText)
    }

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
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            classes={{ indicator: classes.indicator }}
            color="white"
            variant="scrollable"
            aria-label="full width tabs example"
          >
            <Tab label="Comunicazione" {...a11yProps(0)} />
            <Tab label="Missione" {...a11yProps(1)} />
            <Tab label="Persona" {...a11yProps(2)} />
            <Tab label="Report" {...a11yProps(3)} />
            <Tab label="Else" {...a11yProps(4)} />
          </Tabs>
        </AppBar>

        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
          component={'span'}
        >
          <TabPanel value={value} index={0}>
            <div className="container">
              <span>
                <TextField
                  id="outlined-basic"
                  label="Search"
                  variant="outlined"
                  size="small"
                  className={classes.searchField}
                  onChange={handleSearchTextChange}
                />
                <IconButton
                  aria-label="search"
                  color="inherit"
                  onClick={searchInComm}
                  className={classes.searchButton}
                >
                  <SearchIcon />
                </IconButton>
              </span>
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
                    loader={<h4>Loading...</h4>}
                    endMessage={
                      <div style={{ textAlign: 'center' }}>
                        <b>Yay! You have seen it all</b>
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
                              2021-01-17 16:18 - 2021-01-18 23:05
                            </Typography>
                          </CardContent>
                          <CardActions className={classes.cardAction}>
                            <Typography color="textSecondary">
                              {elem!.centroid!.latitude + ' , ' + elem!.centroid!.longitude}
                            </Typography>
                            <Button size="medium">Action</Button>
                          </CardActions>
                        </Card>
                      )
                    })}
                  </InfiniteScroll>
                </List>
              </div>
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            Item Two
          </TabPanel>
          <TabPanel value={value} index={2}>
            Item Three
          </TabPanel>
          <TabPanel value={value} index={3}>
            Item Four
          </TabPanel>
          <TabPanel value={value} index={4}>
            Item Else
          </TabPanel>
        </SwipeableViews>
        <AppBar
          position="static"
          color="default"
          style={{
            backgroundColor: theme.palette.primary.main
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            color="white"
            variant="scrollable"
            classes={{ indicator: classes.indicator }}
            aria-label="full width tabs example"
          >
            <Tab label="Comunicazione" {...a11yProps(0)} />
            <Tab label="Missione" {...a11yProps(1)} />
            <Tab label="Persona" {...a11yProps(2)} />
            <Tab label="Report" {...a11yProps(3)} />
            <Tab label="Else" {...a11yProps(4)} />
          </Tabs>
        </AppBar>
      </div>
    </Slide>
  )
}
