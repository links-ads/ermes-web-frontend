import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import usePeopleList from '../../../../hooks/use-people-list.hook'
import useUsersList from '../../../../hooks/use-users-list.hook'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import SearchIcon from '@material-ui/icons/Search'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import CardWithPopup from './card-with-popup.component'
import { TextField, IconButton, CircularProgress } from '@material-ui/core'

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
  container_without_search: {
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
  margin: {
    margin: theme.spacing(1),
    width: '70%',
    marginBottom: 25,
    paddingRight: 15
  },
  applyButton: {
    margin: theme.spacing(1),
    marginTop: 23,
    marginBottom: 25,
    paddingRight: 15
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
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const [peopData, getPeopData, applyFilterReloadData, applyFilterByText] = usePeopleList()
  const [searchText, setSearchText] = React.useState('')

  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }
  const searchInPeople = () => {
    if (searchText !== undefined) {
      applyFilterByText(searchText)
    }
  }
  const classes = useStyles()

  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  const flyToCoords = function (latitude, longitude) {
    if (latitude && longitude) {
      props.setGoToCoord({ latitude: latitude, longitude: longitude })
    }
  }
  const { t } = useTranslation(['common', 'maps', 'social', 'labels'])

  useEffect(() => {
    getPeopData(
      0,
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
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  return (
    <div className="container_without_search">
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
          className={classes.container_without_search}
          id="scrollableElem"
          style={{ height: height - 280 }}
        >
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getPeopData(
                  peopData.data.length,
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
                  >
                    <div className={classes.details}>
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
                                : elem.username}
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
                          {['status', 'activityName'].map((type) => {
                            if (elem[type]) {
                              return (
                                <>
                                  <Typography
                                    component={'span'}
                                    variant="caption"
                                    color="textSecondary"
                                    style={{ textTransform: 'uppercase' }}
                                  >
                                    {t('maps:' + type)}:&nbsp;
                                    {/* {elem.replace(/([A-Z])/g, ' $1').trim()}: &nbsp; */}
                                  </Typography>
                                  <Typography component={'span'} variant="body1">
                                    {t('maps:' +elem[type])}
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
                    </div>
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
