import React from 'react'
import { useTranslation } from 'react-i18next'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import styled from 'styled-components'

const TermsContainer = styled.div.attrs({
  className: 'full column centered justified-scrollable-text-box'
})`
  top: ${(props) => props.theme.spacing(4)};
  left: ${(props) => props.theme.spacing(4)};
`

export function TermsOfUsePage() {
  const { t } = useTranslation(['termsofuse'])
  // TODO get name and description from configuration
  return (
    <TermsContainer>
      <Card style={{ margin: 'auto' }}>
        <CardHeader title={t('termsofuse:termsofuse')} />

        <CardContent style={{ overflow: 'auto', height: '88%' }}>
          <Typography variant="body1" dangerouslySetInnerHTML={{__html:t('termsofuse:description') }} ></Typography>
        </CardContent>
      </Card>
    </TermsContainer>
  )
}
