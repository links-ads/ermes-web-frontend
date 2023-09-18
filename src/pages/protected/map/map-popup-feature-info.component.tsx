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
    width: 203,
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
        <Table style={{ width: 'fit-content', height: 'fit-content' }} padding="none" size="small">
          <TableBody>
            {featureInfo.features.map(
              (feature, i) =>
                feature.properties &&
                Object.keys(feature.properties).map((e, idx) => (
                  <TableRow key={'feature-info-' + i}>
                    <TableCell key={'feature-property-' + idx} component="th" scope="row">
                      {e as string}
                    </TableCell>
                    <TableCell key={'feature-value-' + idx} align="right">
                      {feature.properties[e] as string}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </FloatingCardContainer>
  )
}
