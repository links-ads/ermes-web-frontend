import React, { useState } from 'react'
import { Card, makeStyles, AppBar, Typography, IconButton, CardContent, useTheme, Box, Toolbar, Table, TableBody, TableRow, TableCell, List, ListItem } from '@material-ui/core'
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

export function PlayerMetadata(props) {
    const classes = useStyles()
    const theme = useTheme()
    const imageEl = document.createElement('img');
    imageEl.src = props.imgSrc;
   
    const [dim, setDim] = useState({
        width: 500,
        height: 460
    })
    const onResize = (event, data) => {
        setDim({ height: data.size.height, width: data.size.width })
      }
    const layerData = props.layerData;

    function makeList( value ) {
        const items = value.split('\n');
        return (
          <List>
            {items.map((item, i) => (
              <ListItem style={{padding:'0px'}} key={i}>{item}</ListItem>
            ))}
          </List>
        );
      }

    return (
        <FloatingCardContainer style={{overflow:'auto', maxWidth:'730px'}}
        bounds={'parent'}
        defaultPosition={props.defaultPosition}
        position={props.position}
        toggleActiveFilterTab={props.visibility}
        dim={dim}
        onResize={onResize}
        resizable={true}
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
                Layer Metadata
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
         
            overflow:'auto',
    
            width:'100%',
            height: 'calc(100% - 60px)'
          }}
        >
             <Table style={{width:'fit-content', height:'fit-content'}}>
             <TableBody>
              {layerData.map((row, i) => (   
                <TableRow key={i}>
                  <TableCell >{row[0]}</TableCell>
                  <TableCell style={{maxWidth:'350px'}}>{ makeList(row[1]) }</TableCell>
                </TableRow>
              ))}
            </TableBody> 
            </Table>
        </CardContent>
      </FloatingCardContainer>
    )
}