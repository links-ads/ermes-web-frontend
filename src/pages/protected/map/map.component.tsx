import React, { useState, useEffect, useReducer, useContext, useMemo } from 'react'
import { MapContainer } from './common.components'
import { MapLayout } from './map-layout.component'
import { CulturalProps } from './provisional-data/cultural.component'
import { MapStateContextProvider } from './map.contest'
import { FiltersDescriptorType } from '../../../common/floating-filters-tab/floating-filter.interface'
import FloatingFilterContainer from '../../../common/floating-filters-tab/floating-filter-container.component'
import GetApiGeoJson from '../../../hooks/get-apigeojson.hook'
import useActivitiesList from '../../../hooks/use-activities.hook'
import MapDrawer from './map-drawer/map-drawer.component'
import ViewCompactIcon from '@material-ui/icons/ViewCompact'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import useLanguage from '../../../hooks/use-language.hook'
import { Spiderifier } from '../../../utils/map-spiderifier.utils'
import { useMemoryState } from '../../../hooks/use-memory-state.hook'
import { initObjectState } from './map-filters-init.state'
import { AppConfig, AppConfigContext } from '../../../config'
import { LayersSelectContainer, NO_LAYER_SELECTED } from './map-layers/layers-select.component'
import useAPIHandler from '../../../hooks/use-api-handler'
import { useAPIConfiguration } from '../../../hooks/api-hooks'

import { LayersApiFactory } from 'ermes-backoffice-ts-sdk'
import { LayersPlayer } from './map-player/player.component'
import { useTranslation } from 'react-i18next'

type MapFeature = CulturalProps

