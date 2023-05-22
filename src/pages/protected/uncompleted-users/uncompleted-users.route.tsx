import React from 'react'
import { SizeAwareContainer } from '../../../common/size-aware-container.component'

import { useUser } from '../../../state/auth/auth.hooks'

import UncompletedUsersComponent from './uncompleted-users.component'

export function UncompletedUsersRoute() {
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
      <UncompletedUsersComponent profile={profile} />
    </SizeAwareContainer>
  )
}

export default UncompletedUsersRoute
