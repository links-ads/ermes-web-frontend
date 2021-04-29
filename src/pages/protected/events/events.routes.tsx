import React from 'react'
import { RouteChildrenProps } from 'react-router-dom'

import { SizeAwareContainer } from '../../../common/size-aware-container.component'

import { useUser } from '../../../state/auth/auth.hooks'

import EventsComponent from './events.component'

export function EventsRoutes({ location }: RouteChildrenProps) {
  const { profile } = useUser()
  if (!profile || profile.role === 'first_responder' || profile.role === 'team_leader') {
    return null
  } else {
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
        <EventsComponent profile={profile}/>
      </SizeAwareContainer>
    )
  }
}

export default EventsRoutes;