import React, { ChangeEvent, useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'

import useMapRequestList from '../../../../hooks/use-map-requests-list.hook'
import CardWithPopup from './card-with-popup.component'

import LocationOnIcon from '@material-ui/icons/LocationOn'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControl, FormControlLabel, Checkbox, FormGroup } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import { Slider } from '@material-ui/core'
import ItemCounter from './item-counter'
import { NO_LAYER_SELECTED } from '../map-layers/layers-select.component'
import LegendIcon from '@material-ui/icons/FilterNone'
import MetaIcon from '@material-ui/icons/InfoOutlined'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import DeleteIcon from '@material-ui/icons/Delete'
import FileCopyIcon from '@material-ui/icons/FileCopy';
import SkipNextIcon from '@material-ui/icons/SkipNext'
import { CommunicationRestrictionType, LayerImportStatusType, MapRequestStatusType, MissionStatusType } from 'ermes-ts-sdk'
import useDeleteMapRequest from '../../../../hooks/use-delete-map-request.hook'
import { CoordinatorType, DialogResponseType, useMapDialog } from '../map-dialog.hooks'
import useMapRequestById from '../../../../hooks/use-map-requests-by-id'

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
  },
  sliderContainer: {
    display: 'flex',
    width: '85%',
    height: '50px',
    verticalAlign: '-moz-middle-with-baseline',

    alignItems: 'flex-end'
  },
  buttonsContainer: {
    width: '25%',

    alignItems: 'center',
    textAlign: 'end',
    display: 'flex',
    '& .MuiButtonBase-root': {
      display: 'inline-block',
      padding: 0,
      marginTop: '12px'
    }
  },
  slider: {
    width: '100%',
    display: 'inline-block',
    '& .MuiSlider-thumb': {
      backgroundColor: '#fff',
      width: '16px',
      height: '16px'
    },
    '& .MuiSlider-track': {
      border: 'none',
      height: '6px',
      borderRadius: '3px'
    },
    '& .MuiSlider-rail': {
      opacity: 0.5,
      backgroundColor: '#fff',
      height: '6px',
      borderRadius: '3px'
    },
    '& .MuiSlider-mark ': {
      color: '#fff',
      display: 'none'
    }
  },
  playerContainer: {
    paddingTop: '5px',
    width: '90%',
  },
  spanContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%'

  },

  oneDatapoint: {

    width: '100%',
    textAlign: 'center',
    color: theme.palette.text.disabled
  },

  separator: {

    backgroundColor: theme.palette.primary.contrastText,
    height: '1px'
  },
}))

export default function MapRequestsPanel(props) {
  const classes = useStyles()
  const { t } = useTranslation(['common', 'maps'])

  const [searchText, setSearchText] = React.useState('')
  const [mapRequestsData, getMapRequestsData, applyFilterByText] = useMapRequestList()

  const [height, setHeight] = React.useState(window.innerHeight)
  const [activeL, setActiveL] = useState<string[]>([])
  const [activeParent, setParent] = useState('')
  const [dateIndex, setDateIndex] = useState<number>(0)

  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }
  const { getMeta, getLegend } = props

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
  const sFilter: string[] = props.filters.content.filter(e => e.name === 'map_request_status')[0].selected
  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })
  const [deletionState, deleteMapRequest] = useDeleteMapRequest()
  const [fetchingStateById, getMapRequestById] = useMapRequestById()
  const DeleteRequest = (partnerName: string, id: string) => {
    let listTodelete: string[] = ([partnerName + '.' + id])
    deleteMapRequest(listTodelete)
  }

  const FetchRequest = (id: string) => {
    getMapRequestById(
      id,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      })
  }
