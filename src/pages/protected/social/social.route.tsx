import React from 'react'
import { SizeAwareContainer } from '../../../common/size-aware-container.component'
import { useUser } from '../../../state/auth/auth.hooks'
import SocialComponent from './social.component'

export function SocialRoute() {
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
      <SocialComponent profile={profile} />
    </SizeAwareContainer>
  )
}


export default SocialRoute;