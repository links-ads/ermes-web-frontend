import React, { Suspense } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Switch, Route, RouteChildrenProps } from 'react-router-dom'
// import { Dashboard } from './dashboard.component'
// import { Map } from './map.component'
// import { Details } from './details.component'
import { useUser } from '../../../state/auth/auth.hooks'

// LAZY LOADING
const Dashboard = React.lazy(async () => {
  const module = await import('./dashboard.component')
  return { default: module.Dashboard }
})

const Map = React.lazy(async () => {
  const module = await import('./map.component')
  return { default: module.Map }
})

const Details = React.lazy(async () => {
  const module = await import('./details.component')
  return { default: module.Details }
})

export function DecisionMakingRoutes({ location }: RouteChildrenProps) {
  const { profile } = useUser()
  if (!profile || profile.role === 'first_responder' || profile.role === 'team_leader') {
    return null
  } else {
    return (
      <Switch location={location}>
        <Route
          path="/dashboard"
          exact={true}
          render={(props) => (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Dashboard />
            </Suspense>
          )}
        />
        <Route
          path="/map"
          exact={true}
          render={(props) => (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Map />
            </Suspense>
          )}
        />
        <Route
          path="/details/:type/:id"
          exact={true}
          render={(props) => (
            <Suspense
              fallback={
                <div className="full-screen centered">
                  <CircularProgress color="secondary" size={120} />
                </div>
              }
            >
              <Details />
            </Suspense>
          )}
        />
      </Switch>
    )
  }
}

export default DecisionMakingRoutes