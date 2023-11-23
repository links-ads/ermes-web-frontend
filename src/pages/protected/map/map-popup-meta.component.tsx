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
  List,
  ListItem,
  Grid
} from '@material-ui/core'
import FloatingCardContainer from '../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'

export function PlayerMetadata(props) {
  const theme = useTheme()

  const [dim, setDim] = useState({
    width: 500,
    height: 460
  })
  const onResize = (event, data) => {
    setDim({ height: data.size.height, width: data.size.width })
  }

  const { layerData, updateVisibility, onPositionChange } = props

  const {
    metadata: layerMetaData,
    visibility,
    group,
    subGroup,
    dataTypeId,
    layerName,
    position
  } = layerData

  const closeModal = () => {
    updateVisibility(false, group, subGroup, dataTypeId)
  }

  const updatePosition = ({ x, y }) => {
    onPositionChange(x, y, group, subGroup, dataTypeId)
  }

  function makeList(value) {
    const items = value.split('\n')
    return (
      <List>
        {items.map((item, i) => (
          <ListItem style={{ padding: '0px' }} key={i}>
            {item}
          </ListItem>
        ))}
      </List>
    )
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
      <>
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
              {'Metadata - ' + group + ' | ' + layerName}
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
          <Table
            style={{ width: 'fit-content', height: 'fit-content' }}
            padding="none"
            size="small"
          >
            <TableBody>
              {layerMetaData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell style={{ maxWidth: '350px' }}>{makeList(row[1])}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </>
    </FloatingCardContainer>
  )
}
