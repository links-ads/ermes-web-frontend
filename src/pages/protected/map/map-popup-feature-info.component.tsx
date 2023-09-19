import React, { useState } from 'react'
import {
  AppBar,
  Typography,
  IconButton,
  CardContent,
  useTheme,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Grid
} from '@material-ui/core'
import FloatingCardContainer from '../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'

export const MapFeatureInfo = (props) => {
  const theme = useTheme()

  const [dim, setDim] = useState({
    width: 420,
    height: 300
  })
  const onResize = (event, data) => {
    setDim({ height: data.size.height, width: data.size.width })
  }

  const { layerFeatureInfo, updateVisibility, onPositionChange } = props

  const { visibility, position, featureInfo, layers } = layerFeatureInfo

  const closeModal = () => {
    updateVisibility(false)
  }

  const updatePosition = ({ x, y }) => {
    onPositionChange(x, y)
  }

  return (
    <FloatingCardContainer
      style={{ overflow: 'auto', maxWidth: '730px' }}
      bounds={'parent'}
      defaultPosition={props.defaultPosition}
      position={position}
      toggleActiveFilterTab={visibility}
      dim={dim}
      onResize={onResize}
      resizable={true}
      onPositionChange={updatePosition}
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
            Feature Info
          </Typography>
          <IconButton onClick={closeModal} size="small">
            <CloseIcon />
          </IconButton>
        </Grid>
      </AppBar>
      <CardContent
        style={{
          backgroundColor: theme.palette.primary.dark,
          paddingTop: '0px',
          overflow: 'auto',
          width: '100%',
          height: 'calc(100% - 30px)'
        }}
      >
        {featureInfo.map((feature, i) => (
          <div key={'feat-info-div-' + i}>
            <Typography key={'feat-info-title-' + i} component={'h5'}>
              {feature.layerName}
            </Typography>
            <Table
              key={'feat-info-table-' + i}
              style={{ width: 'fit-content', height: 'fit-content' }}
              padding="none"
              size="medium"
            >
              <TableBody key={'feat-info-table-body-' + i}>
                {feature.featuresInfo.map((feature, j) => (
                  <TableRow key={'feature-info-' + i + '-' + j}>
                    <TableCell
                      key={'feature-property-' + i + '-' + j}
                      component="th"
                      scope="row"
                      style={{ minWidth: 100 }}
                    >
                      {feature.name}
                    </TableCell>
                    <TableCell
                      key={'feature-value-' + i + '-' + j}
                      align="right"
                      style={{ minWidth: 100 }}
                    >
                      {feature.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </FloatingCardContainer>
  )
}
