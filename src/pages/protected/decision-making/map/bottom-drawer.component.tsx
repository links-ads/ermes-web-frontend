import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import { useSidebarCollapse } from '@mui-treasury/layout'
import styled from 'styled-components'

const BottomDrawerHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  word-break: break-all;

  h5 {
    margin: 0;
    padding-left: 8px;
  }
`

const BottomDrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing(1)}px;
  word-break: break-all;
  max-height: calc(100% - 48px);
  overflow-y: auto;
`

interface BottomDrawerProps {
  open: boolean
  title?: string
  onClose?: () => void
  onCloseButtonClick?: () => void
}

export function BottomDrawerComponent({
  open,
  title,
  onClose,
  onCloseButtonClick,
  children
}: React.PropsWithChildren<BottomDrawerProps>) {
  const { state } = useSidebarCollapse('left_sidebar')
  // Compensate left offset
  const { collapsed, open: leftSidebarOpen } = state
  const leftSidebarCollapsedOpen = collapsed && leftSidebarOpen

  return (
    <Drawer
      anchor={'bottom'}
      open={open}
      variant="persistent"
      PaperProps={{
        style: {
          marginLeft: leftSidebarCollapsedOpen ? 64 : 'auto',
          maxHeight: '60vh',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          // position: 'relative'
        }
      }}
      BackdropProps={{
        invisible: true
      }}
      onClose={onClose}
      className="bottom-drawer"
    >
      <BottomDrawerHeader>
        {title ? (
          <Typography gutterBottom variant="h5" component="h5">
            {title}
          </Typography>
        ) : (
            <div />
          )}
        {onCloseButtonClick ? (
          <IconButton aria-label="settings" onClick={onCloseButtonClick}>
            <CloseIcon />
          </IconButton>
        ) : (
            <div />
          )}
      </BottomDrawerHeader>
      <BottomDrawerBody>
        {children}

      </BottomDrawerBody>
    </Drawer>
  )
}
