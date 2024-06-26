import React from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { SizeAwareContainer } from '../../../common/size-aware-container.component'

import { useUser } from '../../../state/auth/auth.hooks'

import ImportComponent from './import.component'

export function ImportRoute({ location }: RouteChildrenProps) {
  const { profile } = useUser()
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
      <ImportComponent profile={profile} />
    </SizeAwareContainer>
  )
}

export default ImportRoute;