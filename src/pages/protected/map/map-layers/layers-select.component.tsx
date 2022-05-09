import React, { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  Radio,
  RadioGroup,
  Typography,
  useTheme
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import CardContent from '@material-ui/core/CardContent'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useTranslation } from 'react-i18next'
import FloatingCardContainer from '../../../../common/floating-filters-tab/floating-card-container.component'

export const NO_LAYER_SELECTED = '-1'

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    width: '100px',
    display: 'inline-block',
    paddingLeft: 32,
    paddingTop: 11,
    paddingBottom: 11,
    marginRight: 32
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  accordionDetails: {
    display: 'block'
  }
}))

export function LayersSelectContainer(props) {
  const classes = useStyles()
  const { t } = useTranslation(['maps'])
  const theme = useTheme()
  const [dim, setDim] = useState({
    width: 500,
    height: 400
  })
  const [expanded, setExpanded] = React.useState<string>('')

  const onResize = (event, data) => {
    setDim({ height: data.size.height, width: data.size.width })
  }

  useEffect(() => {
    console.log('position changed',props.position)
    
  }, [props.position])

  const handleAccordionChange =
    (panel: string, type: 'main' | 'sub') =>
    (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
      if (type === 'main') setExpanded(expanded.split('_')[0] === panel ? '' : panel)
      else {
        const accordionOpens = expanded.split('_')
        const isSubOpen = accordionOpens.length > 1
        setExpanded(
          !isSubOpen
            ? accordionOpens[0] + '_' + panel
            : accordionOpens[1] === panel
            ? accordionOpens[0]
            : accordionOpens[0] + '_' + panel
        )
      }
    }

  const handleRadioClick = (event: any) => {
    if (event.target.value === props.layerSelection.dataTypeId) {
      props.setLayerSelection({isMapRequest:NO_LAYER_SELECTED,mapRequestCode:NO_LAYER_SELECTED,dataTypeId:NO_LAYER_SELECTED})
    } else {
      props.setLayerSelection({isMapRequest:0,mapRequestCode:NO_LAYER_SELECTED,dataTypeId:event.target.value})
    }
  }
  return (
    <>
      <FloatingCardContainer
        bounds={'parent'}
        defaultPosition={props.defaultPosition}
        position={props.position}
        toggleActiveFilterTab={props.visibility}
        dim={dim}
        onResize={onResize}
        resizable={true}
        onPositionChange={props.onPositionChange}
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
                  setExpanded('')
                  props.setVisibility(false)
                }}
              >
                <CloseIcon />
              </IconButton>
            </span>
          </AppBar>
          <CardContent style={{ height: '90%', overflowY: 'auto' }}>
            {props.loading ? (
              <Grid container justifyContent="center">
                <CircularProgress />{' '}
              </Grid>
            ) : props.data === undefined ||
              !props.data ||
              props.data.length === 0 ? (
              <Grid container justify="center">
                <Typography align="center" variant="h6">
                  {t('maps:no_layers')}
                </Typography>
              </Grid>
            ) : (
              <FormControl component="fieldset" fullWidth={true}>
                <RadioGroup
                  aria-label="gender"
                  name="controlled-radio-buttons-group"
                  value={props.layerSelection.dataTypeId}
                >
                  {props.data.map((group) => {
                    return (
                      <Accordion
                        key={group['name']}
                        color="primary"
                        style={{ backgroundColor: theme.palette.primary.dark, width: '100%' }}
                        expanded={expanded.split('_')[0] === group['name']}
                        onChange={handleAccordionChange(group['name'], 'main')}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} id={group['name']}>
                          <Typography className={classes.heading}>{group['name']}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.accordionDetails}>
                          {group['subGroups'].map((subGroup) => {
                            const layers = subGroup['layers'].map((layer, i) => (
                              <div key={i}>
                                <FormControlLabel
                                  key={layer['dataTypeId']}
                                  value={String(layer['dataTypeId'])}
                                  control={<Radio onClick={handleRadioClick} />}
                                  label={layer['name']}
                                />
                                <br />
                              </div>
                            ))
                            return subGroup['name'] !== null ? (
                              <Accordion
                                key={subGroup['name']}
                                color="primary"
                                style={{
                                  backgroundColor: theme.palette.primary.dark,
                                  width: '100%'
                                }}
                                expanded={expanded.split('_')[1] === subGroup['name']}
                                onChange={handleAccordionChange(subGroup['name'], 'sub')}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  id={subGroup['name']}
                                >
                                  <Typography className={classes.heading}>
                                    {subGroup['name']}
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails className={classes.accordionDetails}>
                                  {layers}
                                </AccordionDetails>
                              </Accordion>
                            ) : (
                              layers
                            )
                          })}
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </RadioGroup>
              </FormControl>
            )}
          </CardContent>
        </Card>
      </FloatingCardContainer>
    </>
  )
}