export function Map() {
  // translate library
  // const { t } = useTranslation(['common', 'labels'])

  const [fakeKey, forceUpdate] = useReducer((x) => x + 1, 0)
  // toggle variable for te type filter tab
  const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState<boolean>(false)
  const [layersSelectVisibility, setLayersSelectVisibility] = useState<boolean>(false)
  const [togglePlayer, setTogglePlayer] = useState<boolean>(false)
  const [dateIndex, setDateIndex] = useState<number>(0)
  const { i18n } = useTranslation();
  const getFilterList = (obj) => {
    let newFilterList: Array<string> = []
    
    Object.keys((obj?.filters?.multicheckCategories as any).options).forEach((key) => {
      if ((obj?.filters?.multicheckCategories as any).options[key]) {
        newFilterList.push(key)
      }
    })
    Object.keys((obj?.filters?.multicheckPersons as any).options).forEach((key) => {
      if ((obj?.filters?.multicheckPersons as any).options[key]) {
        newFilterList.push(key)
      }
    })
  
    if (obj?.filters?.multicheckActivities) {
      Object.keys((obj?.filters?.multicheckActivities as any)?.options).forEach((key) => {
        if (obj?.filters?.multicheckActivities) {
          if ((obj?.filters?.multicheckActivities as any).options[key]) {
            newFilterList.push(key)
          }
        }
      })
    }
    return newFilterList
  }

  const initObject = JSON.parse(JSON.stringify(initObjectState))

  const appConfig = useContext<AppConfig>(AppConfigContext)
  initObject.filters.mapBounds.northEast = appConfig?.mapboxgl?.mapBounds?.northEast
  initObject.filters.mapBounds.southWest = appConfig?.mapboxgl?.mapBounds?.southWest
  initObject.filters.mapBounds.zoom = appConfig?.mapboxgl?.mapViewport?.zoom

  let [storedFilters, changeItem, , ] = useMemoryState(
    'memstate-map',
    JSON.stringify(JSON.parse(JSON.stringify(initObject))),
    false
  )

  const [filtersObj, setFiltersObj] = useState<FiltersDescriptorType | undefined>(
    JSON.parse(storedFilters!) as unknown as FiltersDescriptorType
  )

  // set list of wanted type of emergencies (for filter)
  const [filterList, setFilterList] = useState<String[]>(getFilterList(filtersObj))

  const applyFiltersObj = () => {
    const newFilterList = getFilterList(filtersObj)

    setFilterList(newFilterList)
    changeItem(JSON.stringify(filtersObj))
    setFiltersObj(JSON.parse(JSON.stringify(filtersObj)))
    if (!toggleSideDrawer) {
      setToggleActiveFilterTab(false)
    }

    // const startDate = (filtersObj?.filters?.datestart as any).selected ? new Date((filtersObj?.filters?.datestart as any).selected) : null
    // const endDate = (filtersObj?.filters?.dateend as any).selected ? new Date((filtersObj?.filters?.dateend as any).selected) : null
    forceUpdate()
  }

  // Toggle for the side drawer
  const [toggleSideDrawer, setToggleSideDrawer] = useState<boolean>(false)

  const [goToCoord, setGoToCoord] = useState<{ latitude: number; longitude: number } | undefined>(
    undefined
  )

  const [map, setMap] = useState(undefined)
  const [mapHoverState, setMapHoverState] = useState({ set: false })
  const [spiderLayerIds, setSpiderLayerIds] = useState<string[]>([])
  const [spiderifierRef, setSpiderifierRef] = useState<Spiderifier | null>(null)

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])

  const [selectedLayerId, setSelectedLayerId] = React.useState(NO_LAYER_SELECTED)
  const [getLayersState, handleGetLayersCall, ] = useAPIHandler(false)

  const layerId2Tiles = useMemo(() => {
    if (Object.keys(getLayersState.result).length === 0) return {}
    if (!getLayersState.result.data['layerGroups']) return {}
    let data2Tiles = {}

    getLayersState.result.data['layerGroups'].forEach((group) => {
      group['subGroups'].forEach((subGroup) => {
        subGroup['layers'].forEach((layer) => {
          let namestimesDict: { [key: string]: string } = {}

          layer['details'].forEach((detail) => {
            detail['timestamps'].forEach((timestamp) => {
              namestimesDict[timestamp] = detail['name']
            })
          })

          data2Tiles[layer['dataTypeId']] = {
            names: Object.values(namestimesDict),
            timestamps: Object.keys(namestimesDict),
            subGroup: layer['name']
          }
        })
      })
    })
    return data2Tiles
  }, [getLayersState])

  // console.log('getLayersState.result.data', getLayersState.result.data)
  const { data: activitiesList } = useActivitiesList()
  // Retrieve json data, and the function to make the call to filter by date
  const [prepGeoData, fetchGeoJson] = GetApiGeoJson()

  useEffect(() => {
    if (
      !filtersObj?.filters?.hasOwnProperty('multicheckActivities') &&
      filtersObj?.filters !== undefined &&
      filtersObj?.filters !== null &&
      activitiesList.length > 0
    ) {
      const activitiesObj = {}
      activitiesList.forEach((elem) => {
        activitiesObj[elem!.name!] = true
      })
      const newFilterObj = {
        ...filtersObj,
        filters: {
          ...filtersObj!.filters,
          multicheckActivities: {
            title: 'multicheck_activities',
            type: 'checkboxlist',
            options: activitiesObj,
            tab: 2
          }
        }
      } as unknown as FiltersDescriptorType
      setFiltersObj(newFilterObj)
      changeItem(JSON.stringify(newFilterObj))
    }
  }, [activitiesList, filtersObj,changeItem])

  useEffect(() => {
    // console.log('CHANGED FILTER OBJ', filtersObj)
    fetchGeoJson()
    handleGetLayersCall(() => {
      return layersApiFactory.layersGetLayers(
        undefined,
        undefined,
        filtersObj!.filters!.datestart['selected'],
        filtersObj!.filters!.dateend['selected'],
        undefined, //TODO: add MapRequestCode management
        {
          headers: {
            'Accept-Language': i18n.language
          }
        }
      )
    })
  }, [filtersObj,fetchGeoJson,handleGetLayersCall,layersApiFactory])

  useEffect(() => {
    if (selectedLayerId !== NO_LAYER_SELECTED) {
      setDateIndex(0)
      setTogglePlayer(true)
    } else {
      setTogglePlayer(false)
    }
  }, [selectedLayerId])

  return (
    <>
      <MapDrawer
        toggleSideDrawer={toggleSideDrawer}
        setGoToCoord={setGoToCoord}
        map={map}
        setMapHoverState={setMapHoverState}
        spiderLayerIds={spiderLayerIds}
        spiderifierRef={spiderifierRef}
        setToggleDrawerTab={setToggleSideDrawer}
        filtersObj={filtersObj}
        rerenderKey={fakeKey}
      />
      <MapContainer initialHeight={window.innerHeight - 112}>
        {/* Hidden filter tab */}
        {/* {toggleActiveFilterTab ? ( */}
        <FloatingFilterContainer
          setToggleActiveFilterTab={setToggleActiveFilterTab}
          toggleActiveFilterTab={toggleActiveFilterTab}
          filtersObj={filtersObj}
          applyFiltersObj={applyFiltersObj}
          // resetFiltersObj={resetFiltersObj}
          initObj={initObject}
        ></FloatingFilterContainer>
        {/* ) : null} */}

        <LayersPlayer
          visibility={togglePlayer}
          setVisibility={setTogglePlayer}
          layerId2Tiles={layerId2Tiles}
          selectedLayerId={selectedLayerId}
          setDateIndex={setDateIndex}
          dateIndex={dateIndex}
        />

        <LayersSelectContainer
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
          visibility={layersSelectVisibility}
          setVisibility={setLayersSelectVisibility}
          loading={getLayersState.loading}
          error={getLayersState.error}
          data={getLayersState.result.data}
        />
        <MapStateContextProvider<MapFeature>>
          <MapLayout
            toggleActiveFilterTab={toggleActiveFilterTab}
            setToggleActiveFilterTab={setToggleActiveFilterTab}
            layersSelectVisibility={layersSelectVisibility}
            setLayersSelectVisibility={setLayersSelectVisibility}
            togglePlayer={togglePlayer}
            setTogglePlayer={setTogglePlayer}
            toggleDrawerTab={toggleSideDrawer}
            setToggleDrawerTab={setToggleSideDrawer}
            filterList={filterList}
            prepGeoJson={prepGeoData.data}
            isGeoJsonPrepared={!prepGeoData.isLoading}
            setGoToCoord={setGoToCoord}
            goToCoord={goToCoord}
            setMap={setMap}
            mapHoverState={mapHoverState}
            spiderLayerIds={spiderLayerIds}
            setSpiderLayerIds={setSpiderLayerIds}
            setSpiderifierRef={setSpiderifierRef}
            filtersObj={filtersObj}
            setFiltersObj={setFiltersObj}
            changeItem={changeItem}
            forceUpdate={forceUpdate}
            fetchGeoJson={fetchGeoJson}
            selectedLayerId={selectedLayerId}
            layerId2Tiles={layerId2Tiles}
            dateIndex={dateIndex}
          />
        </MapStateContextProvider>
      </MapContainer>
    </>
  )
}
