import React from 'react'

import { SizeAwareContainer } from '../../../common/size-aware-container.component'
import { DashboardLayout } from './dashboard/dashboard-layout.component'
import { IDashboardWidgetLayoutConfig } from './dashboard/dashboard.config'

export interface DashboardProps {
  className?: string
  rowHeight?: number
  initialConfig?: IDashboardWidgetLayoutConfig[]
}

export function Dashboard(props: DashboardProps) {
  return (
    <SizeAwareContainer
      className="dashboard-container"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto'
      }}
      initialHeight={window.innerHeight - 112}
    >
      <DashboardLayout {...props} />
    </SizeAwareContainer>
  )
}
