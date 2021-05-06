import React from 'react'
import { Switch, Route, RouteChildrenProps } from 'react-router-dom'
import { Users } from '../users/users.component'
import { Teams } from '../teams/teams.component'
import { Organizations } from '../organizations/organizations.component'
import { Administration } from './administration.component'
import { useUser } from '../../../state/auth/auth.hooks'

export function AdministrationRoutes({ location }: RouteChildrenProps) {
  const { profile } = useUser()
  if (!profile || !['administrator', 'organization_manager'].includes(profile.role)) {
    return null
  } else {
    const isAdministrator = profile.role === 'administrator'
    // TODO if organization_manager, get org id and check that matches
    return (
      <Switch location={location}>
        {isAdministrator && (
          <Route path="/administration" exact={true} render={(props) => <Administration />} />
        )}
        {isAdministrator && (
          <Route path="/organizations" exact={true} render={(props) => <Organizations />} />
        )}
        {isAdministrator && <Route path="/users" exact={true} render={(props) => <Users />} />}
        {isAdministrator && <Route path="/users/:uid" exact={true} render={(props) => <Users />} />}
        <Route path="/organizations/:oid" exact={true} render={(props) => <Organizations />} />
        <Route path="/organizations/:oid/users" exact={true} render={(props) => <Users />} />
        <Route path="/organizations/:oid/users/:uid" exact={true} render={(props) => <Users />} />
        <Route path="/organizations/:oid/teams" exact={true} render={(props) => <Teams />} />
      </Switch>
    )
  }
}

export default AdministrationRoutes