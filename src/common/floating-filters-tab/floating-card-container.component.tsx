// Component which functions only as a resizable container
// which can float over the page content

import React from 'react'
import Draggable from 'react-draggable'
import { Card, makeStyles } from '@material-ui/core'
import { ResizableBox } from 'react-resizable'

const useStyles = makeStyles((theme) => ({
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
      cursor: 'se-resize'
    }
  }
}))

export default function FloatingCardContainer(props) {
  const classes = useStyles()

  return (
    <Draggable
      axis="both"
      handle=".handle"
      bounds={props.bounds}
      defaultPosition={props.defaultPosition}
      position={undefined}
      scale={1}
      onStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
      onStop={(e) => e.preventDefault()}
    >
      <div
        style={{ display: props.toggleActiveFilterTab ? undefined : 'none' }}
        className={classes.floatingFilter}
      >
        <Card>
          {props.resizable ? (
            <ResizableBox
              height={props.dim.height}
              width={props.dim.width}
              onResize={props.onResize}
              className={classes.resizable}
              minConstraints={[500, 300]}
              maxConstraints={[1000, 800]}
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