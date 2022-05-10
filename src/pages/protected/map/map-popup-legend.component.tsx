import React, { useState } from 'react'
import { Card, makeStyles, AppBar, Typography, IconButton, CardContent, useTheme, Box, Toolbar } from '@material-ui/core'
import FloatingCardContainer from '../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import { LineChartWidget } from '../dashboard/line-chart-widge.component'

const useStyles = makeStyles((theme) => ({
    titleContainer: {
        width: '90%',
        paddingTop: 11,
        paddingBottom: 11,
    },
    titleTooltip: {
        width: '10%',
        paddingTop: 11,
        paddingBottom: 11,

    }
}))

export function PlayerLegend(props) {
    const classes = useStyles()
    const theme = useTheme()
    const imageEl = document.createElement('img');
    imageEl.src = props.imgSrc;
    console.log('imageplayer',props.visibility, imageEl)
    const [dim, setDim] = useState({
        width: 'auto',
        height: 'auto'
    })
    const onResize = (event, data) => {
        setDim({ height: data.size.height, width: data.size.width })
    }

    return (
        <FloatingCardContainer style={{}}
        bounds={'parent'}
        defaultPosition={props.defaultPosition}
        position={props.position}
        toggleActiveFilterTab={props.visibility}
        dim={dim}
       
        onPositionChange={props.onPositionChange}
      >
          <AppBar
            position="static"
            color="default"
            style={{
              backgroundColor: theme.palette.primary.dark,
              boxShadow: 'none',
              display: 'flex',
              flexDirection:'row',
              height:'60px'
            }}
            className="handle handleResize"
          >
            <span className={classes.titleContainer} style={{width:'100%', alignSelf:'end'}}>
            <Typography align="left" variant="h4" style={{fontSize:'1.6rem', paddingLeft:'10px', marginRight:'10px'}}>
                Legend
              </Typography>
            </span>
            <span  style={{width:'20%'}}>
              <IconButton
                style={{ marginTop: '10px', position: 'absolute', right: '0px' }}
                onClick={() => {
                  props.setVisibility(false)
                }}
              >
                <CloseIcon />
              </IconButton>
            </span>
          </AppBar>
        <CardContent
          style={{
            backgroundColor: theme.palette.primary.dark,
            paddingRight: '26px',
            paddingLeft: '34px',
            paddingTop: '0px',
            maxHeight:'500px',
            overflow:'auto',
            maxWidth:'500px',
            width:'100%',
            height: '100%'
          }}
        >
    
       <img src={props.imgSrc}></img>
        </CardContent>
      </FloatingCardContainer>
    )
}