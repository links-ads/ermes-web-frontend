import { useCallback, useReducer, useMemo } from 'react';
// import {
//     DashboardApiFactory
// } from 'ermes-backoffice-ts-sdk';
// import {
//     useAPIConfiguration
// } from './api-hooks';

const initialState = { error:false, isLoading: true, data: {} }

const reducer = (currentState, action) => {
    switch (action.type) {
        case 'FETCH':
            return {
                isLoading: true,
                data: [],
                error:false
            }
        case 'RESULT':
            return {
                isLoading: false,
                data: action.data,
                error:false
            }
        case 'ERROR':
            return {
                isLoading: false,
                data: [],
                error:true
            }
    }
    return initialState
}

const useDashboardStats = () => {

    const [statsState, dispatch] = useReducer(reducer, initialState)
    // const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    // const socialApiFactory = useMemo(() => SocialApiFactory(backendAPIConfig), [backendAPIConfig])

    const fetchStatistics = useCallback((args) => {
        dispatch({ type: 'FETCH' })
        // DashboardApiFactory.dashboardGetAnnotations(pageNumber, page_size, args.informativeSelect, args.languageSelect, args.startDate,
        //     args.endDate, args.infoTypeSelect, args.hazardSelect, args.southWest,
        //     args.northEast).then(result => {
        //         let newData = transformData(result.data.items)
        //         newData = update ? [...annotationsState.data, ...newData || [] as any] : newData || [] as any
        //         sideEffect(newData)
        //         let hasMore = (result.data.total !== undefined) && (newData.length < result.data?.total)
        //         dispatch({ type: 'RESULT', value: newData, more: hasMore })
        //     }).catch(() => {
        //         dispatch({ type: 'ERROR', value: errorData })
        //     })
        setTimeout(()=>dispatch({type:'RESULT',data:mockupData}),1000)
    }, [])

    return {statsState, fetchStatistics}
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
        "status": "Completed",
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