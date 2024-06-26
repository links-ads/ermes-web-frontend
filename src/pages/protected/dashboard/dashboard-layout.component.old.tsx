import { CircularProgress, useTheme } from '@material-ui/core'
import React, { useCallback, useState, useEffect, useContext, useMemo } from 'react'
import { Responsive as ResponsiveReactGridLayout } from 'react-grid-layout'
import { getBreakpointFromWidth } from 'react-grid-layout/build/responsiveUtils'
// import { AddWidgetComponent } from './add-widget.component'
import {
  // WidgetType,
  IDashboardWidgetLayoutConfig,
  // addDashboardWidget,
  // removeDashboardWidget,
  computeLayoutsForDashboardWigetConfig,
  LayoutCols,
  EmptyLayouts,
  getInitialConfig
} from './dashboard.config'
import { Widget } from './widget.component'
import hash from 'object-hash'
import { DashboardProps } from './dashboard.component'
import { ContainerSizeContext, ContainerSize } from '../../../common/size-aware-container.component'

import useDashboardStats from '../../../hooks/use-dashboard-statistics.hook'
import { _MS_PER_DAY } from '../../../utils/utils.common'
import { FiltersContext } from '../../../state/filters.context'

export function DashboardLayout({
  className = 'dashboard',
  rowHeight = 150,
  initialConfig = getInitialConfig()
}: React.PropsWithChildren<DashboardProps>) {
  const { width } = useContext<ContainerSize>(ContainerSizeContext)

  const theme = useTheme()

  const { statsState, fetchStatistics } = useDashboardStats()

  // const [dashboardWidgetsConfig, setDashboardWidgetsConfig] = useState<
  //   IDashboardWidgetLayoutConfig[]
  // >(initialConfig)
  const [dashboardWidgetsConfig] = useState<IDashboardWidgetLayoutConfig[]>(initialConfig)
  const [breakpoint, setBreakpoint] = useState<string>(
    getBreakpointFromWidth(theme.breakpoints.values, width)
  )
  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts>(EmptyLayouts) // TODO load from context/redux/storage
  const [elements, setElements] = useState<JSX.Element[]>([])
  const dashboardWidgetsConfigHash = useMemo(
    () => hash(dashboardWidgetsConfig, { algorithm: 'md5' }),
    [dashboardWidgetsConfig]
  )

  const filtersCtx = useContext(FiltersContext)

  const { filters: filters } = filtersCtx

  // const addWidget = useCallback(
  //   (type: WidgetType) => {
  //     setDashboardWidgetsConfig(addDashboardWidget({ type }, dashboardWidgetsConfig))
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [dashboardWidgetsConfigHash]
  // )

  useEffect(() => {
    fetchStatistics({
      startDate: filters.datestart,
      endDate: filters.dateend
    })
  }, [filters, fetchStatistics])

  // const removeWidget = useCallback(
  //   (wid: string) => {
  //     setDashboardWidgetsConfig(removeDashboardWidget(wid, dashboardWidgetsConfig))
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [dashboardWidgetsConfigHash]
  // )

  // function onLayoutChange(l: ReactGridLayout.Layout[], all: ReactGridLayout.Layouts) {
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
                  // removeWidget={removeWidget}
                  removeWidget={(wid) => {}}
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
    [dashboardWidgetsConfigHash, statsState.data]
  )

  const loader = (
    <div className="full-screen centered">
      <CircularProgress color="secondary" size={120} />
    </div>
  )

  return (
    <>
      {statsState.isLoading ? (
        loader
      ) : (
        <ResponsiveReactGridLayout
          width={width}
          containerPadding={[16, 16]}
          className={className + ' layout'}
          layouts={layouts}
          rowHeight={rowHeight}
          cols={LayoutCols}
          compactType={'vertical'}
          onBreakpointChange={onBreakpointChange}
          // onLayoutChange={onLayoutChange}
          onDragStop={onDragWidgetStop}
          breakpoints={theme.breakpoints.values}
          useCSSTransforms={true}
          preventCollision={false}
          resizeHandles={['se', 'sw', 'ne', 'nw']}
          // onWidthChange={(args) => console.debug('Grid layout width change', args)}
        >
          {elements}
        </ResponsiveReactGridLayout>
      )}
      {/* <AddWidgetComponent addWidget={addWidget} /> */}
    </>
  )
}
