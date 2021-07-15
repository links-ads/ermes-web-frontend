import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CardMedia from '@material-ui/core/CardMedia'

import { IconButton, TextField } from '@material-ui/core'

import useReportList from '../../../../hooks/use-report-list.hook'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'

import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import { HAZARD_SOCIAL_ICONS } from '../../../../utils/utils.common'
import { useTranslation } from 'react-i18next'
import CardWithPopup from './card-with-popup.component'
import SearchIcon from '@material-ui/icons/Search'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles((theme) => ({
  cardList: {
    overflowY: 'scroll',
    height: '90%'
  },
  container_without_search: {
    overflowY: 'scroll'
  },
  card: {
    marginBottom: 15,
    display: 'flex'
  },
  cardAction: {
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingTop: 4,
    paddingBottom: 0,
    paddingRight: 0
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
    display: 'inline-block',
    width: '70%'
  },
  cover: {
    width: '30%',
    height: 154,
    display: 'inline-block'
  },
  topCard: {
    paddingBottom: 16
  },
  viewInMap: {
    textAlign: 'right',
    width: '10%',
    marginRight: '8px'
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
  }
}))

export default function ReportPanel(props) {
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const classes = useStyles()
  const [repsData, getRepsData, applyFilterReloadData, applyFilterByText] = useReportList()
  const { t } = useTranslation(['common', 'maps', 'social'])
  const [searchText, setSearchText] = useState('')

  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  useEffect(() => {
    getRepsData(
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
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  const searchInComm = () => {
    if (searchText !== undefined) {
      applyFilterByText(searchText)
    }
  }

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
        {!repsData.isLoading ? (
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
      {!repsData.isLoading ? (
        <div
          className={classes.container_without_search}
          id="scrollableElem"
          style={{ height: height - 280 }}
        >
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
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
              hasMore={repsData.data.length >= repsData.tot ? false : true}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {repsData.data.map((elem, i) => {
                return (
                  <CardWithPopup
                    key={'report' + String(elem.id)}
                    keyID={'report' + String(elem.id)}
                    latitude={elem!.location!.latitude as number}
                    longitude={elem!.location!.longitude as number}
                    className={classes.card}
                    map={props.map}
                    setMapHoverState={props.setMapHoverState}
                    spiderLayerIds={props.spiderLayerIds}
                    id={elem.id}
                    spiderifierRef={props.spiderifierRef}
                  >
                    <CardMedia
                      className={classes.cover}
                      image={
                        elem.mediaURIs &&
                        elem.mediaURIs?.length > 0 &&
                        elem.mediaURIs[0].thumbnailURI
                          ? elem.mediaURIs[0].thumbnailURI
                          : 'https://via.placeholder.com/400x200.png?text=' +
                            t('common:image_not_available')
                      }
                      title="Contemplative Reptile"
                    />
                    <div className={classes.details}>
                      <CardContent className={classes.topCard}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h2"
                          style={{ marginBottom: '0px' }}
                        >
                          {HAZARD_SOCIAL_ICONS[elem.hazard.toLowerCase()]
                            ? HAZARD_SOCIAL_ICONS[elem.hazard.toLowerCase()]
                            : null}
                          {' ' + t('maps:' + elem.hazard.toLowerCase())}
                        </Typography>
                        <Typography color="textSecondary">
                          {formatter.format(new Date(elem.timestamp as string))}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          {elem.description.length > 40
                            ? elem.description.substring(0, 37) + '...'
                            : elem.description}
                          {/* {elem.notes ? ' - ' + elem.notes : null} */}
                        </Typography>
                      </CardContent>
                      <CardActions className={classes.cardAction}>
                        <Typography variant="body2" color="textSecondary">
                          {(elem!.location!.latitude as number).toFixed(4) +
                            ' , ' +
                            (elem!.location!.longitude as number).toFixed(4)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            flyToCoords(
                              elem!.location!.latitude as number,
                              elem!.location!.longitude as number
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
