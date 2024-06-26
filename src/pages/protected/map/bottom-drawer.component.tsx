import React from 'react'
// import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'

import { useSidebarCollapse } from '@mui-treasury/layout'
import { EmergencyColorMap } from './api-data/emergency.component'

// const BottomDrawerHeader = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   justify-content: space-between;
//   word-break: break-all;

//   h5 {
//     margin: 0;
//     padding-left: 8px;
//   }
// `

// const BottomDrawerBody = styled.div`
//   display: flex;
//   flex-direction: column;
//   padding: ${(props) => props.theme.spacing(1)}px;
//   word-break: break-all;
//   max-height: calc(100% - 48px);
//   overflow-y: auto;
// `

interface BottomDrawerProps {
  open: boolean
  title?: string
  onClose?: () => void
  onCloseButtonClick?: () => void
  featureType: string
}

// const useStyles = makeStyles((theme) => ({
//   cardAction: {
//     justifyContent: 'space-between',
//     padding: 16
//   },
//   media: {
//     height: 240
//   },
//   card: {
//     width: '400px',
//     height: 'auto'
//   }
// }))

export function BottomDrawerComponent({
  open,
  title,
  onClose,
  onCloseButtonClick,
  featureType,
  children
}: React.PropsWithChildren<BottomDrawerProps>) {
  const { state } = useSidebarCollapse('left_sidebar')
  // Compensate left offset
  const { collapsed, open: leftSidebarOpen } = state
  const leftSidebarCollapsedOpen = collapsed && leftSidebarOpen
  return (
    <Drawer
      anchor={'right'}
      open={open}
      variant="persistent"
      PaperProps={{
        style: {
          marginLeft: leftSidebarCollapsedOpen ? 64 : 'auto',
          maxHeight: '60vh',
          // borderTopLeftRadius: 15,
          // borderTopRightRadius: 15,
          borderRadius: 15,
          right: '54px',
          top: '183px',
          height: 'auto',
          width: '450px',
          // position: 'relative'
          borderWidth: 3,
          borderStyle: 'solid',
          borderColor: EmergencyColorMap[featureType]
        }
      }}
      BackdropProps={{
        invisible: true
      }}
      onClose={onClose}
      className="bottom-drawer"
    >
      {children}
    </Drawer>
  )
}
