// import { nanoid } from 'nanoid'
import { customAlphabet } from 'nanoid'
import { intInRange } from '../../../utils/number.utils'

// Due to padding or whatever, breakpoints are determined slightly differently wrt MUI
// even though MUI:xl = RGL:lg, MUI:lg = RGL:md,... with the follwing keys
// thus here XL is > Full HD

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHKLMNOPQRSTUVXYZ', 10)
// Setting custom alphabet to not getting symbols and digits (which can be a problem when the id is used in classes)

export const LayoutCols = { xs: 1, sm: 2, md: 2, lg: 4, xl: 4 }
export const LayoutDefaultHeights = { xs: 2, sm: 2, md: 2, lg: 2, xl: 3 }

export const MAX_W_SLOTS = 2 // determines how much a widget can expand in width
export const MAX_H_SLOTS = 3 // determines how much a widget can expand in height

export const EmptyLayouts: ReactGridLayout.Layouts = {
  xs: [],
  sm: [],
  md: [],
  lg: [],
  xl: []
} // Todo define real-names, e.g. user-states-charts, ...
export type WidgetType = 'empty' | 'test' | 'piechart' | 'barchart' | 'table' | 'line'
export type AppLayoutSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export interface IDashboardWidgetLayoutConfig {
  wid: string
  type: WidgetType
  title?: string
  data: string
  description?: string
}

const wtypes: WidgetType[] = ['empty', 'test', 'piechart', 'barchart']

/**
 * Generate a random config of empty widgets
 * @param max
 */
// export function getRandomInitialConfig(max: number = 3): IDashboardWidgetLayoutConfig[] {
//   return [...Array(max).keys()].map((n) => {
//     const type = wtypes[intInRange(wtypes.length - 1)]
//     let title: string
//     let description: string
//     switch (type) {
//       case 'piechart':
//         title = `Pie Chart ${n + 1}`
//         description = 'A pie chart'
//         break
//       case 'test':
//         title = `Test ${n + 1}`
//         description = 'A test widget'
//         break
//       case 'barchart':
//         title = `Bar Chart ${n + 1}`
//         description = 'A bar chart'
//       break
//       case 'empty':
//       default:
//         title = `Empty ${n + 1}`
//         description = 'An empty widget'
//         break
//     }
//     return {
//       wid: nanoid(),
//       type,
//       title,
//       description
//     }
//   })
// }

export function getInitialConfig(): IDashboardWidgetLayoutConfig[] {
  return [{
    wid: nanoid(),
    type: 'piechart',
    title: 'reportsByHazard',
    data: 'reportsByHazard',
    description: ''
  },
  {
    wid: nanoid(),
    type: 'piechart',
    title: 'missionsByStatus',
    data: 'missionsByStatus',
    description: ''
  },
  {
    wid: nanoid(),
    type: 'piechart',
    title: 'personsByStatus',
    data: 'personsByStatus',
    description: ''
  },
  {
    wid: nanoid(),
    type: 'table',
    title: 'persons',
    data: 'persons',
    description: ''
  },
  {
    wid: nanoid(),
    type: 'line',
    title: 'activationsByDay',
    data: 'activationsByDay',
    description: ''
  }
  ]
}

/**
 * Add a widget to the config
 * @param config
 * @param widgets
 */
// export function addDashboardWidget(
//   config: Partial<IDashboardWidgetLayoutConfig>,
//   widgets: IDashboardWidgetLayoutConfig[]
// ): IDashboardWidgetLayoutConfig[] {
//   const nextConfig: IDashboardWidgetLayoutConfig = {
//     wid: nanoid(),
//     type: 'empty',
//     title: `Empty ${widgets.length + 1}`,
//     description: 'An empty widget',
//     // default will be empty if config not provided
//     ...config
//   }
//   return [...widgets, nextConfig]
// }

/**
 * Remove a widget from the config
 * @param key
 * @param widgets
 */
export function removeDashboardWidget(
  wid: string,
  widgets: IDashboardWidgetLayoutConfig[]
): IDashboardWidgetLayoutConfig[] {
  const index = widgets.findIndex((w) => w.wid === wid)
  if (index > -1) {
    let nextConfig = [...widgets]
    nextConfig.splice(index, 1)
    return nextConfig
  } else {
    return widgets
  }
}

function computeLayoutIdAndPreviousLayoutSize(
  id: string,
  cols: number,
  h: number = 1,
  // lastLayoutItem: ReactGridLayout.Layout | null,
  lastLayoutSize: number
): ReactGridLayout.Layout {
  const y_pos = Math.floor(lastLayoutSize / cols) //WARN works with w = 1
  const x_pos = lastLayoutSize % cols
  return {
    i: id,
    x: x_pos,
    y: y_pos,
    // TODO get size and constraints from cfg, but taking into account above
    // size
    w: 1,
    h,
    // constraints
    minH: 1,
    minW: 1,
    // maxW: Math.max(Math.floor(cols / MAX_W_SLOTS), 1),
    maxW: cols,
    maxH: MAX_H_SLOTS
  }
}

function computeLayoutByItemIds(
  oldLayout: ReactGridLayout.Layout[],
  configs: IDashboardWidgetLayoutConfig[],
  bpKey: AppLayoutSize
): ReactGridLayout.Layout[] {
  const configsSize = configs.length
  const oldLayoutSize = oldLayout.length
  const sizeDiff = configsSize - oldLayoutSize
  const cols = LayoutCols[bpKey]
  const defaultHeight = LayoutDefaultHeights[bpKey]
  let layout: ReactGridLayout.Layout[] = [...oldLayout]
  let existingWids: string[] = []
  if (sizeDiff > 0) {
    // added item
    existingWids = oldLayout.map((l) => l.i)
    const newLayoutItems = configs
      .filter((cfg) => !existingWids.includes(cfg.wid))
      .map((cfg, i) =>
        computeLayoutIdAndPreviousLayoutSize(cfg.wid, cols, defaultHeight, oldLayoutSize + i)
      )
    layout = [...layout, ...newLayoutItems]
  } else if (sizeDiff < 0) {
    //removed item
    existingWids = configs.map((l) => l.wid)
    layout = layout.filter((l) => existingWids.includes(l.i))
  }
  // else moved item

  return layout
}

export function computeLayoutsByCfg(
  oldLayouts: ReactGridLayout.Layouts,
  configs: IDashboardWidgetLayoutConfig[]
): ReactGridLayout.Layouts {
  const layouts: ReactGridLayout.Layouts = {
    xs: computeLayoutByItemIds(oldLayouts['xs'], configs, 'xs'),
    sm: computeLayoutByItemIds(oldLayouts['sm'], configs, 'sm'),
    md: computeLayoutByItemIds(oldLayouts['md'], configs, 'md'),
    lg: computeLayoutByItemIds(oldLayouts['lg'], configs, 'lg'),
    xl: computeLayoutByItemIds(oldLayouts['xl'], configs, 'xl')
  }
  return layouts
}

/**
 * Compute layouts given the current config and layouts
 * @param currentLayouts
 * @param configs
 */
export function computeLayoutsForDashboardWigetConfig(
  currentLayouts: ReactGridLayout.Layouts,
  configs: IDashboardWidgetLayoutConfig[]
): ReactGridLayout.Layouts {
  const items = configs.length
  if (items > 0) {
    const newLayouts = computeLayoutsByCfg(currentLayouts, configs)
    console.debug('New Layouts', newLayouts)
    return newLayouts
  } else {
    return EmptyLayouts
  }
}
