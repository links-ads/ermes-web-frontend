export type AvailableTabs = 1 | 2
export type FilterType = 'date' | 'accordion' | 'select' | 'multipleselect' | 'checkboxlist'
export type StatusTypes = 'Off' | 'Moving' | 'Active'
export interface FiltersDescriptorType {
  tabs: AvailableTabs
  xystart: [number, number]
  width?: string | number
  height?: string | number

  // Specifies movement boundaries. Accepted values:
  // - `parent` restricts movement within the node's offsetParent
  //    (nearest node with position relative or absolute), or
  // - a selector, restricts movement within the targeted node
  // - An object with `left, top, right, and bottom` properties.
  //   These indicate how far in each direction the draggable
  //   can be moved.
  bounds?: {
    left?: number
    top?: number
    right?: number
    bottom?: number
  } | string

  filters:
  | {
    [key: string]: MultipleSelect | Select | DateSelector | Accordion | CheckboxList | MapBounds
  }
  | null
  | undefined
}

interface MapBounds {
  northEast: [number, number]
  southWest: [number, number]
  zoom: number
}

interface MultipleSelect {
  name: string
  options: Array<string | null>
  type: FilterType
  selected: Array<string>
}

interface Select {
  name: string
  options: Array<string | null>
  type: FilterType
  selected: string | undefined | null
}

interface DateSelector {
  selected: string | null | undefined
  type: FilterType
  tab: AvailableTabs
  clear?: boolean
}

export interface Accordion {
  title: string
  type: FilterType
  content: Array<Select | MultipleSelect>
  tab: AvailableTabs
}

interface CheckboxList {
  title: string
  type: FilterType
  options: { [key: string]: boolean }
  tab: AvailableTabs
}
