import { useTranslation } from 'react-i18next'
export function UnAuthorizedPage( location ) {
  const { t } = useTranslation()
  return (
    <div className="full column centered">
      <h1>
        401&nbsp;
        <span role="img" aria-label="404">
          🤨
        </span>
      </h1>
      <p>{t('errors:unauthorized_page', { page: location.pathname })}</p>
    </div>
  )
}
