import {
  CommunicationRestrictionType,
  CommunicationScopeType,
  MapRequestStatusType,
  MapRequestType
} from 'ermes-backoffice-ts-sdk'
import { FiltersDescriptorType } from '../../../common/floating-filters-tab/floating-filter.interface'
import { _MS_PER_DAY } from '../../../utils/utils.common'

export const initObjectState = {
  tabs: 2,
  xystart: [60, 60],
  filters: {
    datestart: {
      selected: new Date(new Date().valueOf() - _MS_PER_DAY * 3).toISOString(),
      type: 'date',
      tab: 1,
      clear: true
    },
    dateend: {
      selected: new Date(new Date().valueOf() + _MS_PER_DAY * 45).toISOString(),
      type: 'date',
      tab: 1,
      clear: true
    },
    mapBounds: {
      northEast: [88.35279541161259, 71.55729162065575],
      southWest: [-45.13191515177377, 23.84492207919945],
      zoom: 3.5
    },
    report: {
      title: 'report',
      type: 'accordion',
      tab: 1,
      content: [
        {
          name: 'hazard_select',
          options: [
            'None',
            'Avalanche',
            'Earthquake',
            'Fire',
            'Flood',
            'Landslide',
            'Storm',
            'Weather',
            'Subsidence'
          ],
          type: 'multipleselect',
          selected: []
        },
        {
          name: 'hazard_visibility',
          options: ['Private', 'Public', 'All'],
          type: 'select',
          selected: 'Private'
        },
        {
          name: 'hazard_content',
          options: ['Submitted', 'Inaccurate', 'Inappropriate', 'Validated'],
          type: 'multipleselect',
          selected: []
        }
      ]
    },
    mission: {
      title: 'mission',
      type: 'accordion',
      tab: 1,
      content: [
        {
          name: 'mission_status',
          options: ['Created', 'TakenInCharge', 'Completed', 'Deleted'],
          type: 'multipleselect',
          selected: []
        }
      ]
    },
    persons: {
      title: 'persons',
      type: 'accordion',
      tab: 1,
      content: [
        {
          name: 'persons_status',
          options: ['Off', 'Ready', 'Moving', 'Active'],
          type: 'multipleselect',
          selected: []
        },
        {
          name: 'team_list',
          options: [],
          type: 'multipleselect',
          selected: []
        }
      ]
    },
    mapRequests: {
      title: 'map_request',
      type: 'accordion',
      tab: 1,
      content: [
        {
          name: 'map_request_types',
          options: [
            MapRequestType.FIRE_AND_BURNED_AREA,
            MapRequestType.FLOODED_AREA,
            MapRequestType.POST_EVENT_MONITORING,
            MapRequestType.WILDFIRE_SIMULATION
          ],
          type: 'multipleselect',
          selected: [
            MapRequestType.FIRE_AND_BURNED_AREA,
            MapRequestType.FLOODED_AREA,
            MapRequestType.POST_EVENT_MONITORING,
            MapRequestType.WILDFIRE_SIMULATION
          ]
        },
        {
          name: 'map_request_status',
          options: [
            MapRequestStatusType.REQUEST_SUBMITTED,
            MapRequestStatusType.PROCESSING,
            MapRequestStatusType.CONTENT_AVAILABLE,
            MapRequestStatusType.CONTENT_NOT_AVAILABLE,
            MapRequestStatusType.CANCELED
          ],
          type: 'multipleselect',
          selected: [
            MapRequestStatusType.REQUEST_SUBMITTED,
            MapRequestStatusType.PROCESSING,
            MapRequestStatusType.CONTENT_AVAILABLE,
            MapRequestStatusType.CONTENT_NOT_AVAILABLE
          ]
        }
        // {
        //   name: 'map_request_layer',
        //   options: ['BurnedArea', 'Delineation', 'Forecast', 'Nowcast', 'RiskMap'],
        //   type: 'multipleselect',
        //   selected: []
        // },
        // {
        //   name: 'map_request_hazards',
        //   options: [
        //     'None',
        //     'Avalanche',
        //     'Earthquake',
        //     'Fire',
        //     'Flood',
        //     'Landslide',
        //     'Storm',
        //     'Weather',
        //     'Subsidence'
        //   ],
        //   type: 'multipleselect',
        //   selected: []
        // },
      ]
    },
    communication: {
      title: 'communication',
      type: 'accordion',
      tab: 1,
      content: [
        {
          name: 'scope',
          options: [CommunicationScopeType.PUBLIC, CommunicationScopeType.RESTRICTED],
          type: 'multipleselect',
          selected: []
        },
        {
          name: 'restriction',
          options: [
            CommunicationRestrictionType.CITIZEN,
            CommunicationRestrictionType.ORGANIZATION,
            CommunicationRestrictionType.PROFESSIONAL
          ],
          type: 'conditional_multipleselect',
          selected: []
        }
      ]
    },
    alert: {
      title: 'alert',
      type: 'accordion',
      tab: 1,
      content: [
        {
          name: 'restriction',
          options: [
            CommunicationRestrictionType.CITIZEN,
            CommunicationRestrictionType.PROFESSIONAL
          ],
          type: 'multipleselect',
          selected: []
        }
      ]
    },
    multicheckCategories: {
      title: 'multicheck_categories',
      type: 'checkboxlist',
      options: {
        ReportRequest: true,
        MapRequest: true,
        Communication: true,
        Mission: true,
        Report: true,
        Alert: true,
        Station: true
      },
      tab: 2
    },
    multicheckPersons: {
      title: 'multicheck_persons',
      type: 'checkboxlist',
      options: { Off: true, Ready: true, Moving: true, Active: true },
      tab: 2
    }
  }
} as FiltersDescriptorType
