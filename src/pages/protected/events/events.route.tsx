import { RouteChildrenProps } from 'react-router-dom'
import { SizeAwareContainer } from '../../../common/size-aware-container.component'

import { useUser } from '../../../state/auth/auth.hooks'

import EventsComponent from './events.component'

export function EventsRoute({ location }: RouteChildrenProps) {
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
      <EventsComponent profile={profile} />
    </SizeAwareContainer>
  )
}

export default EventsRoute;