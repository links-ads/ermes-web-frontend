import React from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'

export function LinkCard({ to, text, label }: { to: string; text: string; label: string }) {
  return (
    <Card className="card-root" variant="outlined">
      <CardContent>
        <Typography className="carrd-content_text" color="textSecondary" gutterBottom>
          {text}
        </Typography>
      </CardContent>
      <CardActions>
        <Button component={Link} size="small" to={to}>
          {label}
        </Button>
      </CardActions>
    </Card>
  )
}
