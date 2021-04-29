import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { OAuthCallback } from '../oauth/react-oauth2-hook-mod'
import { AuthenticationPages } from '../pages/open/authentication/authentication-pages.component'
import { ProtectedPages } from '../pages/protected/protected-pages.routes'
import { NotFoundPage } from '../pages/open/not-found.page'
import { AboutPage } from '../pages/open/about/about.page'
import { PrivacyPage } from '../pages/open/privacy/privacy.page'
import { WaitOrRedirect } from './wait-or-redirect.component'
import { Container } from '@material-ui/core'
import { TermsOfUsePage} from '../pages/open/termsofuse/termsofuse.page'

// http://localhost:3000/device-verification?user_code=JTXHXS
export function ContentRoutes() {
  return (
    <Switch>
      <Route path="/device-auth" exact={false} render={(props) => <ProtectedPages {...props} />} />
      {/* route and component for retrieving OAuth2 params - public */}
      <Route
        exact={true}
        path="/callback"
        render={({ location }) => (
          <OAuthCallback errorBoundary={true}>
            <Container className="full flex container" maxWidth="sm">
              <WaitOrRedirect hashString={location.hash} searchString={location.search} />
            </Container>
          </OAuthCallback>
        )}
      />
      {/* route and component for login, require not being logged in */}
      <Route
        path="/login"
        render={(props) => (
          <Container className="full flex container" maxWidth="sm">
            <AuthenticationPages {...props} />
          </Container>
        )}
      />
      {/* route and component for login, public */}
      <Route path="/about" exact={true}>
        <Container className="full flex container" maxWidth="sm">
          <AboutPage />
        </Container>
      </Route>
      <Route path="/privacy" exact={true}>
        <Container className="full flex container" >
          <PrivacyPage />
        </Container>
      </Route>
      <Route path="/termsofuse" exact={true}>
        <Container className="full flex container" >
          <TermsOfUsePage />
        </Container>
      </Route>
      {/* By default will try go to /dashboard */}
      <Route path="/" exact={false} render={(props) => <ProtectedPages {...props} />} />
      <Route
        path="*"
        render={(props) => (
          <Container className="full flex container" maxWidth="sm">
            <NotFoundPage {...props} />
          </Container>
        )}
      />
    </Switch>
  )
}
