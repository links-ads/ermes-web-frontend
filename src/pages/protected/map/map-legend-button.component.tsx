import {
  IconButton,
  Paper,
  Popover,
  SvgIcon,
  Theme,
  Tooltip,
  createStyles,
  makeStyles,
  Typography
} from '@material-ui/core'
import React, { useState } from 'react'
import { EmergencyColorMap } from './api-data/emergency.component'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { FiberManualRecord } from '@material-ui/icons'
import { EntityType } from 'ermes-backoffice-ts-sdk'

const LegendButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})``

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    legendText: {
      display: 'flex',
      alignItems: 'center'
    },
    popover: {
      pointerEvents: 'none'
    },
    paper: {
      padding: theme.spacing(1)
    }
  })
)

const DiversityShapesIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M40 195 c-15 -18 -10 -45 13 -59 34 -22 73 27 47 59 -16 19 -44 19
-60 0z m46 -16 c10 -17 -13 -36 -27 -22 -12 12 -4 33 11 33 5 0 12 -5 16 -11z"
        />
        <path
          d="M134 196 c-3 -8 -4 -25 -2 -38 2 -19 9 -23 38 -23 33 0 35 2 35 35 0
32 -3 35 -33 38 -21 2 -34 -2 -38 -12z m56 -26 c0 -13 -7 -20 -20 -20 -13 0
-20 7 -20 20 0 13 7 20 20 20 13 0 20 -7 20 -20z"
        />
        <path
          d="M47 75 c-9 -20 -17 -38 -17 -40 0 -3 18 -5 40 -5 22 0 40 2 40 5 0
11 -34 75 -40 75 -3 0 -14 -16 -23 -35z m33 -15 c0 -5 -4 -10 -10 -10 -5 0
-10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z"
        />
        <path
          d="M138 93 c-23 -26 -7 -63 27 -63 34 0 50 37 27 63 -8 9 -20 17 -27 17
-7 0 -19 -8 -27 -17z m42 -29 c0 -8 -7 -14 -15 -14 -15 0 -21 21 -9 33 10 9
24 -2 24 -19z"
        />
      </g>
    </SvgIcon>
  )
}

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }

const MapLegendButton = () => {
  const classes = useStyles()
  const { t } = useTranslation(['maps', 'labels'])

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const color = open ? 'secondary' : 'inherit'

  return (
    <>
      <div>
        <LegendButtonContainer>
          <Tooltip title={t('labels:mapLegend') ?? ''}>
            <span>
              <IconButton
                aria-describedby={id}
                aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                className="mapboxgl-ctrl-icon"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                <DiversityShapesIcon style={ICON_STYLE} color={color} />
              </IconButton>
            </span>
          </Tooltip>
        </LegendButtonContainer>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          className={classes.popover}
          classes={{
            paper: classes.paper
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Paper elevation={0}>
            {Object.keys(EmergencyColorMap)
              .filter((e) => e !== EntityType.ALERT)
              .map((key, i) => {
                return (
                  <Typography key={i} className={classes.legendText}>
                    <FiberManualRecord
                      style={{
                        color: EmergencyColorMap[key],
                        marginRight: 2
                      }}
                    />
                    {t('maps:legend_' + key.toLocaleLowerCase())}{' '}
                  </Typography>
                )
              })}
          </Paper>
        </Popover>
      </div>
    </>
  )
}

export default MapLegendButton
