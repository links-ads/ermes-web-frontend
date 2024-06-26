import React, { useContext, useState, useEffect } from 'react'
import { AppConfig, AppConfigContext } from '../../../config'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import IconButton from '@material-ui/core/IconButton'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import InputLabel from '@material-ui/core/InputLabel'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import Avatar from '@material-ui/core/Avatar'
import { useTheme } from '@material-ui/core'
import Watch from '@material-ui/icons/Watch'
import Clear from '@material-ui/icons/Clear'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useStorage } from 'react-storage-hook'
import { cryptoRandomString, oauthStateName } from '../../../oauth/react-oauth2-hook-mod'

import { useTranslation } from 'react-i18next'
import qs from 'qs'
import { getFusionAuthURLs } from '../../../state/auth/auth.utils'
import { TFunction } from 'i18next'

import useAxios from 'axios-hooks'

interface DeviceAuthProps {
  searchString: string
}

interface DeviceAuthenticationFormProps {
  onFormSubmit: (evt: React.FormEvent<HTMLFormElement>) => Promise<void>
  t: TFunction
  updateCode: (evt: React.ChangeEvent<HTMLInputElement>) => void
  clearCode: () => void
  loading: boolean
  userCode: string
  error: Error | null
  userCodeIsValid: boolean | undefined
}

// Header, common to both cards
function DeviceCardHeader({ t }: { t: TFunction }) {
  const theme = useTheme()

  return (
    <CardHeader
      title={t('device_authn:title')}
      avatar={
        <Avatar
          aria-label="device"
          style={{
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText
          }}
        >
          <Watch />
        </Avatar>
      }
    />
  )
}

// Display Device Authn success
function AuthenticationSuccessCard({ loading, t }: { loading: boolean; t: TFunction }) {
  return (
    <Card style={{ margin: 'auto' }}>
      <DeviceCardHeader t={t} />
      <CardContent>
        <Typography>{t('device_authn:authn_complete')}</Typography>
      </CardContent>
      <CardActions>
        <Button
          component={Link}
          to="/"
          replace={true}
          variant="contained"
          color="secondary"
          disabled={loading}
        >
          {t('common:homepage')}
        </Button>
      </CardActions>
    </Card>
  )
}

// Shows interaction
function DeviceAuthenticationForm({
  onFormSubmit,
  t,
  updateCode,
  clearCode,
  loading,
  userCode,
  error,
  userCodeIsValid
}: DeviceAuthenticationFormProps) {
  return (
    <form onSubmit={onFormSubmit}>
      <Card style={{ margin: 'auto' }}>
        <DeviceCardHeader t={t} />
        <CardContent>
          <FormControl>
            <InputLabel htmlFor="standard-adornment-text">{t('device_authn:user_code')}</InputLabel>
            <Input
              disabled={loading}
              id="standard-adornment-text"
              name="code"
              type="text"
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: 36,
                  letterSpacing: 12
                }
              }}
              value={userCode || '  '}
              onChange={updateCode}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton aria-label="clear code" onClick={clearCode}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Typography>{userCodeIsValid ? t('device_authn:valid_code') : ''}</Typography>
          {
            error && (
              <Typography color="error">{error.message}</Typography>
            ) /** TODO translate error.name */
          }
        </CardContent>
        <CardActions>
          <Button type="submit" variant="contained" color="secondary" disabled={loading}>
            {t('device_authn:verify_code')}
          </Button>
        </CardActions>
      </Card>
    </form>
  )
}

/**
 * Device (e.g. SmartWatch) Authentication Page
 * @param param0
 */
export function DeviceAuth({ searchString }: DeviceAuthProps) {
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const { oauth2CallbackUrl, authorizeUrl, deviceValidateUrl } = getFusionAuthURLs(
    appConfig.rootUrl,
    appConfig.fusionAuth?.url || '',
    appConfig.backend?.url!
  )
  const initialParams: any = qs.parse(searchString, {
    ignoreQueryPrefix: true
  })
  const oauthStateStorage = useStorage<string>(oauthStateName)
  const setOauthState = oauthStateStorage[1]
  const [deviceVerified, setDeviceVerified] = useState<boolean>(!!initialParams.device_verified)

  const initialUserCode = deviceVerified ? '' : (initialParams.user_code as string) || ''
  const [userCode, setUserCode] = useState<string>(initialUserCode)
  const history = useHistory()
  const location = useLocation()
  const [error, setError] = useState<Error | null>(null)

  const { t } = useTranslation(['device_authn'])

  const [{ data: userCodeIsValid, loading, error: remoteError }, getValidationResult] = useAxios<
    boolean
  >(deviceValidateUrl, { manual: true })

  useEffect(() => {
    if (remoteError && remoteError.response?.data) {
      const remoteErrorResponse = remoteError.response?.data
      console.error(remoteErrorResponse)
      const err = new Error(remoteErrorResponse['error_description'])
      err.name = remoteErrorResponse['error']
      err['details'] = remoteErrorResponse
      const fa_reason = err['details']?.error_reason
      if (fa_reason === 'invalid_user_code') {
        err.message = t('errors:invalid_user_code', { userCode })
      }
      setError(err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteError])

  useEffect(() => {
    const code = userCode.trimLeft().trimRight()
    if (code.length > 0) {
      history.replace(`${location.pathname}?user_code=${code}`)
    } else {
      history.replace(location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCode])

  useEffect(() => {
    const { user_code, device_verified, state } = qs.parse(searchString, {
      ignoreQueryPrefix: true
    })
    setUserCode((user_code as string) || '')
    const verified: boolean = !!device_verified
    setDeviceVerified(verified)
    if (state) {
      hideStateFromQs(verified)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString])

  /**
   * Remove device_verified from local url
   * @param device_verified
   */
  function hideStateFromQs(device_verified: boolean) {
    // hide state
    history.replace(`${location.pathname}?${qs.stringify({ device_verified })}`)
  }

  /**
   * Update Code
   * @param evt
   */
  function updateCode(evt: React.ChangeEvent<HTMLInputElement>) {
    setUserCode(evt.target.value)
  }

  /**
   * Remove code
   */
  function clearCode() {
    setUserCode('')
    setError(null)
  }

  /**
   * Form Submit handler
   * @param evt
   */
  async function onFormSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    console.debug('submitting', userCode)
    const clientId = appConfig.fusionAuth?.clientId || ''
    const isValid = await getValidationResult({
      params: {
        client_id: clientId,
        user_code: userCode
      }
    })
    if (isValid) {
      // Redirect to Auhorize endpoint
      const oauthState = btoa(
        JSON.stringify({
          nonce: cryptoRandomString(),
          success_redirect: window.location.pathname
        })
      )
      setOauthState(oauthState)
      const params = {
        client_id: clientId,
        redirect_uri: oauth2CallbackUrl,
        tenantId: appConfig.fusionAuth?.tenantId,
        response_type: 'token',
        user_code: userCode,
        state: oauthState
      }

      window.location.assign(`${authorizeUrl}?${qs.stringify(params)}`)
    }
  }

  return (
    <div className="full column centered">
      {deviceVerified ? (
        <AuthenticationSuccessCard t={t} loading={loading} />
      ) : (
        <DeviceAuthenticationForm
          t={t}
          onFormSubmit={onFormSubmit}
          updateCode={updateCode}
          clearCode={clearCode}
          userCode={userCode}
          loading={loading}
          error={error}
          userCodeIsValid={userCodeIsValid}
        />
      )}
    </div>
  )
}
