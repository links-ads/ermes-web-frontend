// Panel displaying the list of reports (segnalazioni) on the left side Drawer.
import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CardMedia from '@material-ui/core/CardMedia'

import { Chip, IconButton, TextField, useTheme } from '@material-ui/core'

import useReportList from '../../../../hooks/use-report-list.hook'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'

import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import { HAZARD_SOCIAL_ICONS } from '../../../../utils/utils.common'
import { useTranslation } from 'react-i18next'
import CardWithPopup from './card-with-popup.component'
import SearchIcon from '@material-ui/icons/Search'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import CircularProgress from '@material-ui/core/CircularProgress'
import ItemCounter from './item-counter'

const useStyles = makeStyles((theme) => ({
  cardList: {
    overflowY: 'scroll',
    height: '90%'
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
  details: {
    display: 'inline-block',
    width: '70%'
  },
  cover: {
    width: '30%',
    height: 183
  },
  topCard: {
    paddingBottom: 5
  },
  viewInMap: {
    textAlign: 'right',
    width: '10%',
    display: 'inline-block',
    top: '-3px',
    right: '-14px'
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
  chipContainer: {
    width: '100%'
  },
  chipStyle: {
    marginBottom: 10,
    marginRight: '10px',
    position: 'relative',
    float: 'left'
  },
  fixHeightContainer: {
    height: window.innerHeight - 270,
    overflowY: 'scroll'
  }
}))

export default function ReportPanel(props) {
  const theme = useTheme()
  const classes = useStyles()

  // time formatter with relative options
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const [repsData, getRepsData, , applyFilterByText] = useReportList()
  const { t } = useTranslation(['common', 'maps', 'social'])
  const [searchText, setSearchText] = useState('')

  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // calls the passed function to fly in the map to the desired point
  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  // handle the text changes in the search field
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  const [prevSearchText, setPrevSearchText] = React.useState('')

  // on click of the search button
  const searchInReport = () => {
    if (searchText !== undefined && searchText != prevSearchText) {
      applyFilterByText(searchText)
      setPrevSearchText(searchText)
    }
  }

  // Calls the data only the first time is needed
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

  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  return (
    <div className="containerWithSearch">
      {/* Search field  */}
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
            onClick={searchInReport}
            className={classes.searchButton}
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <CircularProgress color="secondary" size={30} className={classes.searchButton} />
        )}
      </span>
      {/* List of reports */}
      {!repsData.isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 280 }}
        >
          <ItemCounter itemCount={repsData.tot} />
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
                    type='Report'
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
                        <div>
                          <Typography
                            gutterBottom
                            variant="h5"
                            component="h2"
                            style={{ marginBottom: '0px', width: '85%', display: 'inline-block' }}
                          >
                            {HAZARD_SOCIAL_ICONS[elem.hazard.toLowerCase()]
                              ? HAZARD_SOCIAL_ICONS[elem.hazard.toLowerCase()]
                              : null}
                            {' ' + t('maps:' + elem.hazard.toLowerCase())}
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
                        </div>
                        <Typography color="textSecondary">
                          {formatter.format(new Date(elem.timestamp as string))}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          {elem?.description?.length > 40
                            ? elem.description.substring(0, 37) + '...'
                            : elem.description}
                        </Typography>
                        <div style={{display:'flex', flexDirection:'row'}}>
                        { !!elem.organizationName ? (
                        <>
                          <Typography
                            component={'span'}
                            variant="body2"
                            color="textSecondary"
                            style={{ textTransform: 'uppercase' }}
                          >
                            {t('maps:organization')}:&nbsp;
                          </Typography>
                          <Typography component={'span'} variant="body1">
                      
                            {elem.organizationName.length > 17
                            ? elem.organizationName.substring(0, 14) + '...'
                            : elem.organizationName}
                          </Typography>
                        </>
                        ) : (null)}
                        </div>
                        <div style={{display:'flex', flexDirection:'row'}}>
                           <>
                          <Typography
                            component={'span'}
                            variant="body2"
                            color="textSecondary"
                            style={{ textTransform: 'uppercase' }}
                          >
                            {t('maps:creator')}:&nbsp;
                          </Typography>
                          <Typography component={'span'} variant="body1">
                            
                            {elem.displayName == null ? (elem.username == null ? elem.email : elem.username) : ( elem?.displayName.length > 20
                            ? elem.displayName.substring(0, 20) + '...'
                            : elem.displayName)}
                          </Typography>
                        </>
                        </div>
                      </CardContent>
                      <CardActions className={classes.cardAction}>
                        <div className={classes.chipContainer}>
                          <Chip
                            label={elem.isPublic ? t('common:public') : t('common:private')}
                            color="primary"
                            size="small"
                            className={classes.chipStyle}
                          />
                          <Chip
                            label={t('common:' + elem.content.toLowerCase())}
                            color="primary"
                            size="small"
                            className={classes.chipStyle}
                            style={{
                              backgroundColor: theme.palette.primary.contrastText,
                              borderColor: theme.palette.primary.dark,
                              color: theme.palette.primary.dark
                            }}
                          />
                        </div>
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
