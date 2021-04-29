import React, { Suspense } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import qs from 'querystring'
import { Switch, Route, Redirect, RouteChildrenProps } from 'react-router-dom'
import { useUser } from '../../state/auth/auth.hooks'
import { NotFoundPage } from '../open/not-found.page'
import { Container } from '@material-ui/core'

// LAZY LOADING
const DecisionMakingRoutes = React.lazy(() => import('./decision-making/decision-making.routes'))
// const PersonalRoutes = React.lazy(() => import('./personal/personal.routes'))
// const AdministrationRoutes = React.lazy(() => import('./administration/administration.routes'))
const SocialRoutes = React.lazy( () => import('./social/social.routes'))
const EventsRoutes = React.lazy( () => import('./events/events.routes'))

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
      <Route
        path={['/dashboard', '/map', '/details']}
        render={({ location }) => {
          return (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <DecisionMakingRoutes location={location} match={match} history={history} />
            </Suspense>
          )
        }}
      ></Route>
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
        path={'/social'}
        render={({ location }) => {
          return (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <SocialRoutes location={location} match={match} history={history} />
            </Suspense>
          )
        }}
      ></Route>
      <Route 
        path={'/events'}
        render={({ location }) => {
          return (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <EventsRoutes location={location} match={match} history={history} />
            </Suspense>
          )
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
