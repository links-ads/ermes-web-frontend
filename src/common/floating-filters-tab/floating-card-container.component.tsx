// Component which functions only as a resizable container
// which can float over the page content

import React from 'react'
import Draggable from 'react-draggable'
import { Card, makeStyles } from '@material-ui/core'
import { ResizableBox } from 'react-resizable'

const useStyles = (props) =>
  makeStyles((theme) => ({
    floatingFilter: {
      position: 'absolute',
      zIndex: 9
    },
    resizable: {
      position: 'relative',
      '& .react-resizable-handle': {
        position: 'absolute',
        width: 20,
        height: 20,
        bottom: 0,
        right: 0,
        padding: '0 3px 3px 0',
        'box-sizing': 'border-box',
        cursor: 'se-resize',
        backgroundColor: theme.palette.primary.main
      }
    },
    responsivePlayer: {
      transform:
        props.position && props.position.x
          ? `translate(${props.position.x !== 0 ? 'calc(100% + 4px)' : props.position.x + 'px'}, ${
              props.position.y
            }px)!important`
          : undefined,
      '& .react-draggable': {
        transform:
          props.position && props.position.x
            ? `translate(${
                props.position.x !== 0 ? 'calc(100% + 4px)' : props.position.x + 'px'
              }, ${props.position.y}px)!important`
            : undefined
      }
    }
  }))

export default function FloatingCardContainer(props) {
  const classes = useStyles(props)()
  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={props.bounds}
      defaultPosition={props.defaultPosition}
      position={props.position}
      scale={1}
      onStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
      onStop={(e, d) => {
        e.preventDefault()
        props.onPositionChange({ x: d.x, y: d.y })
      }}
    >
      <div
        style={{
          display: props.toggleActiveFilterTab ? undefined : props.isPlayer ? 'block' : 'none',
          width: props.isPlayer ? props.playerWidth : undefined
        }}
        className={(props.isPlayer ? classes.responsivePlayer : '') + ' ' + classes.floatingFilter}
      >
        <Card>
          {props.resizable ? (
            <ResizableBox
              height={props.dim.height}
              width={props.dim.width}
              onResize={props.onResize}
              onResizeStop={props.onResizeStop}
              className={classes.resizable}
              minConstraints={[420, 220]}
              maxConstraints={props.maxConstraints ? props.maxConstraints : [800, 800]}
              resizeHandles={props.resizeHandles ? props.resizeHandles : ['se']}
            >
              {props.children}
            </ResizableBox>
          ) : (
            <div
              style={{
                width: props.dim.width,
                height: props.dim.height
              }}
            >
              {props.children}
            </div>
          )}
        </Card>
      </div>
    </Draggable>
  )
}
