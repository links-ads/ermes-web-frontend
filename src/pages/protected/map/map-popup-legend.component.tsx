import React, { useState } from 'react'
import {
  AppBar,
  Typography,
  IconButton,
  CardContent,
  useTheme,
  Grid
} from '@material-ui/core'
import FloatingCardContainer from '../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import { useTranslation } from 'react-i18next'

export function PlayerLegend(props) {
  const theme = useTheme()
  const { t } = useTranslation(['labels'])

  const { legendData, onPositionChange, updateVisibility } = props
  const { legend: imgSrc, group, subGroup, dataTypeId, position, visibility } = legendData

  if (imgSrc) {
    const imageEl = document.createElement('img')
    imageEl.src = imgSrc
  }
  const [dim, setDim] = useState({
    width: 'auto',
    height: 'auto'
  })
  const onResize = (event, data) => {
    setDim({ height: data.size.height, width: data.size.width })
  }

  const changePosition = ({x, y}) => {
    onPositionChange(x, y, group, subGroup, dataTypeId)
  }

  const closeModal = () => {
    updateVisibility(false, group, subGroup, dataTypeId)
  }

  return (
    <FloatingCardContainer
      style={{ minWidth: '150px' }}
      bounds={'parent'}
      defaultPosition={props.defaultPosition}
      position={position}
      toggleActiveFilterTab={visibility}
      dim={dim}
      onPositionChange={changePosition}
    >
      <AppBar
        position="static"
        color="default"
        style={{
          backgroundColor: theme.palette.primary.dark,
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'row'
        }}
        className="handle handleResize"
      >
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            align="left"
            variant="h4"
            style={{ fontSize: '0.875rem', paddingLeft: '10px', marginRight: '10px' }}
          >
            {t('legend')}
          </Typography>
          <IconButton onClick={closeModal} size="small">
            <CloseIcon />
          </IconButton>
        </Grid>
      </AppBar>
      {imgSrc && (
        <CardContent
          style={{
            backgroundColor: theme.palette.primary.dark,
            paddingTop: 4,
            paddingBottom: 16,
            maxHeight: '500px',
            overflow: 'auto',
            maxWidth: '500px',
            width: '100%',
            height: '100%'
          }}
        >
          <img src={imgSrc}></img>
        </CardContent>
      )}
    </FloatingCardContainer>
  )
}
