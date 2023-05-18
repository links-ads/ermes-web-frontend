import React from 'react'
import { useTranslation} from 'react-i18next'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import styled from 'styled-components'

const PrivacyContainer = styled.div.attrs({
  className: 'full column centered justified-scrollable-text-box'
})`
    top:  ${(props) => props.theme.spacing(4)};
    left:  ${(props) => props.theme.spacing(4)};
`

export function PrivacyPage() {
  
  const { t } = useTranslation(['privacy'])
  return (
    <PrivacyContainer>
      <Card style={{ margin: 'auto' }}>
        <CardHeader title={t('privacy:privacy')} />

        <CardContent style={{ overflow: 'auto', height: '88%' }}>
          <Typography variant="body1" dangerouslySetInnerHTML={{__html:t('privacy:description') }} ></Typography>
        </CardContent>
        
      </Card>
    </PrivacyContainer>
  )
}
