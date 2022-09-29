import React, { MouseEventHandler } from 'react'
import Button from '@material-ui/core/Button'
import Dialog, { DialogProps } from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
// import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { ModalProps } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'

export interface ConfirmDialogProps extends DialogProps {
  title: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: ModalProps['onClose'] & MouseEventHandler<any>
  onCancel: MouseEventHandler<any>
}
const useStyles = makeStyles((theme) => ({
  confirmButtonStyle: {
    backgroundColor: theme.palette.secondary.main,
  }
}))
export function ConfirmDialog({
  title,
  confirmLabel,
  cancelLabel='Cancel',
  children,
  onConfirm,
  onCancel,
  ...dialogProps
}: React.PropsWithChildren<ConfirmDialogProps>) {
  const classes = useStyles()
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
