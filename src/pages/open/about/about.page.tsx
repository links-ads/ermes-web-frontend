import React from 'react'
import packageJson from '../../../../package.json'
import { useTranslation, Trans } from 'react-i18next'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
const { version, description } = packageJson

const buildGitSha: string = process.env.REACT_APP_GIT_SHA || ''
const buildDate: number = Number(process.env.REACT_APP_BUILD_DATE)

export function AboutPage() {
  const { t } = useTranslation(['about'])
  // TODO get name and description from configuration
  return (
    <div className="full column centered">
      <Card style={{ margin: 'auto' }}>
        <CardHeader title={t('about:about')} />

        <CardContent>
          <Typography variant="body2">
            <Trans
              i18nKey="about:version"
              components={[<Typography gutterBottom variant="h6" component="span" />]}
              values={{ version }}
            ></Trans>
          </Typography>
          <Typography variant="body2">
            <Trans
              i18nKey="about:description"
              components={[<Typography gutterBottom variant="h6" component="span" />]}
              values={{ description }}
            ></Trans>
          </Typography>
          <Typography variant="body1">{t('about:goal')}</Typography>
          <br></br>
          <Typography variant="body2">
            Build Date: {new Date(buildDate).toLocaleString()}
          </Typography>
          <Typography variant="body2">Git SHA: {buildGitSha}</Typography>
        </CardContent>
      </Card>
    </div>
  )
}
