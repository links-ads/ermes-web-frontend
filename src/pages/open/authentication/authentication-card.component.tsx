import React from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../../../state/auth/auth.hooks'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'

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
            justifyContent="space-between" // Add it here :)
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
