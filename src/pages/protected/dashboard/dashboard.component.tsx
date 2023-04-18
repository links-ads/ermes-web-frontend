import React from 'react'

import { SizeAwareContainer } from '../../../common/size-aware-container.component'
import { DashboardLayout } from './dashboard-layout.component'
import { IDashboardWidgetLayoutConfig } from './dashboard.config'

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
        height: 'calc(100% - 50px)',
        overflow: 'auto'
      }}
      initialHeight={window.innerHeight - 112}
    >
      <DashboardLayout {...props} />
    </SizeAwareContainer>
  )
}
