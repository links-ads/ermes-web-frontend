import React, { createContext, useContext, useState } from 'react'
import { ContainerSizeContext, ContainerSize } from '../../../common/size-aware-container.component'
import { once } from '../../../utils/function.utils'
import { useMemoryState } from '../../../hooks/use-memory-state.hook'
import { initObjectState } from './map-filters-init.state'

export interface PointLocation {
  longitude: number
  latitude: number
}

// A single item with latitude and longitude
export type ItemWithLatLng<T extends object = object> = {
  item?: T
} & PointLocation

// A Cluster, which has some fixed attributes and some stats
export type Cluster<T extends object = object> = {
  cluster: boolean
  cluster_id: string
  point_count: number
} & { [k in keyof T]: number } & PointLocation

export type PointOnMap<T extends object = object> = ItemWithLatLng<T> | Cluster<T> | null

export type PointUpdater<T extends object = object> = (pt: PointOnMap<T>) => void

// browse (default) - browse the map
// select - feature selection, by clicking or drawing a box
// edit - create or update an existing feature, e.g. by drawing or editing the polygon
// filter - use selection as a filter
export type MapMode = 'browse' | 'select' | 'edit' | 'filter'
export type MapModeUpdater = (m: MapMode) => void

// Map Viewport parameters
export interface MapViewportState {
  width: number
  height: number
  latitude: number
  longitude: number
  zoom: number
}

export type ViewportStateUpdater = (v: MapViewportState) => void

export type FeatureSelectionUpdater<T extends object = object> = (
  features: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.Point, T>[]
) => void

export type ProvisionalFeatureType =
  | 'Report'
  | 'ReportRequest'
  | 'Mission'
  | 'Communication'
  | 'MapRequest'
  | 'Person'
  | 'Coordinates'
  | 'Alert'
  | 'Station'
export type ProvisionalOperationType = 'create' | 'update' | 'delete' | 'copy'
// The Map State
interface MapStateVariables<T extends object = object> {
  // Mapview stuff
  viewport: MapViewportState
  // Map mode
  mapMode: MapMode
  // Editing mode
  editingFeatureType: ProvisionalFeatureType | null
  // TODO add point?
  editingFeatureArea: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null
  editingFeatureId: string | number | null // if null, it's a new one
  // Point features
  clickedPoint: PointOnMap<T>
  hoveredPoint: PointOnMap<T>
  rightClickedPoint: PointOnMap<T>
  // Selection (e.g. by polygon)
  selectedFeatures: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.Point, T>[]
}

interface MapStateSelectors<T extends object = object> {
  // Mapview stuff
  setViewport: ViewportStateUpdater
  // Map mode
  setMapMode: MapModeUpdater
  // Editing mode
  setEditingFeature: (editingFeature: {
    type: ProvisionalFeatureType | null
    id: string | number | null
    area: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null
  }) => void
  // Point features
  setClickedPoint: PointUpdater<T>
  setHoveredPoint: PointUpdater<T>
  setRightClickedPoint: PointUpdater<T>
  // Selection (e.g. by polygon)
  setSelectedFeatures: FeatureSelectionUpdater<T>
}

export type MapState<T extends object = object> = MapStateVariables<T> & MapStateSelectors<T>

type MapStateContexType<T extends object = object> = React.Context<MapState<T>>

const createMapStateContext = once(() => createContext<MapState<object>>({} as MapState<object>))

