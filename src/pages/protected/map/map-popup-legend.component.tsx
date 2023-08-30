import React, { useState } from 'react'
import {
  Card,
  makeStyles,
  AppBar,
  Typography,
  IconButton,
  CardContent,
  useTheme
} from '@material-ui/core'
import FloatingCardContainer from '../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    width: '90%',
    paddingTop: 11,
    paddingBottom: 11
  },
  titleTooltip: {
    width: '10%',
    paddingTop: 11,
    paddingBottom: 11
  }
}))

export function PlayerLegend(props) {
  const classes = useStyles()
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
          flexDirection: 'row',
          height: '60px',
          minWidth: '150px'
        }}
        className="handle handleResize"
      >
        <span className={classes.titleContainer} style={{ width: '100%', alignSelf: 'end' }}>
          <Typography
            align="left"
            variant="h4"
            style={{ fontSize: '1.6rem', paddingLeft: '10px', marginRight: '10px' }}
          >
            {t('legend')}
          </Typography>
        </span>
        <span style={{ width: '20%' }}>
          <IconButton
            style={{ marginTop: '10px', position: 'absolute', right: '0px' }}
            onClick={closeModal}
          >
            <CloseIcon />
          </IconButton>
        </span>
      </AppBar>
      {imgSrc && (
        <CardContent
          style={{
            backgroundColor: theme.palette.primary.dark,
            paddingRight: '26px',
            paddingLeft: '34px',
            paddingTop: '0px',
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
