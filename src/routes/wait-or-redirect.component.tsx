import React from 'react'
import { Redirect } from 'react-router-dom'
import qs from 'qs'
import { useTranslation } from 'react-i18next'

export function WaitOrRedirect({
  searchString,
  hashString
}: {
  searchString: string
  hashString: string
}) {
  const { t } = useTranslation()

  const params = {
    ...qs.parse(searchString, {
      ignoreQueryPrefix: true
    }),
    ...qs.parse(hashString.slice(1))
  }
  const { state, access_token } = params
  let redirectUri = ''
  if (state) {
    try {
      const { success_redirect } = JSON.parse(atob(state.toString()) as string)
      redirectUri = success_redirect
        ? `${success_redirect}?${qs.stringify({
            state,
            access_token,
            device_verified: true
          })}`
        : ''
    } catch (err) {
      console.warn('No OAuth state found')
    }
  } else {
    console.warn('No OAuth state found')
  }

  return redirectUri ? (
    <Redirect to={redirectUri}></Redirect>
  ) : (
    <div>{t('common:please_wait')}...</div>
  )
}
