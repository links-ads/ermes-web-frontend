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
            justify="space-between" // Add it here :)
            container
          >
            <Grid item>
              <div style={{ display: 'inline' }}>
                <Typography
                  variant="body2"
                  style={{
                    display: 'inline-block',
                    marginRight: '20px',
                    marginLeft: '10px',
                    paddingTop: '15px'
                  }}
                >
                  <Link href="/privacy">{t('privacy:link')}</Link>
                </Typography>
                <Typography variant="body2" style={{ display: 'inline-block' }}>
                  <Link href="/termsofuse">{t('termsofuse:link')}</Link>
                </Typography>
              </div>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={login}>
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
