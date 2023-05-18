import React, { MouseEventHandler } from 'react'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
// import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { ModalProps } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export interface ConfirmDialogProps extends DialogProps {
  title: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: ModalProps['onClose'] & MouseEventHandler<any>
  onCancel: MouseEventHandler<any>
}
const useStyles = makeStyles()((theme) => { return {
  confirmButtonStyle: {
    backgroundColor: theme.palette.secondary.main,
  }
}})
export function ConfirmDialog({
  title,
  confirmLabel,
  cancelLabel='Cancel',
  children,
  onConfirm,
  onCancel,
  ...dialogProps
}: React.PropsWithChildren<ConfirmDialogProps>) {
  const {classes} = useStyles()
  return (
    <Dialog
      {...dialogProps}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-slide-title"
      aria-describedby="confirm-dialog-slide-description"
    >
      <DialogTitle id="confirm-dialog-slide-title">{title}</DialogTitle>
      <DialogContent>
        {children}
        {/* <DialogContentText id="confirm-dialog-slide-description">{children}</DialogContentText> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button onClick={onConfirm } className={classes.confirmButtonStyle}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
