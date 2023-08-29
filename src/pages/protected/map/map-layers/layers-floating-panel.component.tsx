import React, { useMemo, useState } from "react";
import { GroupLayerState, LayerSettingsState } from "../../../../models/layers/LayerState";
import {
  Card,
  Typography,
  AppBar,
  IconButton,
  CardContent,
  Grid,
  CircularProgress,
  FormControl,
  useTheme,
  makeStyles
} from '@material-ui/core'
import FloatingCardContainer from "../../../../common/floating-filters-tab/floating-card-container.component";
import CloseIcon from '@material-ui/icons/Close'
import { useTranslation } from "react-i18next";
import LayersAccordion from "./layers-accordion.component";
import { PixelPostion } from "../../../../models/common/PixelPosition";

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    width: '100px',
    display: 'inline-block',
    paddingLeft: 32,
    paddingTop: 11,
    paddingBottom: 11,
    marginRight: 32
  }
}))

const LayersFloatingPanel: React.FC<{
  layerGroups: GroupLayerState
  isVisible: boolean
  isLoading: boolean
  setIsVisible: any
  setLayerSelection: any
  updateLayerSelection: any
  map: any
  selectedLayers: LayerSettingsState[] | undefined
  position: PixelPostion | undefined
  setPosition: any
  toBeRemovedLayer: string
}> = (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const { t } = useTranslation(['maps'])
  const defaultPosition = useMemo<PixelPostion>(() => {
    return { x: 60, y: Math.max(120, window.innerHeight - 250 - 450) }
  }, [])
  
  const [dim, setDim] = useState({
    width: 500,
    height: 400
  })
  const onResize = (event, data) => {
    setDim({ height: data.size.height, width: data.size.width })
  }

  const onPositionChangeHandler = (event) => {
    props.setPosition(new PixelPostion(event.x, event.y))
  }

  return (
    <FloatingCardContainer
      bounds={'parent'}
      defaultPosition={defaultPosition}
      position={props.position}
      toggleActiveFilterTab={props.isVisible}
      dim={dim}
      onResize={onResize}
      resizable={true}
      onPositionChange={onPositionChangeHandler}
    >
      <Card style={{ height: dim.height }}>
        <AppBar
          position="static"
          color="default"
          style={{
            backgroundColor: theme.palette.primary.dark,
            boxShadow: 'none',
            display: 'block'
          }}
          className="handle handleResize"
        >
          <span className={classes.titleContainer}>
            <Typography align="left" variant="h4">
              Layers
            </Typography>
          </span>
          <span>
            <IconButton
              style={{ marginTop: '10px', position: 'absolute', right: '10px' }}
              onClick={() => {
                props.setIsVisible(false)
              }}
            >
              <CloseIcon />
            </IconButton>
          </span>
        </AppBar>
        <CardContent
          style={{
            height: '90%',
            overflowY: 'auto',
            backgroundColor: theme.palette.primary.main
          }}
        >
          {props.isLoading ? (
            <Grid container justifyContent="center">
              <CircularProgress />{' '}
            </Grid>
          ) : props.layerGroups === undefined ||
            !props.layerGroups ||
            props.layerGroups == null ||
            Object.keys(props.layerGroups).length === 0 ? (
            <Grid container justifyContent="center">
              <Typography align="center" variant="h6">
                {t('maps:no_layers')}
              </Typography>
            </Grid>
          ) : (
            <FormControl component="fieldset" fullWidth={true}>
              {Object.keys(props.layerGroups).map((key) => (
                <LayersAccordion
                  key={key}
                  groupName={key}
                  layerSubGroups={props.layerGroups[key]}
                  setLayerSelection={props.setLayerSelection}
                  updateLayerSelection={props.updateLayerSelection}
                  map={props.map}
                  selectedLayers={props.selectedLayers}
                  toBeRemovedLayer={props.toBeRemovedLayer}
                />
              ))}
            </FormControl>
          )}
        </CardContent>
      </Card>
    </FloatingCardContainer>
  )
}

export default LayersFloatingPanel