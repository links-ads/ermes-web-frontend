export type AvailableTabs = 1 | 2
export type FilterType = 'date' | 'accordion' | 'select' | 'multipleselect'

export interface FiltersDescriptorType {
  tabs: AvailableTabs
  xystart: [number, number]
  width?: string | number
  height?: string | number
  filters: {
    datestart?: {
      selected: string | null
      type: FilterType
      tab: AvailableTabs
    }
    dateend?: {
      selected: string | null
      type: FilterType
      tab: AvailableTabs
    }
    report?: {
      title: string
      type: FilterType
      content: Array<Select | MultipleSelect>
      tab: AvailableTabs
    }
    mission?: {
      title: string
      type: FilterType
      content: Array<Select>
      tab: AvailableTabs
    }
    persons?: {
      title: string
      type: FilterType
      content: Array<Select | MultipleSelect>
      tab: AvailableTabs
    },
    somethingelse?: MultipleSelect,
    somethingmore?: Select
  }
}

interface MultipleSelect {
  name: string
  options: Array<string>
  type: FilterType
  selected: Array<string>
}

interface Select {
  name: string
  options: Array<string>
  type: FilterType
  selected: string | undefined | null
}
