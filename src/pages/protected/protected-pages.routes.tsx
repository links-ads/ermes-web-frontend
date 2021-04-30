import React, { Suspense } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import qs from 'querystring'
import { Switch, Route, Redirect, RouteChildrenProps } from 'react-router-dom'
import { useUser } from '../../state/auth/auth.hooks'
import { NotFoundPage } from '../open/not-found.page'
import { UnAuthorizedPage } from '../open/unauthorized.page'
import { Container } from '@material-ui/core'

import { controlAccess } from './control-access';

// LAZY LOADING
const Dashboard = React.lazy(async () => {
  const module = await import('./dashboard/dashboard.component')
  return { default: module.Dashboard }
})

const Map = React.lazy(async () => {
  const module = await import('./map/map.component')
  return { default: module.Map }
})

const Details = React.lazy(async () => {
  const module = await import('./details/details.component')
  return { default: module.Details }
})

const Social = React.lazy(async () => {
  const module = await import('./social/social.route')
  return { default: module.SocialRoute }
})

const Events = React.lazy(async () => {
  const module = await import('./events/events.route')
  return { default: module.EventsRoute }
})
export function ProtectedPages({ match, location, history }: RouteChildrenProps) {
  const { profile } = useUser()
  const originalURL =
    match && match.url && match.url !== '/'
      ? qs.stringify({ redirect_to: match.url + location.search })
      : undefined

  console.debug(
    'ProtectedPages: LOC',
    location.pathname,
    profile,
    match ? match.url : '',
    originalURL,
    profile?.defaultLandingPage
  )

  const unAuthorizedContent = (props) => (
    <Container className="full flex container" maxWidth="sm">
      <UnAuthorizedPage {...props} />
    </Container>
  )

  return profile ? (
    <Switch location={location}>
      <Redirect from="/" exact={true} to={profile.defaultLandingPage} />
      {/* <Route
        path={['/device-auth', '/profile', '/settings']}
        render={({ location }) => {
          return (
            <Container className="full flex container" maxWidth="sm">
              <Suspense
                fallback={
                  <div className="full-screen centered">
                    <CircularProgress color="secondary" size={120} />
                  </div>
                }
              >
                <PersonalRoutes location={location} match={match} history={history} />
              </Suspense>
            </Container>
          )
        }}
      ></Route> */}
      {/* <Route
        path={['/administration', '/organizations', '/users', '/test']}
        render={({ location }) => {
          return (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <AdministrationRoutes location={location} match={match} history={history} />
            </Suspense>
          )
        }}
      ></Route> */}
      <Route
        path={'/dashboard'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Dashboard />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/map'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Map />
            </Suspense>
          ) : unAuthorizedContent(location)
        }}
      ></Route>)
      <Route
        path={'/details'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Details />
            </Suspense>
          )
            : unAuthorizedContent(location)
        }}
      ></Route>

      <Route
        path={'/social'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Social location={location} match={match} history={history} />
            </Suspense>
          ) : unAuthorizedContent(location)
        }}
      ></Route>
      <Route
        path={'/events'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Events location={location} match={match} history={history} />
            </Suspense>
          ) : unAuthorizedContent(location)
        }}
      ></Route>
      <Route
        render={(props) => (
          <Container className="full flex container" maxWidth="sm">
            <NotFoundPage {...props} />
          </Container>
        )}
      />
    </Switch>
  ) : (
    <Redirect to={originalURL ? '/login?' + originalURL : '/login'} from={originalURL} />
  )
}
