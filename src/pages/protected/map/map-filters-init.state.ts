import { FiltersDescriptorType } from '../../../common/floating-filters-tab/floating-filter.interface'

export const initObjectState = {
    tabs: 2,
    xystart: [60, 60],
    filters: {
      datestart: {
        selected: null,
        type: 'date',
        tab: 1
      },
      dateend: {
        selected: null,
        type: 'date',
        tab: 1
      },
      report: {
        title: 'report',
        type: 'accordion',
        tab: 1,
        content: [
          {
            name: 'hazard_select',
            options: [
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
            selected: [
              'Avalanche',
              'Earthquake',
              'Fire',
              'Flood',
              'Landslide',
              'Storm',
              'Weather',
              'Subsidence'
            ]
          },
          {
            name: 'status',
            options: ['Unknown', 'Notified', 'Managed', 'Closed'],
            type: 'multipleselect',
            selected: ['Unknown', 'Notified', 'Managed', 'Closed']
          }
        ]
      },
      mission: {
        title: 'mission',
        type: 'accordion',
        tab: 1,
        content: [
          {
            name: 'status',
            options: ['Created', 'TakenInCharge', 'Completed', 'Deleted'],
            type: 'multipleselect',
            selected: ['Created', 'TakenInCharge', 'Completed', 'Deleted']
          }
        ]
      },
      persons: {
        title: 'persons',
        type: 'accordion',
        tab: 1,
        content: [
          {
            name: 'status',
            options: ['Off', 'Ready', 'Moving', 'Active'],
            type: 'multipleselect',
            selected: ['Off', 'Ready', 'Moving', 'Active']
          }
        ]
      },
      multicheckCategories: {
        title: 'multicheck_categories',
        type: 'checkboxlist',
        options: { ReportRequest: true, Communication: true, Mission: true, Report: true },
        tab: 2
      },
      multicheckPersons: {
        title: 'multicheck_persons',
        type: 'checkboxlist',
        options: { Off: true, Moving: true, Active: true },
        tab: 2
      }
    }
  } as FiltersDescriptorType