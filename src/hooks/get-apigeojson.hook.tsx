import {
  GeoJsonApiAxiosParamCreator,
  GetGeoJsonCollectionOutput,
  GeoJsonApiFactory
} from 'ermes-backoffice-ts-sdk'
import { useAxiosWithParamCreator, APIAxiosHookOpts, useAPIConfiguration } from './api-hooks'
import { useSnackbars } from './use-snackbars.hook'
import { useState, useEffect } from 'react'

// Get the correct type of the call as a name
type GeoJsonApiPC = typeof GeoJsonApiAxiosParamCreator
type KRGeoJsonApiPC = keyof ReturnType<GeoJsonApiPC>

export function GetApiGeoJson() {
  const { displayErrorSnackbar } = useSnackbars() // Display error on page

  const methodName: KRGeoJsonApiPC = 'geoJsonGetFeatureCollection' // Method name

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const geoJsonAPIFactory = GeoJsonApiFactory(backendAPIConfig) 
  const [isGeoJsonPrepared, setIsGeoJsonPrepared] = useState(false) // boolean to define if data is ready
  const [prepGeoData, setPrepGeoData] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  }) // empty object
  const opts: APIAxiosHookOpts<GeoJsonApiPC> = {
    type: 'backoffice',
    paramCreator: GeoJsonApiAxiosParamCreator,
    methodName
  }

  const [
    { data: result, loading: geojsonLoading, error: geojsonError },
  ] = useAxiosWithParamCreator<GeoJsonApiPC, GetGeoJsonCollectionOutput>(opts, false) // Retrieve of the first data

  // If some errors in the request, show them
  useEffect(() => {
    if (geojsonError) {
      displayErrorSnackbar(geojsonError.response?.data.error)
    }
  }, [geojsonError, displayErrorSnackbar])

  // Prepare the recieved data into a state ready to be used
  useEffect(() => {
    if (!geojsonLoading) {
      setIsGeoJsonPrepared(false)
      setPrepGeoData({
        type: 'FeatureCollection',
        features: (result?.features || []).map((e, i) => {
          return (e as unknown) as GeoJSON.Feature
        })
      })
      setIsGeoJsonPrepared(true)
    }
  }, [geojsonLoading, result]) 

  // Function to filter (by an API call) 
  const filterByDate = async function (start: Date | null, end: Date | null) {
    setIsGeoJsonPrepared(false)
    await geoJsonAPIFactory
      .geoJsonGetFeatureCollection(start?.toISOString(), end?.toISOString())
      .then((res) => {
        setPrepGeoData({
          type: 'FeatureCollection',
          features: (res.data?.features || []).map((e, i) => {
            return (e as unknown) as GeoJSON.Feature
          })
        })
        setIsGeoJsonPrepared(true)
      }).catch((err) => {
        displayErrorSnackbar(err)
      })
  }
  return { prepGeoData, isGeoJsonPrepared, filterByDate }
}