const [ copyState, setCopystate ] = useState<any | null>(null)
  useEffect(() => {

    if (!!fetchingStateById.data.feature) {
      let fetchedArea = JSON.parse(fetchingStateById.data.feature.geometry)
   
      let ids: any [] = []
        if(fetchingStateById.data.feature.properties.mapRequestLayers.length>0){
          for(let i=0; i<fetchingStateById.data.feature.properties.mapRequestLayers.length; i++){
            ids.push(fetchingStateById.data.feature.properties.mapRequestLayers[i].layerDataTypeId)
          }
        }
        const defaultEditState = {
          title: "",
          coordinatorType: CoordinatorType.NONE,
          orgId: -1,
          teamId: -1,
          userId: -1,
          startDate: !!fetchingStateById.data.feature.properties.duration.lowerBound? new Date(fetchingStateById.data.feature.properties.duration.lowerBound) : new Date(),
          endDate: !!fetchingStateById.data.feature.properties.duration.upperBound? new Date(fetchingStateById.data.feature.properties.duration.upperBound): null,
          description: "",
          status: MissionStatusType.CREATED,
          frequency: !!fetchingStateById.data.feature.properties.frequency?fetchingStateById.data.feature.properties.frequency:"0",
          dataType: ids.length>0 ? ids : [],
          resolution: !!fetchingStateById.data.feature.properties.resolution?fetchingStateById.data.feature.properties.resolution:"10",
          restrictionType: CommunicationRestrictionType.NONE,
          scope: null
        }
        setCopystate(defaultEditState)
        let areaObject = {'type':'Feature','properties':{}, 'geometry':fetchedArea}
        showFeaturesDialog('create', 'MapRequest','', areaObject)
    }
  }, [fetchingStateById])

  const onFeatureDialogClose = useCallback(
    (status: DialogResponseType) => {
      console.debug('onFeatureDialogClose', status)
      // clearFeatureEdit()

      if (status === 'confirm') {
        console.log('onFeatureDialogClose [confirm]')
        props.fetchGeoJson(undefined)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const showFeaturesDialog = useMapDialog(onFeatureDialogClose, copyState)
  useEffect(() => {
    if (!!deletionState.data.deletedMapRequestCodes) {

      if (deletionState.data.deletedMapRequestCodes?.length > 0) {
        let elemToChange: string = deletionState.data.deletedMapRequestCodes[0].split('.')[1]
        var indexToChange: number = -1

        for (let i = 0; i < mapRequestsData.data.length; i++) {
          if (mapRequestsData.data[i].code == elemToChange) {

            indexToChange = i
          }
        }
        if (indexToChange >= 0) {
          mapRequestsData.data[indexToChange].status = MapRequestStatusType.CANCELED

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

        }
      }
    }
  }, [deletionState])


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
          <ItemCounter itemCount={mapRequestsData.data.filter(e => sFilter.includes(e.status)).length} />
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
              hasMore={mapRequestsData.data.length >= mapRequestsData.data.filter(e => sFilter.includes(e.status)).length ? false : true}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {mapRequestsData.data
                .filter(e => sFilter.includes(e.status))   //use the filters to visualize the maprequests in side panel without having to open and close it
                .map((elem, i) => {
                  return (<MapRequestCard
                    key={'map_request_card_' + i}
                    elem={elem}
                    setGoToCoord={props.setGoToCoord}
                    map={props.map}
                    setMapHoverState={props.setMapHoverState}
                    spiderLayerIds={props.spiderLayerIds}
                    spiderifierRef={props.spiderifierRef}
                    layerSelection={props.layerSelection}
                    setLayerSelection={props.setLayerSelection}
                    layerId2Tiles={props.layerId2Tiles}
                    activeParent={activeParent}
                    setParent={setParent}
                    activeL={activeL}
                    setActiveL={setActiveL}
                    setDateIndex={setDateIndex}
                    dateIndex={dateIndex}
                    getLegend={getLegend}
                    getMeta={getMeta}
                    DeleteRequest={DeleteRequest}
                    FetchRequestById={FetchRequest}
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

  const [playing, setPlaying] = useState(false)
  // time formatter with relative options
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)
  const classes = useStyles()

  const { elem, setGoToCoord, map, setMapHoverState, spiderLayerIds, spiderifierRef, layerSelection, setLayerSelection, setParent, activeParent, setActiveL, activeL, dateIndex, getMeta, getLegend, setDateIndex } = props

  const removeSource = (arr, element) => { let tmp = arr.filter(item => item !== element); return tmp }

  const handleRadioClick = (event: any) => {
    let selected = event.target.value.split("_")[1]
    let parent = event.target.value.split("_")[0]
    var tmp = ['']
    //if ((layerSelection.mapRequestCode === elem.code) && (selected === layerSelection.dataTypeId)) {
    if (!getcheckedState(event.target.value)) { //se mnon è checked 
      if (activeParent == parent) {
        tmp = [...activeL, event.target.value]
        // setActiveL([...activeL, event.target.value])
      }
      else {
        tmp = [event.target.value]
        //setActiveL([event.target.value])
        setParent(parent)
      }
      setLayerSelection({ isMapRequest: 1, mapRequestCode: elem.code, dataTypeId: selected, multipleLayersAllowed: true, layerClicked: event.target.value })
    } else { //se è checked
      tmp = removeSource(activeL, event.target.value)
      setLayerSelection({ isMapRequest: NO_LAYER_SELECTED, mapRequestCode: NO_LAYER_SELECTED, dataTypeId: NO_LAYER_SELECTED, multipleLayersAllowed: true, layerClicked: event.target.value })
    }
    setActiveL(tmp)
  }

  const getcheckedState = ((id: string) => {
    return (activeL.includes(id))
  })


  const handleOpacityChange = (event: any, newValue: number | number[], name: string) => {
    event.stopPropagation();
    const opacity: number = newValue as number
    //setOpacity(opacity)

    console.log('evval', event.target.value, opacity, name)

    props.map.setPaintProperty(
      //layerName,
      name,
      'raster-opacity',
      opacity / 100
    )
  }

  const skipNext = useCallback(async (dateIndex: number, timestampsLength: number, setDateIndex) => {
    if (dateIndex < timestampsLength - 1) {
      setDateIndex(dateIndex + 1)
    } else {
      setDateIndex(0)
    }
  }, [])

  async function playPause() {
    setPlaying(!playing)
  }

  function formatDate(date: string) {

    // return formatter.format(new Date(date as string))//.toLocaleString(dateFormat)
    return new Date(date as string).toLocaleDateString('it')
  }

  const getSingleLayer = (layerArray: any[], layerId: string) => {
    if (!!layerArray) {
      for (let i = 0; i < layerArray.length; i++) {
        if (layerArray[i].layerDataTypeId == layerId)
          return layerArray[i]
      }
    }

    return null
  }

  const singleAccordionElement = (lArr: any[], layerDataP: any) => {

    let tr: any[] = []
    for (let i = 0; i < lArr.length; i++) {
      let dataTypeId = lArr[i].layerDataTypeId
      let layerData = layerDataP[dataTypeId]
      if (!!layerData) {
        if (lArr[i].status == LayerImportStatusType.COMPLETED) {
          tr.push(
            <div style={{ marginTop: '5px', marginBottom: '5px' }} >
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <FormControlLabel style={{ flex: 2 }}
                  key={dataTypeId}
                  value={elem.code + "_" + dataTypeId}
                  control={<Checkbox
                    onClick={handleRadioClick}
                    checked={getcheckedState(elem.code + "_" + dataTypeId)}
                  />}
                  label={layerData['name']}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>

                  <IconButton
                    onClick={() => {
                      if (typeof (layerData.metadataId) == 'object')
                        getMeta(layerData.metadataId[dateIndex])
                      else if (typeof (layerData.metadataId) == 'string')
                        getMeta(layerData.metadataId)
                      else
                        console.log('no metadata procedure implemented for type', typeof (layerData.metadataId))
                    }}
                  >
                    <MetaIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      getLegend(layerData.names[dateIndex])
                    }}
                  >
                    <LegendIcon />
                  </IconButton>
                </div>
              </div>
              {

                <div>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography >
                      {t('labels:status')}:&nbsp;
                    </Typography>
                    <Typography >
                      {t('labels:' + getSingleLayer(elem.mapRequestLayers, dataTypeId).status.toLowerCase())}
                    </Typography>
                  </div>
                  <div className={classes.playerContainer}>
                    {
                      layerData.timestamps.length > 1 ? (
                        <span className={classes.spanContainer}>
                          <div className={classes.sliderContainer} style={{ marginTop: '10px', marginLeft: '5px' }}>
                            <Slider
                              className={classes.slider}
                              aria-label="Temperature"
                              defaultValue={0}

                              valueLabelDisplay="on"
                              step={1}
                              //value={dateIndex}
                              disabled={!getcheckedState(elem.code + "_" + dataTypeId)}
                              min={0}
                              max={layerData.timestamps.length - 1}
                              color="secondary"
                              onChange={(event, value) => {
                                setDateIndex(value)
                              }}
                            />
                          </div>
                          <div className={classes.buttonsContainer} style={{ paddingTop: '10px' }}>
                            <IconButton aria-label="play/pause" onClick={playPause}>
                              {playing ? (
                                <PauseIcon style={{ height: 45, width: 45 }} />
                              ) : (
                                <PlayArrowIcon style={{ height: 45, width: 45 }} />
                              )}
                            </IconButton>
                            <IconButton
                              aria-label="next"
                              onClick={() => skipNext(dateIndex, layerData.timestamps.length, setDateIndex)}
                            >
                              <SkipNextIcon />
                            </IconButton>
                          </div>
                        </span>
                      ) : (
                        <div>
                          <Typography >
                            {'Timestamp: ' + formatDate(layerData.timestamps[0])}
                          </Typography>
                        </div>
                      )
                    }
                  </div>
                  <div className={classes.sliderContainer} style={{ paddingTop: '5px', alignItems: 'flex-start' }} >
                    <label htmlFor="opacity-slider" style={{ marginRight: '10px' }}>
                      <Typography >
                        {t('maps:opacity')}:&nbsp;
                      </Typography >
                    </label>
                    <Slider
                      id={layerData.name}
                      defaultValue={100}
                      //valueLabelDisplay="on"
                      step={1}
                      //value={opacity}
                      min={0}
                      max={100}
                      aria-label={layerData.name}
                      color="secondary"
                      disabled={!getcheckedState(elem.code + "_" + dataTypeId)}
                      onChange={(event, value) => {
                        handleOpacityChange(event, value, layerData.names[dateIndex])
                      }}
                    //onChange={layerData.names[dateIndex]}
                    />
                  </div>
                </div>

              }
              <div className={classes.separator} />
            </div>
          )
        }
        else tr.push(
          <div>
            <Typography >
              {lArr[i].layerDataTypeId}
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Typography >
                {t('labels:status')}:&nbsp;
              </Typography>
              <Typography >
                {lArr[i].status}
              </Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {lArr[i].status == LayerImportStatusType.ERROR ?
                (
                  <div>
                    <Typography >
                      {t('common:Message')}:&nbsp;
                    </Typography>
                    <Typography >
                      {'' + lArr[i].errorMessage}
                    </Typography>
                  </div>) : null
              }
            </div>

            <div className={classes.separator} />
          </div>)
      }
    }
    return tr
  }


  // const duplicateDialog = () => {
  //   //RESUME FROM HERE
  //   showFeaturesDialog(
  //     'duplicate',
  //     'MapRequest',
  //     editingFeatureId ? editingFeatureId + '' : ''
  //   )
  // }
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
    >
      <CardContent key={elem.code}>
        <div className={classes.headerBlock} key={elem.code + '_sub'}>
          <div>
            <Box component="div" display="inline-block" key={elem.code + '_box'}>

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
          <div>
            <IconButton
              onClick={() => props.FetchRequestById(elem.id)}>
              <FileCopyIcon />
            </IconButton>
            {(elem.status != MapRequestStatusType.CANCELED) ? (
              <IconButton
                onClick={() => props.DeleteRequest('links', elem.code)}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </div>
        </div>
        <div className={classes.pos}>
          <div >
            <Typography
              component={'span'}
              variant="caption"
              color="textSecondary"
              style={{ textTransform: 'uppercase' }}
            >
              {t('labels:creator')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {elem.displayName}
            </Typography>
            <br />
          </div>
        </div>
        <div className={classes.pos}>
          <div >
            <Typography
              component={'span'}
              variant="caption"
              color="textSecondary"
              style={{ textTransform: 'uppercase' }}
            >
              {t('common:Frequency')}:&nbsp;

            </Typography>
            <Typography component={'span'} variant="body1">
              {elem.frequency}
            </Typography>
            <br />
          </div>
        </div>
        <div className={classes.pos}>
          <div >
            <Typography
              component={'span'}
              variant="caption"
              color="textSecondary"
              style={{ textTransform: 'uppercase' }}
            >
              {t('common:Resolution')}:&nbsp;

            </Typography>
            <Typography component={'span'} variant="body1">
              {elem.resolution}
            </Typography>
            <br />
          </div>
        </div>
        <div className={classes.pos}>
          {['layer', 'status'].map((type, index) => {
            if (elem[type]) {

              return (
                <>
                  <div key={'label_status_' + index}>
                    <Typography
                      component={'span'}
                      variant="caption"
                      color="textSecondary"
                      style={{ textTransform: 'uppercase' }}
                    >
                      {t('maps:' + type)}:&nbsp;
                    </Typography>
                    <Typography component={'span'} variant="body1">
                      {t('labels:' + elem[type].toLowerCase())}
                    </Typography>
                    <br />
                  </div>
                </>
              )
            }
            return null
          })}
        </div>
        <div className={classes.pos}>
          {(elem.status === MapRequestStatusType.CONTENT_AVAILABLE) && (elem.code in props.layerId2Tiles[1]) && (
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
                  <FormGroup
                    aria-label="gender"
                  >
                    { //Single element of layers accordion list
                      singleAccordionElement(elem.mapRequestLayers, props.layerId2Tiles[1][elem.code])
                    }

                  </FormGroup>
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