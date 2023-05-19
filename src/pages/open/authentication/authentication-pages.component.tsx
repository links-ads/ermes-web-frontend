import React from 'react'
import { Route, Navigate, RouteChildrenProps } from 'react-router-dom'
import { useUser } from '../../../state/auth/auth.hooks'
import { AuthenticationCard } from './authentication-card.component'
import qs from 'qs'
export function AuthenticationPages({ match, location }: RouteChildrenProps) {
  const { profile, isAuthenticated } = useUser()
  const dest = qs.parse(location.search, {
    ignoreQueryPrefix: true
  })
  const destination = profile
    ? (dest.redirect_to && dest.redirect_to !== '/'
        ? dest.redirect_to
        : '/map'
      )?.toString()
    : ''
  console.debug(
    'OpenPages LOC',
    location.pathname,
    isAuthenticated,
    match ? match.url : '',
    destination
  )
  if(!isAuthenticated){
    localStorage.removeItem('memstate-map')
    localStorage.removeItem('memstate-social')
    localStorage.removeItem('memstate-event')
  }
  return isAuthenticated ? (
    <Navigate to={destination} from={match ? match.url : undefined} />
  ) : (
    <Route path="/login">
      <AuthenticationCard />
    </Route>
  )
}
