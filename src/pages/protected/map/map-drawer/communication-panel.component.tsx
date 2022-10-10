import React, { useEffect, useState } from 'react'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'

import CardWithPopup from './card-with-popup.component'
import useCommList from '../../../../hooks/use-comm-list.hook'

import { makeStyles } from '@material-ui/core/styles'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import SearchIcon from '@material-ui/icons/Search'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import ItemCounter from './item-counter'
import { Chip } from '@material-ui/core'
import { CommunicationScopeType } from 'ermes-ts-sdk'

const useStyles = makeStyles((theme) => ({
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
  },

  fixHeightContainer: {
    height: window.innerHeight - 270,
    overflowY: 'scroll'
  },
  card: {
    marginBottom: 15
  },
  chipContainer: {
    width: '100%'
  },
  chipStyle: {
    marginBottom: 10,
    marginRight: '10px',
    backgroundColor: theme.palette.primary.dark,
    borderColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText
  },
  cardAction: {
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingTop: 4,
    paddingBottom: 8,
    paddingRight: 0
  },
  cardList: {
    overflowY: 'scroll',
    height: '90%'
  }
}))

export default function CommunicationPanel(props) {
  const classes = useStyles()
  const { t } = useTranslation(['common', 'maps'])

  // time formatter with relative options
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const [searchText, setSearchText] = React.useState('')
  const [commsData, getCommsData, applyFilterByText] = useCommList()

  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // handle the text changes in the search field
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  const [prevSearchText, setPrevSearchText] = React.useState('')
  // on click of the search button
  const searchInComm = () => {
    if (searchText !== undefined && searchText != prevSearchText) {
      applyFilterByText(searchText)
      setPrevSearchText(searchText)
    }
  }

  // calls the passed function to fly in the map to the desired point
  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  // Calls the data only the first time is needed
  useEffect(() => {
    getCommsData(
      0,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  },[]) // removed [getcommsdata] cause it was being called on filter search

  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  return (
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
        {!commsData.isLoading ? (
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
      {!commsData.isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <ItemCounter itemCount={commsData.tot} />
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getCommsData(
                  commsData.data.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={commsData.data.length}
              hasMore={commsData.data.length >= commsData.tot ? false : true}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {commsData.data.map((elem, i) => {
                return (
                  <CardWithPopup
                    key={'report' + String(elem.id)}
                    keyID={'report' + String(elem.id)}
                    latitude={elem!.centroid!.latitude as number}
                    longitude={elem!.centroid!.longitude as number}
                    className={classes.card}
                    map={props.map}
                    setMapHoverState={props.setMapHoverState}
                    spiderLayerIds={props.spiderLayerIds}
                    id={elem.id}
                    spiderifierRef={props.spiderifierRef}
                    type='Communication'
                  >
                    {' '}
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {elem.message}
                      </Typography>
                      <div>
                      <>
                        <Typography
                          component={'span'}
                          variant="caption"
                          color="textSecondary"
                          style={{ textTransform: 'uppercase' }}
                        >
                          {t('maps:organization')}:&nbsp;
                        </Typography>
                        <Typography component={'span'} variant="body1">
                          {elem.organizationName}
                        </Typography>
                      </>
                      </div>
                      
                      <div className={classes.chipContainer}>
                          <Chip
                            label={elem.scope === CommunicationScopeType.RESTRICTED ? t('labels:restricted') : t('labels:public')}
                            color="primary"
                            size="small"
                            className={classes.chipStyle}
                          />
                          
                         <> {elem.scope === CommunicationScopeType.RESTRICTED?(
                         <Chip
                            label={t('labels:' + elem.restriction.toLowerCase())}
                            color="primary"
                            size="small"
                            className={classes.chipStyle}
                         
                          />
                          ): null}</>
                        </div>
                        
                        <div>
                      <Typography color="textSecondary">
                        {' '}
                        {formatter.format(new Date(elem.duration?.lowerBound as string))} -{' '}
                        {formatter.format(new Date(elem.duration?.upperBound as string))}
                      </Typography>
                      </div>
                    </CardContent>
                    <CardActions className={classes.cardAction}>
                      <Typography color="textSecondary">
                        {(elem!.centroid!.latitude as number).toFixed(4) +
                          ' , ' +
                          (elem!.centroid!.longitude as number).toFixed(4)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          flyToCoords(
                            elem?.centroid?.latitude as number,
                            elem?.centroid?.longitude as number
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
