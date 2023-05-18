import React from 'react'
import { AdministrationContainer } from '../../../common/common.components'
import { LinkCard } from './link-card.component'
import { Container } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function Administration() {
  const { t } = useTranslation(['admin'])

  return (
    <Container className="full flex container" maxWidth="sm">
      <AdministrationContainer>
        {/** TODO ADD MORE USEFUL STUFF LIKE USER COUNTERS, usage charts etc */}
        <LinkCard
          to="/organizations"
          label={t('admin:adm_manage_organizations_label')}
          text={t('admin:adm_manage_organizations_text')}
        />
        <LinkCard
          to="/users"
          label={t('admin:adm_manage_users_label')}
          text={t('admin:adm_manage_users_text')}
        />
      </AdministrationContainer>
    </Container>
  )
}
