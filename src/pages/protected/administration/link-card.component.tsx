import React from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
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
