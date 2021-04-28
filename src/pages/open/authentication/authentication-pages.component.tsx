import React from 'react'
import { Route, Redirect, RouteChildrenProps } from 'react-router-dom'
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
        : profile?.defaultLandingPage
      )?.toString()
    : ''
  console.debug(
    'OpenPages LOC',
    location.pathname,
    isAuthenticated,
    match ? match.url : '',
    destination
  )
  return isAuthenticated ? (
    <Redirect to={destination} from={match ? match.url : undefined} />
  ) : (
    <Route path="/login">
      <AuthenticationCard />
    </Route>
  )
}
