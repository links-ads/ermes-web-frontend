import { useCallback, useReducer, useMemo } from 'react';
import {
  DashboardApiFactory
} from 'ermes-backoffice-ts-sdk';
import {
  useAPIConfiguration
} from './api-hooks';

const initialState : {isError:boolean,isLoading:boolean,data:any} = { isError: false, isLoading: true, data: {} }

const reducer = (currentState, action:{type:string,data?:any}) => {
  switch (action.type) {
    case 'FETCH':
      return {
        isLoading: true,
        data: [],
        isError: false
      }
    case 'RESULT':
      return {
        isLoading: false,
        data: action.data,
        isError: false
      }
    case 'ERROR':
      return {
        isLoading: false,
        data: [],
        isError: true
      }
  }
  return initialState
}

const useDashboardStats = () => {

  const [statsState, dispatch] = useReducer(reducer, initialState)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const dashboardApiFactory = useMemo(() => DashboardApiFactory(backendAPIConfig), [backendAPIConfig])

  const fetchStatistics = useCallback((args) => {
    dispatch({ type: 'FETCH' })
    dashboardApiFactory.dashboardGetStatistics().then(result => {
            dispatch({ type: 'RESULT', data: result.data })
        }).catch(() => {
            dispatch({ type: 'ERROR', data: [] })
        })

    // setTimeout(() => {
    //   const newPersons = [] as any[]
    //   let dateOptions = { dateStyle: 'short', timeStyle: 'short', hour12: false } as Intl.DateTimeFormatOptions
    //   let formatter = new Intl.DateTimeFormat('en-GB', dateOptions)
    //   mockupData['persons'].forEach(person => {
    //       const newTimeStamp = formatter.format(new Date(person['timestamp']))
    //       const newActivity = person['status'] === 'Active' ? person['activityName'] : '-'
    //       newPersons.push({
    //         ...person,
    //         timestamp:newTimeStamp,
    //         activityName:newActivity
    //       })
    //   })
    //   dispatch({ type: 'RESULT', data: {
    //     ...mockupData,
    //     persons:newPersons
    //   } })
    // }, 1000)
  }, [])

  return { statsState, fetchStatistics }
}

const mockupData = {
  "reportsByHazard": [
    {
      "id": "wildfire",
      "label": "wildfire",
      "value": 10
    },
    {
      "id": "storm",
      "label": "storm",
      "value": 5
    },
    {
      "id": "pandemic",
      "label": "pandemic",
      "value": 3
    },
    {
      "id": "earthquake",
      "label": "earthquake",
      "value": 10
    }
  ],
  "missionsByStatus": [
    {
      "id": "created",
      "label": "created",
      "value": 10
    },
    {
      "id": "completed",
      "label": "completed",
      "value": 5
    },
    {
      "id": "TakenInCharge",
      "label": "TakenInCharge",
      "value": 10
    },
  ],
  "personsByStatus": [
    {
      "id": "active",
      "label": "active",
      "value": 2
    },
    {
      "id": "moving",
      "label": "moving",
      "value": 5
    },
    {
      "id": "off",
      "label": "off",
      "value": 8
    },
  ],
  "persons": [
    {
      "id": 0,
      "deviceId": "1",
      "deviceName": "watch",
      "location": {
        "latitude": 0,
        "longitude": 0
      },
      "latitude": 0,
      "longitude": 0,
      "timestamp": "2021-06-07T12:32:59.261Z",
      "extensionData": "string",
      "status": "Off",
      "organizationId": 0,
      "organizationName": "links",
      "activityId": 0,
      "activityName": "rescue",
      "username": "links.1",
      "type": "PersonActionSharingPosition"
    },
    {
      "id": 1,
      "deviceId": "1",
      "deviceName": "watch",
      "location": {
        "latitude": 0,
        "longitude": 0
      },
      "latitude": 0,
      "longitude": 0,
      "timestamp": "2021-06-03T12:32:59.261Z",
      "extensionData": "string",
      "status": "Active",
      "organizationId": 0,
      "organizationName": "links",
      "activityId": 1,
      "activityName": "prova",
      "username": "links.2",
      "type": "PersonActionSharingPosition"
    },
    {
      "id": 2,
      "deviceId": "1",
      "deviceName": "watch",
      "location": {
        "latitude": 0,
        "longitude": 0
      },
      "latitude": 0,
      "longitude": 0,
      "timestamp": "2021-06-02T12:32:59.261Z",
      "extensionData": "string",
      "status": "Active",
      "organizationId": 0,
      "organizationName": "links",
      "activityId": 5,
      "activityName": "Prova rescue",
      "username": "links.3",
      "type": "PersonActionSharingPosition"
    },
    {
      "id": 3,
      "deviceId": "1",
      "deviceName": "watch",
      "location": {
        "latitude": 0,
        "longitude": 0
      },
      "latitude": 0,
      "longitude": 0,
      "timestamp": "2021-05-31T12:32:59.261Z",
      "extensionData": "string",
      "status": "Moving",
      "organizationId": 0,
      "organizationName": "links",
      "activityId": 5,
      "activityName": "Wildfire",
      "username": "links.20",
      "type": "PersonActionSharingPosition"
    },
  ]
}

export default useDashboardStats;