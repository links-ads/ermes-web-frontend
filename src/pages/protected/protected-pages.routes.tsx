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

const ImportComponent = React.lazy(async () => {
  const module = await import('./import/import.route')
  return { default: module.ImportRoute }
})

const Administration = React.lazy(
  () => import('./administration/administration.component').then(module => ({ default: module.Administration }))
);

const Organizations = React.lazy(
  () => import('./organizations/organizations.component').then(module => ({ default: module.Organizations }))
);

const Users = React.lazy(
  () => import('./users/users.component').then(module => ({ default: module.Users }))
);

const Teams = React.lazy(
  () => import('./teams/teams.component').then(module => ({ default: module.Teams }))
);

const Profile = React.lazy(
  () => import('./profile/profile.component').then(module => ({ default: module.Profile }))
);

const Settings = React.lazy(
  () => import('./settings/settings.component').then(module => ({ default: module.Settings }))
);

const DeviceAuth = React.lazy(
  () => import('./device-auth/device-auth.component').then(module => ({ default: module.DeviceAuth }))
);

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
      <Route
        path={'/profile'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Profile />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/device-auth'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <DeviceAuth searchString={location.search} />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/settings'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Settings />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/users/:uid'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Users />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/organizations/:oid/users/:uid'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Users />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/organizations/:oid/users'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Users />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/organizations/:oid/teams'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Teams />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/organizations/:oid'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role)  ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Organizations />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/administration'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Administration />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/organizations'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Organizations />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/users'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Users />
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
      <Route
        path={'/import'}
        render={({ location }) => {
          return controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <ImportComponent location={location} match={match} history={history}/>
            </Suspense>
          ) : (unAuthorizedContent(location))
        }}
      ></Route>
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
