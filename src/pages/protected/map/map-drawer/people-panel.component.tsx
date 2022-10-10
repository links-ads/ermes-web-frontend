import React, { useEffect } from 'react'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'

import CardWithPopup from './card-with-popup.component'
import List from '@material-ui/core/List'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import SearchIcon from '@material-ui/icons/Search'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import Box from '@material-ui/core/Box'
import { TextField, IconButton, CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import usePeopleList from '../../../../hooks/use-people-list.hook'
import ItemCounter from './item-counter'

const useStyles = makeStyles((theme) => ({
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
  cardList: {
    overflowY: 'scroll',
    height: '90%'
  },
  resizedContainer: {
    height: window.innerHeight - 270,
    overflowY: 'scroll'
  },
  card: {
    marginBottom: 15
  },
  cardAction: {
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingTop: 4,
    paddingBottom: 8,
    paddingRight: 16
  },
  details: {
    display: 'block'
  },
  topCard: {
    paddingBottom: 0
  },
  pos: {
    marginTop: 8
  },
  viewInMap: {
    textAlign: 'right',
    width: '10%',
    marginRight: '8px'
  },
  headerBlock: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}))

export default function PeoplePanel(props) {
  const classes = useStyles()
  // time formatter with relative options
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  // Main data + search text field text
  const [peopData, getPeopData, , applyFilterByText] = usePeopleList()
  const [searchText, setSearchText] = React.useState('')

  // Search text field management functions
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }
  const [prevSearchText, setPrevSearchText] = React.useState('')

  // on click of the search button
  const searchInPeople = () => {
    if (searchText !== undefined && searchText != prevSearchText) {
      applyFilterByText(searchText)
      setPrevSearchText(searchText)
    }
  }

  // function which takes care of fixing the list height for windows resize
  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // calls the passed function to fly in the map to the desired point
  const flyToCoords = function (latitude, longitude) {
    if (latitude && longitude) {
      props.setGoToCoord({ latitude: latitude, longitude: longitude })
    }
  }
  const { t } = useTranslation(['common', 'maps', 'social', 'labels'])
  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  // Calls the data only the first time is needed
  useEffect(() => {

    let selected = props.filters.content[1].selected
    let teamList = props.teamList
    
    var arrayOfTeams: number [] = []
    if(!!selected && selected.length>0){
      for(let i =0; i<selected.length; i++){
        let idFromContent = Number(!!getKeyByValue(teamList,selected[i]) ? getKeyByValue(teamList, selected[i]) : -1)
        if(idFromContent>=0)
        arrayOfTeams.push(idFromContent)
      }
 
    }

    getPeopData(
      0,
      undefined,
      (arrayOfTeams.length>0) ? arrayOfTeams : undefined,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, [])

  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  return (
    <div className="container_without_search">
      {/* Search box */}
      <span>
        <TextField
          id="outlined-basic"
          label={t('common:search')}
          variant="outlined"
          size="small"
          className={classes.searchField}
          onChange={handleSearchTextChange}
        />
        {!peopData.isLoading ? (
          <IconButton
            aria-label="search"
            color="inherit"
            onClick={searchInPeople}
            className={classes.searchButton}
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <CircularProgress color="secondary" size={30} className={classes.searchButton} />
        )}
      </span>
      {!peopData.isLoading ? (
        <div
        className={classes.resizedContainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <ItemCounter itemCount={peopData.tot} />
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getPeopData(
                  peopData.data.length,
                  undefined,
                  undefined,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={peopData.data.length}
              hasMore={peopData.data.length >= peopData.tot ? false : true}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {peopData.data.map((elem, i) => {
                //console.log('elem', peopData.data.length)
                return (
                  <CardWithPopup
                    key={'report' + String(elem.id)}
                    keyID={'report' + String(elem.id)}
                    latitude={elem?.location?.latitude as number}
                    longitude={elem?.location?.longitude as number}
                    className={classes.card}
                    map={props.map}
                    setMapHoverState={props.setMapHoverState}
                    spiderLayerIds={props.spiderLayerIds}
                    id={elem.id}
                    spiderifierRef={props.spiderifierRef}
                    type="Person"
                  >
                    
                      <CardContent className={classes.topCard}>
                        <div className={classes.headerBlock}>
                          <Box component="div" display="inline-block">
                            <Typography
                              gutterBottom
                              variant="h5"
                              component="h2"
                              style={{ marginBottom: '0px' }}
                            >
                              {elem.username.length > 22
                                ? elem.username.substring(0, 20) + '...'
                                :  (elem.displayName == null ? (elem.username == null ? elem.email : elem.username) : elem.displayName)}
                            </Typography>
                          </Box>
                          <Box component="div" display="inline-block">
                            <Typography
                              color="textSecondary"
                              style={{ fontSize: '14px', paddingTop: '6px' }}
                            >
                              {formatter.format(new Date(elem.timestamp as string))}
                            </Typography>
                          </Box>
                        </div>
                        <div className={classes.pos}>
                          {['status', 'activityName', 'organizationName', 'teamName'].map((type) => {
                            if (elem[type]) {
                              return (
                                <>
                                  <Typography
                                    component={'span'}
                                    variant="caption"
                                    color="textSecondary"
                                    style={{ textTransform: 'uppercase' }}
                                  >
                                    {t('maps:' + type)}:&nbsp;{' '}
                                  </Typography>
                                  <Typography component={'span'} variant="body1">
                                    {t('maps:' + elem[type])}
                                  </Typography>
                                  <br />
                                </>
                              )
                            }
                            return null
                          })}
                        </div>
                      </CardContent>
                      <CardActions className={classes.cardAction}>
                        <Typography variant="body2" color="textSecondary">
                          {(elem?.location?.latitude as number)?.toFixed(4) +
                            ' , ' +
                            (elem?.location?.longitude as number)?.toFixed(4)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            flyToCoords(
                              elem?.location?.latitude as number,
                              elem?.location?.longitude as number
                            )
                          }
                          className={classes.viewInMap}
                        >
                          <LocationOnIcon />
                        </IconButton>
                      </CardActions>
                    
                  </CardWithPopup>
                )
              })}
            </InfiniteScroll>
          </List>
        </div>
      ) : null}
    </div>
  )
}
