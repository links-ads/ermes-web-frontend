import { updateMarkers } from '../../decision-making/map/api-data/emergency.layers';

type HazardType =
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '21'

type HazardColorMapType = {
    [k in HazardType]: string
}

export const HazardColorMap: HazardColorMapType = {
    10: '#4d4e52',//storm
    11: '#f51707',//wildfire
    12: '#0b3ebd',//flood
    13: '#360404',//eartquake
    14: '#a12c0b',//landslide
    15: '#abc8d4',//avalanche
    16: '#0cc725',//subsidence
    17: '#cfe609',//collapse
    18: '#e68e09',//pandemic
    19: '#0d0101',//terrorism
    20: '#e6093d',//accident
    21: '#5fdaed',//temp anomaly
}

const hazardCategories: HazardType[] = Object.keys(HazardColorMap) as HazardType[]

type CounterType = {
    [k in HazardType]?: mapboxgl.Expression
  }

export const hazardClusterProperties = hazardCategories.reduce<CounterType>(
    (allCategories, nextCategory) => {
      allCategories[nextCategory] = ['+', ['case', ['==', ['get', 'hazard'], nextCategory], 1, 0]] // if match case, 1 else 0, sum
      return allCategories
    },
    {}
  )

export const updateHazardMarkers = (sourceName,clusterRef,map) => {
  return updateMarkers<HazardType>(sourceName, hazardCategories, Object.values(HazardColorMap), clusterRef, map)
}