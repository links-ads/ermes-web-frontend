import React from 'react'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../../../state/auth/auth.hooks'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'

export function AuthenticationCard() {
  const { t } = useTranslation(['privacy', 'termsofuse'])
  const login = useLogin()

  // Clear storage if not authenticated on login page
  // localStorage.clear()

  // const { login /* , logoutHandle, closeLogoutWindow  */ } = useAuth()
  return (
    <div className="full column centered">
      <Card style={{ margin: 'auto' }}>
        <CardHeader title={t('common:not_authenticated')} />
        <CardContent>
          <Typography>{t('common:not_authenticated_msg')}</Typography>
        </CardContent>
        <CardActions>
          <Grid
            container
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between" // Add it here :)
          >
            <Grid item>
              <Typography
                variant="body2"
                display="inline"
                style={{
                  marginRight: '20px',
                  marginLeft: '10px'
                }}
              >
                <Link href="/privacy" color="inherit">
                  {t('privacy:link')}
                </Link>
              </Typography>
              <Typography variant="body2" display="inline">
                <Link href="/termsofuse" color="inherit">
                  {t('termsofuse:link')}
                </Link>
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={login}>
                {t('common:login')}
              </Button>
            </Grid>
          </Grid>

          {/* {logoutHandle !== null && (
            <Button variant="contained" color="secondary" onClick={closeLogoutWindow}>
              {t('common:close_popup')}
            </Button>
          )} */}
        </CardActions>
      </Card>
    </div>
  )
}
