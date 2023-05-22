import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Users } from '../users/users.component'
import { Teams } from '../teams/teams.component'
import { Organizations } from '../organizations/organizations.component'
import { Administration } from './administration.component'
import { useUser } from '../../../state/auth/auth.hooks'

export function AdministrationRoutes() {
  const { profile } = useUser()
  let location = useLocation()
  if (!profile || !['administrator', 'organization_manager'].includes(profile.role)) {
    return null
  } else {
    const isAdministrator = profile.role === 'administrator'
    // TODO if organization_manager, get org id and check that matches
    return (
      <Routes location={location}>
        {isAdministrator && (
          <Route path="/administration" element={<Administration />} />
        )}
        {isAdministrator && (
          <Route path="/organizations" element={<Organizations />} />
        )}
        {isAdministrator && <Route path="/users" element={<Users />} />}
        {isAdministrator && <Route path="/users/:uid" element={<Users />} />}
        <Route path="/organizations/:oid"  element={<Organizations />} />
        <Route path="/organizations/:oid/users" element={<Users />} />
        <Route path="/organizations/:oid/users/:uid" element={<Users />} />
        <Route path="/organizations/:oid/teams" element={<Teams />} />
      </Routes>
    )
  }
}

export default AdministrationRoutes