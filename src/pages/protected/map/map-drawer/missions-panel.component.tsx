import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useMissionsList from '../../../../hooks/use-missions-list.hook'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import CardWithPopup from './card-with-popup.component'

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
  viewInMap: {
    textAlign: 'right',
    width: '10%',
    marginRight: '8px'
  },

  container: {
    height: window.innerHeight - 270,
    overflowY: 'scroll'
  },
  card: {
    marginBottom: 15
    // display: 'flex'
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
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const classes = useStyles()
  const { t } = useTranslation(['common', 'maps'])
  const [searchText, setSearchText] = React.useState('')
  const [missionsData, getMissionsData, applyFilterByText] = useMissionsList()
  const [height, setHeight] = React.useState(window.innerHeight)

  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  const searchInMiss = () => {
    if (searchText !== undefined) {
      applyFilterByText(searchText)
    }
  }
  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  useEffect(() => {
    getMissionsData(
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

  // useEffect(() => {
  //   setStartDate(props.selectedStartDate)
  // }, [props.selectedStartDate, setStartDate])

  // useEffect(() => {
  //   setEndDate(props.selectedEndDate)
  // }, [props.selectedEndDate, setEndDate])
  // useEffect(() => {
  //   console.log('MISSION DATA', missionsData)
  // }, [missionsData])

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
        {!missionsData.isLoading ? (
          <IconButton
            aria-label="search"
            color="inherit"
            onClick={searchInMiss}
            className={classes.searchButton}
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <CircularProgress color="secondary" size={30} className={classes.searchButton} />
        )}
      </span>
      {!missionsData.isLoading ? (
        <div className={classes.container} id="scrollableElem" style={{ height: height - 270 }}>
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getMissionsData(
                  missionsData.data.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={missionsData.data.length}
              hasMore={missionsData.data.length >= missionsData.tot ? false : true}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
              // className={classes.cardList}
            >
              {missionsData.data.map((elem, i) => {
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
                  >
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {elem.title}
                      </Typography>
                      <Typography color="textSecondary">
                        {' '}
                        {formatter.format(new Date(elem.duration?.lowerBound as string))} -{' '}
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
