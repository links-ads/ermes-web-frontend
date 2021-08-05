import React, { useState, useEffect } from 'react'
import { MapContainer } from './common.components'
import { MapLayout } from './map-layout.component'
import { CulturalProps } from './provisional-data/cultural.component'
import { MapStateContextProvider } from './map.contest'
import { useTranslation } from 'react-i18next'
import { FiltersDescriptorType } from '../../../common/floating-filters-tab/floating-filter.interface'
import FloatingFilterContainer from '../../../common/floating-filters-tab/floating-filter-container.component'
import { GetApiGeoJson } from '../../../hooks/get-apigeojson.hook'
import useActivitiesList from '../../../hooks/use-activities.hook'
import MapDrawer from './map-drawer/map-drawer.component'
import { Spiderifier } from '../../../utils/map-spiderifier.utils'
import { useMemoryState } from '../../../hooks/use-memory-state.hook'
import { initObjectState } from './map-filters-init.state'

type MapFeature = CulturalProps

export function Map() {
  // Retrieve json data, and the function to make the call to filter by date
  const { prepGeoData, isGeoJsonPrepared, filterByDate } = GetApiGeoJson()
  // translate library
  const { t } = useTranslation(['common'])

  // //states which will keep track of the start and end dates
  // const [selectedStartDate, setStartDate] = useState<Date | null | undefined>(null)
  // const [selectedEndDate, setEndDate] = useState<Date | null | undefined>(null)

  // toggle variable for te type filter tab
  const [toggleActiveFilterTab, setToggleActiveFilterTab] = useState<boolean>(false)

  // set list of wanted type of emergencies (for filter)
  const [filterList, setFilterList] = useState<String[]>([
    'ReportRequest',
    'Communication',
    'Mission',
    'Report'
  ])

  const [storedFilters, changeItem, removeStoredFilters] = useMemoryState(
    'memstate-map',
    JSON.stringify(initObjectState),
    false
  )

  const [filtersObj, setFiltersObj] = useState<FiltersDescriptorType | undefined>(
    JSON.parse(storedFilters!) as unknown as FiltersDescriptorType
  )

  const resetFiltersObj = () => {
    // let newFilterList: Array<string> = []
    // Object.keys((filtersObj?.filters?.multicheckCategories as any).options).map((key) => {
    //   if ((filtersObj?.filters?.multicheckCategories as any).options[key]) {
    //     newFilterList.push(key)
    //   }
    // })
    // Object.keys((filtersObj?.filters?.multicheckPersons as any).options).map((key) => {
    //   if ((filtersObj?.filters?.multicheckPersons as any).options[key]) {
    //     newFilterList.push(key)
    //   }
    // })
    // Object.keys((filtersObj?.filters?.multicheckActivities as any)?.options).map((key) => {
    //   if ((filtersObj?.filters?.multicheckActivities as any)?.options[key]) {
    //     newFilterList.push(key)
    //   }
    // })
    // setFilterList(newFilterList)
    // if (
    //   filtersObj?.filters !== undefined &&
    //   filtersObj?.filters !== null &&
    //   activitiesList.length > 0
    // ) {
    //   const activitiesObj = {}
    //   activitiesList.map((elem) => {
    //     activitiesObj[elem!.name!] = true
    //   })
    //   const newFilterObj = {
    //     ...initObjectState,
    //     filters: {
    //       ...initObjectState!.filters,
    //       multicheckActivities: {
    //         title: 'multicheck_activities',
    //         type: 'checkboxlist',
    //         options: activitiesObj,
    //         tab: 2
    //       }
    //     }
    //   } as unknown as FiltersDescriptorType

    //   changeItem(JSON.stringify(newFilterObj))
    //   setFiltersObj(newFilterObj)
    // } else {
      // changeItem(JSON.stringify(initObjectState))
      // setFiltersObj(initObjectState)
    // }
    changeItem(JSON.stringify(initObjectState))
    setFiltersObj(initObjectState)
  }
  const applyFiltersObj = () => {
    let newFilterList: Array<string> = []
    Object.keys((filtersObj?.filters?.multicheckCategories as any).options).map((key) => {
      if ((filtersObj?.filters?.multicheckCategories as any).options[key]) {
        newFilterList.push(key)
      }
    })
    Object.keys((filtersObj?.filters?.multicheckPersons as any).options).map((key) => {
      if ((filtersObj?.filters?.multicheckPersons as any).options[key]) {
        newFilterList.push(key)
      }
    })
    Object.keys((filtersObj?.filters?.multicheckActivities as any)?.options).map((key) => {
      if ((filtersObj?.filters?.multicheckActivities as any).options[key]) {
        newFilterList.push(key)
      }
    })
    setFilterList(newFilterList)
    changeItem(JSON.stringify(filtersObj))
    setToggleActiveFilterTab(false)
    const startDate = (filtersObj?.filters?.datestart as any).selected? new Date((filtersObj?.filters?.datestart as any).selected) : null
    const endDate = (filtersObj?.filters?.dateend as any).selected? new Date((filtersObj?.filters?.dateend as any).selected) : null
    filterByDate(startDate, endDate)
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
            tab: 2
          }
        }
      } as unknown as FiltersDescriptorType
      setFiltersObj(newFilterObj)
      changeItem(JSON.stringify(newFilterObj))
    }
  }, [activitiesList])
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
      />
      <MapContainer initialHeight={window.innerHeight - 112}>
        {/* Hidden filter tab */}
        {/* {toggleActiveFilterTab ? ( */}
        <FloatingFilterContainer
          toggleActiveFilterTab={toggleActiveFilterTab}
          filtersObj={filtersObj}
          applyFiltersObj={applyFiltersObj}
          resetFiltersObj={resetFiltersObj}
        ></FloatingFilterContainer>
        {/* ) : null} */}

        <MapStateContextProvider<MapFeature>>
          <MapLayout
            toggleActiveFilterTab={toggleActiveFilterTab}
            setToggleActiveFilterTab={setToggleActiveFilterTab}
            toggleDrawerTab={toggleSideDrawer}
            setToggleDrawerTab={setToggleSideDrawer}
            filterList={filterList}
            prepGeoJson={prepGeoData}
            isGeoJsonPrepared={isGeoJsonPrepared}
            setGoToCoord={setGoToCoord}
            goToCoord={goToCoord}
            setMap={setMap}
            mapHoverState={mapHoverState}
            spiderLayerIds={spiderLayerIds}
            setSpiderLayerIds={setSpiderLayerIds}
            setSpiderifierRef={setSpiderifierRef}
          />
        </MapStateContextProvider>
      </MapContainer>
    </>
  )
}
