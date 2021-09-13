import { FiltersDescriptorType } from '../../../common/floating-filters-tab/floating-filter.interface'

export const initObjectState = {
    tabs: 2,
    xystart: [60, 60],
    filters: {
      datestart: {
        selected: null,
        type: 'date',
        tab: 1,
        clear: true
      },
      dateend: {
        selected: null,
        type: 'date',
        tab: 1,
        clear: true
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
            ]
          },
          {
            name: 'status',
            options: ['Unknown', 'Notified', 'Managed', 'Closed'],
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
            name: 'status',
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
            name: 'status',
            options: ['Off', 'Ready', 'Moving', 'Active'],
            type: 'multipleselect',
            selected: []
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