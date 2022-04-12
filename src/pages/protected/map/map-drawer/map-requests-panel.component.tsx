import React, { useEffect, useMemo } from 'react'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'

import useMapRequestList from '../../../../hooks/use-map-requests-list.hook'
import { HAZARD_SOCIAL_ICONS } from '../../../../utils/utils.common'
import CardWithPopup from './card-with-popup.component'

import LocationOnIcon from '@material-ui/icons/LocationOn'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import ItemCounter from './item-counter'
import { NO_LAYER_SELECTED } from '../map-layers/layers-select.component'

const useStyles = makeStyles(() => ({
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

  fixHeightcontainer: {
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
    paddingRight: 0
  },
  cardList: {
    overflowY: 'scroll',
    height: '90%'
  },
  headerBlock: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  pos: {
    marginTop: 8
  }
}))

export default function MapRequestsPanel(props) {
  const classes = useStyles()
  const { t } = useTranslation(['common', 'maps'])

  const [searchText, setSearchText] = React.useState('')
  const [mapRequestsData, getMapRequestsData, applyFilterByText] = useMapRequestList()

  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // handle the text changes in the search field
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  const searchInMiss = () => {
    if (searchText !== undefined) {
      applyFilterByText(searchText)
    }
  }

  // Calls the data only the first time is needed
  useEffect(() => {
    getMapRequestsData(
      0,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, [getMapRequestsData])

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
        {!mapRequestsData.isLoading ? (
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
      {!mapRequestsData.isLoading ? (
        <div
          className={classes.fixHeightcontainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <ItemCounter itemCount={mapRequestsData.tot} />
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getMapRequestsData(
                  mapRequestsData.data.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={mapRequestsData.data.length}
              hasMore={mapRequestsData.data.length >= mapRequestsData.tot ? false : true}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {mapRequestsData.data.map((elem, i) => {
                return (<MapRequestCard
                  key={i}
                  elem={elem}
                  setGoToCoord={props.setGoToCoord}
                  map={props.map}
                  setMapHoverState={props.setMapHoverState}
                  spiderLayerIds={props.spiderLayerIds}
                  spiderifierRef={props.spiderifierRef}
                  layerSelection={props.layerSelection}
                  setLayerSelection={props.setLayerSelection}
                  layerId2Tiles={props.layerId2Tiles}
                />
                )
              })}
            </InfiniteScroll>
          </List>
        </div>
      ) : null}
    </div>
  )
}

function MapRequestCard(props) {

  const { t } = useTranslation(['common', 'maps'])
  // time formatter with relative options
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)
  const classes = useStyles()

  const { elem, setGoToCoord, map, setMapHoverState, spiderLayerIds, spiderifierRef, layerSelection, setLayerSelection } = props

  const handleRadioClick = (event: any) => {
    let selected = event.target.value.split("_")[1]
    if ((layerSelection.mapRequestCode === elem.code) && (selected === layerSelection.dataTypeId)) {
      setLayerSelection({ isMapRequest: NO_LAYER_SELECTED, mapRequestCode: NO_LAYER_SELECTED, dataTypeId: NO_LAYER_SELECTED })
    } else {
      setLayerSelection({ isMapRequest: 1, mapRequestCode: elem.code, dataTypeId: selected })
    }
  }

  return (
    <CardWithPopup
      key={'map-request' + String(elem.id)}
      keyID={'map-request' + String(elem.id)}
      latitude={elem!.centroid!.latitude as number}
      longitude={elem!.centroid!.longitude as number}
      className={classes.card}
      map={map}
      setMapHoverState={setMapHoverState}
      spiderLayerIds={spiderLayerIds}
      id={elem.id}
      spiderifierRef={spiderifierRef}
      type="MapRequest"
    >
      <CardContent>
        <div className={classes.headerBlock}>
          <Box component="div" display="inline-block">
            <Typography
              gutterBottom
              variant="h5"
              component="h2"
              style={{ marginBottom: '0px' }}
            >
              {elem.code}
            </Typography>
          </Box>
        </div>
        <div className={classes.pos}>
          {['layer', 'status'].map((type) => {
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
                    {t('labels:' + elem[type].toLowerCase())}
                  </Typography>
                  <br />
                </>
              )
            }
            return null
          })}
        </div>
        <div className={classes.pos}>
          {(elem.status === 'ContentAvailable') && (elem.code in props.layerId2Tiles[1]) && (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Layers</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl component="fieldset" fullWidth={true}>
                  <RadioGroup
                    aria-label="gender"
                    name="controlled-radio-buttons-group"
                    value={layerSelection.mapRequestCode+"_"+layerSelection.dataTypeId}
                  >
                    {Object.entries(props.layerId2Tiles[1][elem.code]).map(
                      ([dataTypeId, layerData]: [string, any]) => {
                        return (<FormControlLabel
                          key={dataTypeId}
                          value={elem.code+"_"+dataTypeId}
                          control={<Radio onClick={handleRadioClick} />}
                          label={layerData['name']}
                        />)
                      }
                    )}
                  </RadioGroup>
                </FormControl>
              </AccordionDetails>
            </Accordion>
            )
          }
        </div>
      </CardContent>
      <CardActions className={classes.cardAction}>
        <Typography color="textSecondary" variant="body2">
          {' '}
          {formatter.format(new Date(elem.duration?.lowerBound as string))} -{' '}
          {formatter.format(new Date(elem.duration?.upperBound as string))}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setGoToCoord(
            {
              latitude: elem?.centroid?.latitude as number,
              longitude: elem?.centroid?.longitude as number
            })
          }
          className={classes.viewInMap}
        >
          <LocationOnIcon />
        </IconButton>
      </CardActions>
    </CardWithPopup>
  )
}