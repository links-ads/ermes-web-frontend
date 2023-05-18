import React from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'

import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

const underConstructionURL =
  'https://cdn.pixabay.com/photo/2017/06/16/07/26/under-construction-2408061_960_720.png'

// Provisional components until real ones available
export function ComingSoon({
  title,
  type,
  count
}: {
  title: string
  type?: string
  count?: number
}) {
  const { t } = useTranslation()
  const pageName = t(title, { type })
  const isCounted = typeof count === 'number'
  return (
    <Card
      style={{
        margin: 'auto',
        minWidth: isCounted ? undefined : 'min(80vw, 400px)',
        width: isCounted ? '100%' : undefined,
        height: isCounted ? '100%' : undefined
      }}
    >
      <CardHeader title={pageName} />
      <CardMedia
        style={{
          height: isCounted ? '45%' : 300,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: isCounted ? 'contain' : '75%'
          // height: 0,
          // paddingTop: '56.25%' // 16:9
        }}
        image={underConstructionURL}
        title="Under Construction"
      />
      <CardContent>
        <Typography variant="body2">{t('common:page_coming_soon', { pageName })}</Typography>
        {typeof count === 'number' && <Typography variant="body2">Item #{count}</Typography>}
      </CardContent>
    </Card>
  )
}