// PROVIDER - define state variables
// Must be within a ContainerSize provider tree
export function MapStateContextProvider<T extends object = object>({
  children
}: {
  children: React.ReactNode
}) {
  const MapStateContext = createMapStateContext() as MapStateContexType<T>
  const containerSize = useContext<ContainerSize>(ContainerSizeContext)
  let [storedFilters] = useMemoryState(
    'memstate-map',
    JSON.stringify(JSON.parse(JSON.stringify(initObjectState))),
    false
  )
  const mapBounds = JSON.parse(storedFilters!).filters!.mapBounds
  const [viewport, setViewport] = useState<MapViewportState>({
    width: containerSize.width,
    height: containerSize.height,
    latitude: ((mapBounds.northEast[1] as number) + (mapBounds.southWest[1] as number)) / 2, //0, - TODO from user last known location
    longitude: ((mapBounds.northEast[0] as number) + (mapBounds.southWest[0] as number)) / 2, //0, - TODO from user last known location
    zoom: mapBounds.zoom as number
  })
  const [mapMode, setMapMode] = useState<MapMode>('browse')

  const [{ type, id, area }, setEditingFeature] = useState<{
    type: ProvisionalFeatureType | null
    id: string | number | null
    area: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null
  }>({
    type: null,
    id: null,
    area: null
  })

  const [clickedPoint, setClickedPoint] = useState<PointOnMap<T>>(null)
  const [hoveredPoint, setHoveredPoint] = useState<PointOnMap<T>>(null)
  const [rightClickedPoint, setRightClickedPoint] = useState<PointOnMap<T>>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<
    GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.Point, T>[]
  >([])

  const mapState: MapState<T> = {
    viewport,
    setViewport,
    // Map mode
    mapMode,
    setMapMode,
    // Editing mode
    editingFeatureType: type,
    editingFeatureId: id,
    editingFeatureArea: area,
    setEditingFeature,
    // Point features
    clickedPoint,
    setClickedPoint,
    hoveredPoint,
    setHoveredPoint,
    rightClickedPoint,
    setRightClickedPoint,
    // Selection (e.g. by polygon)
    selectedFeatures,
    setSelectedFeatures
  }

  return <MapStateContext.Provider value={mapState}>{children}</MapStateContext.Provider>
}

interface FeatureEditingSelectors {
  startFeatureEdit: (
    type: ProvisionalFeatureType,
    id: string | number | null,
    area?: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null
  ) => void
  clearFeatureEdit: () => void
}

// Consumer hook - defines business logic
export function useMapStateContext<T extends object = object>() {
  const mapStateCtx = useContext(createMapStateContext() as MapStateContexType<T>)

  const {
    viewport,
    setViewport,
    // Map mode
    mapMode,
    setMapMode,
    // Editing mode
    editingFeatureType,
    editingFeatureArea,
    editingFeatureId,
    setEditingFeature,
    // Point features
    clickedPoint,
    setClickedPoint,
    hoveredPoint,
    setHoveredPoint,
    rightClickedPoint,
    setRightClickedPoint,
    // Selection (e.g. by polygon)
    selectedFeatures,
    setSelectedFeatures
  } = mapStateCtx

  const variables: MapStateVariables<T> = {
    viewport,
    mapMode,
    editingFeatureType,
    editingFeatureArea,
    editingFeatureId,
    clickedPoint,
    hoveredPoint,
    rightClickedPoint,
    selectedFeatures
  }

  // id null = create
  function startFeatureEdit(
    type: ProvisionalFeatureType,
    id: string | number | null = null,
    area: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null = null
  ) {
    if (type !== 'Report') {
      setMapMode('edit')
    }
    setEditingFeature({ type, id, area })
  }

  // clear all
  function clearFeatureEdit() {
    setMapMode('browse')
    setEditingFeature({ type: null, id: null, area: null })
  }

  const selectors: MapStateSelectors<T> & FeatureEditingSelectors = {
    setViewport,
    setMapMode,
    setEditingFeature,
    setClickedPoint,
    setHoveredPoint,
    setRightClickedPoint,
    setSelectedFeatures,
    // non-raw methods
    startFeatureEdit,
    clearFeatureEdit
  }

  const context: [MapStateVariables<T>, MapStateSelectors<T> & FeatureEditingSelectors] = [
    variables,
    selectors
  ]
  return context
}
