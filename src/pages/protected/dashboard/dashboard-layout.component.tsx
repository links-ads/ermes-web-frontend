import { useTheme } from '@material-ui/core'
import React, { useCallback, useState, useEffect, useContext } from 'react'
import { Responsive as ResponsiveReactGridLayout } from 'react-grid-layout'
import { getBreakpointFromWidth } from 'react-grid-layout/build/responsiveUtils'
// import { AddWidgetComponent } from './add-widget.component'
import {
  // WidgetType,
  IDashboardWidgetLayoutConfig,
  // addDashboardWidget,
  removeDashboardWidget,
  computeLayoutsForDashboardWigetConfig,
  LayoutCols,
  EmptyLayouts,
  getInitialConfig
} from './dashboard.config'
import { Widget } from './widget.component'
import hash from 'object-hash'
import { DashboardProps } from './dashboard.component'
import {
  ContainerSizeContext,
  ContainerSize
} from '../../../common/size-aware-container.component'

import useDashboardStats from '../../../hooks/use-dashboard-statistics.hook'
// import {
//   ContainerSize,
//   ContainerSizeContext,
//   SizeAwareContainer
// } from '../../../common/size-aware-container.component'

export function DashboardLayout({
  className = 'dashboard',
  rowHeight = 150,
  initialConfig = getInitialConfig()
}: React.PropsWithChildren<DashboardProps>) {
  const { width } = useContext<ContainerSize>(ContainerSizeContext)

  const theme = useTheme()

  const { statsState, fetchStatistics } = useDashboardStats()

  const [dashboardWidgetsConfig, setDashboardWidgetsConfig] = useState<
    IDashboardWidgetLayoutConfig[]
  >(initialConfig)
  const [breakpoint, setBreakpoint] = useState<string>(
    getBreakpointFromWidth(theme.breakpoints.values, width)
  )
  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts>(EmptyLayouts) // todo load from context/redux/storage
  const [elements, setElements] = useState<JSX.Element[]>([])
  const dashboardWidgetsConfigHash = hash(dashboardWidgetsConfig, { algorithm: 'md5' })

  // const addWidget = useCallback(
  //   (type: WidgetType) => {
  //     setDashboardWidgetsConfig(addDashboardWidget({ type }, dashboardWidgetsConfig))
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [dashboardWidgetsConfigHash]
  // )

  useEffect(() => {
    fetchStatistics({})
  }, [])

  const removeWidget = useCallback(
    (wid: string) => {
      setDashboardWidgetsConfig(removeDashboardWidget(wid, dashboardWidgetsConfig))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardWidgetsConfigHash]
  )

  // function onLayoutChange(l: ReactGridLayout.Layout[], all: ReactGridLayout.Layouts) {
  //   console.debug('Save layout')
  // }

  const onDragWidgetStop = useCallback<ReactGridLayout.ItemCallback>(
    (newLayout, oldItem, newItem, placeholder) => {
      console.debug('onDragWidgetStop', newLayout, oldItem, newItem, placeholder)
      const nextLayouts = { ...layouts }
      if (breakpoint && nextLayouts[breakpoint]) {
        nextLayouts[breakpoint] = newLayout
      }
      // Object.keys(nextLayouts).forEach(key => {
      //   const values = nextLayouts[key]
      //   const index = values.findIndex(l => l.i === newItem.i)
      //   values.splice(index, 1, newItem)
      //   nextLayouts[key] = values
      // })
      setLayouts(nextLayouts)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardWidgetsConfigHash, breakpoint]
  )

  function onBreakpointChange(newb: string, newCols: number) {
    setBreakpoint(newb)
  }

  useEffect(
    () => {
      // widget configuration has been updated
      const nextLayouts = computeLayoutsForDashboardWigetConfig(layouts, dashboardWidgetsConfig)
      setLayouts(nextLayouts)
      setElements(
        dashboardWidgetsConfig.map((dwc) => {
          return (
            <div key={dwc.wid}>
              {
                <Widget
                  wid={dwc.wid}
                  removeWidget={removeWidget}
                  type={dwc.type}
                  title={dwc.title}
                  description={dwc.description}
                  data={statsState.data[dwc.data]}
                  isLoading={statsState.isLoading}
                  isError={statsState.isError}
                />
              }
            </div>
          )
        })
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardWidgetsConfigHash,statsState.data]
  )

  return (
    <>
      <ResponsiveReactGridLayout
        width={width}
        containerPadding={[16, 16]}
        className={className + ' layout'}
        layouts={layouts}
        rowHeight={rowHeight}
        cols={LayoutCols}
        compactType={null}
        onBreakpointChange={onBreakpointChange}
        // onLayoutChange={onLayoutChange}
        onDragStop={onDragWidgetStop}
        breakpoints={theme.breakpoints.values}
        useCSSTransforms={true}
        preventCollision={true}
        onWidthChange={(args) => console.debug('Grid layout width change', args)}
      >
        {elements}
      </ResponsiveReactGridLayout>
      {/* <AddWidgetComponent addWidget={addWidget} /> */}
    </>
  )
}
