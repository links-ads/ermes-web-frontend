import React from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
export function NotFoundPage({ location }: RouteChildrenProps) {
  const { t } = useTranslation()
  return (
    <div className="full column centered">
      <h1>
        404&nbsp;
        <span role="img" aria-label="404">
          🤨
        </span>
      </h1>
      <p>{t('errors:page_not_found', { page: location.pathname })}</p>
    </div>
  )
}
