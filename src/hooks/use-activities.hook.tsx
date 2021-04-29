import {
  ActivitiesApiAxiosParamCreator,
  GetActivitiesOutput,
  // ActivitiesApiFactory,
  ActivityDto
} from 'ermes-ts-sdk'

import { useSnackbars } from './use-snackbars.hook'
import { useState, useEffect } from 'react'
import { APIAxiosHookOpts, useAxiosWithParamCreator } from './api-hooks'
// , useAPIConfiguration
type ActApiPC = typeof ActivitiesApiAxiosParamCreator
type KRActApiPC = keyof ReturnType<ActApiPC>
const FULL_LIST = 'true'

export default function useActivitiesList() {
  // const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  // const teamAPIFactory = ActivitiesApiFactory(backendAPIConfig)
  const methodName: KRActApiPC = 'activitiesGetActivities'
  const opts: APIAxiosHookOpts<ActApiPC> = {
    type: 'backoffice',
    paramCreator: ActivitiesApiAxiosParamCreator,
    methodName,
    args: [FULL_LIST]
  }
  const [
    { data: result, loading: activitiesLoading, error: activError }
    // loadActivities
  ] = useAxiosWithParamCreator<ActApiPC, GetActivitiesOutput>(opts, false)
  const activities: ActivityDto[] = result?.activities || []
  const [data, setData] = useState<ActivityDto[]>(activities)

  const { displayErrorSnackbar } = useSnackbars()

  useEffect(() => {
    if (!activitiesLoading) {
      setData(
        activities.filter((e) => {
          if (e.parentId == null) {
            return true
          } else {
            return false
          }
        })
      )
    }
  }, [activitiesLoading, activities])

  useEffect(() => {
    if (activError) {
      displayErrorSnackbar(activError.response?.data.error)
    }
  }, [activError, displayErrorSnackbar])

  return { data }
}
