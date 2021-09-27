import React, { useState, useEffect, useReducer, useContext } from 'react'
import { useTranslation } from 'react-i18next'
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
import { AppConfig, AppConfigContext, loadConfig } from '../../../config'

type MapFeature = CulturalProps

export function Map() {
  // translate library
  // const { t } = useTranslation(['common', 'labels'])

  const [fakeKey, forceUpdate] = useReducer(x => x + 1, 0)
  // toggle variable for te type filter tab
  const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState<boolean>(false)


  const getFilterList = (obj) => {
    let newFilterList: Array<string> = []
    Object.keys((obj?.filters?.multicheckCategories as any).options).map((key) => {
      if ((obj?.filters?.multicheckCategories as any).options[key]) {
        newFilterList.push(key)
      }
    })
    Object.keys((obj?.filters?.multicheckPersons as any).options).map((key) => {
      if ((obj?.filters?.multicheckPersons as any).options[key]) {
        newFilterList.push(key)
      }
    })
    if (obj?.filters?.multicheckActivities) {
      Object.keys((obj?.filters?.multicheckActivities as any)?.options).map((key) => {
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

  let [storedFilters, changeItem, removeStoredFilters, getStoredItems] = useMemoryState(
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
      activitiesList.map((elem) => {
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
            tab: 2,

          }
        }
      } as unknown as FiltersDescriptorType
      setFiltersObj(newFilterObj)
      changeItem(JSON.stringify(newFilterObj))
    }
  }, [activitiesList, filtersObj])

  useEffect(() => {
    // console.log('CHANGED FILTER OBJ', filtersObj)
    fetchGeoJson()
  }, [filtersObj])
  useEffect(() => {
    console.log('GEO DATA!!', prepGeoData)
  }, [prepGeoData])
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

        <MapStateContextProvider<MapFeature>>
          <MapLayout
            toggleActiveFilterTab={toggleActiveFilterTab}
            setToggleActiveFilterTab={setToggleActiveFilterTab}
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
          />
        </MapStateContextProvider>
      </MapContainer>
    </>
  )
}
