import React, { Suspense } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import qs from 'querystring'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../../state/auth/auth.hooks'
import { NotFoundPage } from '../open/not-found.page'
import { UnAuthorizedPage } from '../open/unauthorized.page'
import { Container } from '@mui/material'

import { controlAccess } from './control-access'

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

const UncompletedUsersComponent = React.lazy(async () => {
  const module = await import('./uncompleted-users/uncompleted-users.route')
  return { default: module.UncompletedUsersRoute }
})

const Administration = React.lazy(() =>
  import('./administration/administration.component').then((module) => ({
    default: module.Administration
  }))
)

const Organizations = React.lazy(() =>
  import('./organizations/organizations.component').then((module) => ({
    default: module.Organizations
  }))
)

const Users = React.lazy(() =>
  import('./users/users.component').then((module) => ({ default: module.Users }))
)

const Teams = React.lazy(() =>
  import('./teams/teams.component').then((module) => ({ default: module.Teams }))
)

const Profile = React.lazy(() =>
  import('./profile/profile.component').then((module) => ({ default: module.Profile }))
)

const Settings = React.lazy(() =>
  import('./settings/settings.component').then((module) => ({ default: module.Settings }))
)

const DeviceAuth = React.lazy(() =>
  import('./device-auth/device-auth.component').then((module) => ({ default: module.DeviceAuth }))
)

export function ProtectedPages() {
  const { profile } = useUser()
  let location = useLocation()
  let url = location.pathname // TODO check if this works, previously match.url
  const originalURL =
    url && url !== '/'
      ? qs.stringify({ redirect_to: url + location.search })
      : undefined

  console.debug(
    'ProtectedPages: LOC',
    location.pathname,
    profile,
    url ? url : '',
    originalURL,
    profile?.defaultLandingPage
  )

  const unAuthorizedContent = (props) => (
    <Container className="full flex container" maxWidth="sm">
      <UnAuthorizedPage {...props} />
    </Container>
  )

  return profile ? (
    <Routes location={location}>
      {/*  // TODO fix from="/"  exact={true} */}
      <Navigate to={profile.defaultLandingPage} />
      <Route
        path={'/profile'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Profile />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/device-auth'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <DeviceAuth searchString={location.search} />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/settings'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Settings />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/organizations/users'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Users />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/organizations/teams'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Teams />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/administration'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Administration />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/organizations'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Organizations />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/users'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Users />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/import'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <ImportComponent />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/uncompleted-users'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <UncompletedUsersComponent />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/dashboard'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Dashboard />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/map'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Map />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/details'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Details />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />

      <Route
        path={'/social'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Social />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        path={'/events'}
        element={
          controlAccess(location.pathname, profile.role) ? (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Events />
            </Suspense>
          ) : (
            unAuthorizedContent(location)
          )
        }
      />
      <Route
        element={
          <Container className="full flex container" maxWidth="sm">
            <NotFoundPage />
          </Container>
        }
      />
    </Routes>
  ) : (
    <Navigate to={originalURL ? '/login?' + originalURL : '/login'} /> // TODO fix from={originalURL} />
  )
}
