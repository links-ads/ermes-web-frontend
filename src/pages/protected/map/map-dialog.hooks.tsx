import React, { useState, useEffect } from 'react'
import { useModal } from 'react-modal-hook'
import { ConfirmDialog } from '../../../common/dialogs/confirm-dialog.component'
import styled from 'styled-components'

// Find a more suitable solution, especially for large screens
const Container = styled.div`
  width: 100%;
  height: 200px;
`

type OperationType = 'create' | 'update' | 'delete'

type DialogStateType = {
  operation: OperationType
  itemType?: string
  itemId?: string
}

export function useMapDialog(onDialogClose: (data: any) => void) {
  const [dialogState, setDialogState] = useState<DialogStateType | null>(null)

  // TODO: implement stepper for creation
  // and enable "Send" button with onDialogClose("Done",newFeature)
  const [showDialog, hideDialog] = useModal(
    ({ in: open, onExited }) =>
      dialogState && (
        <ConfirmDialog
          open={open}
          fullWidth={true}
          maxWidth={'lg'}
          onExited={onExited}
          title={`${dialogState.operation} item`}
          confirmLabel="Confirm"
          onConfirm={() => {
            hideDialog()
            console.debug('Dialog Confirmed')
            onDialogClose('confirm')
          }}
          onCancel={() => {
            hideDialog()
            console.debug('Dialog Canceled')
            onDialogClose('cancel')
          }}
        >
          {dialogState.operation === 'delete' && (
            <Container>
              Are you sure to delete {dialogState.itemType} {dialogState.itemId}?
            </Container>
          )}
          {dialogState.operation !== 'delete' && <Container>Coming soon</Container>}
        </ConfirmDialog>
      ),
    [dialogState, onDialogClose]
  )

  useEffect(
    () => {
      if (dialogState) {
        console.debug(dialogState)
        showDialog()
      } else {
        hideDialog()
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [dialogState]
  )

  function openDialog(operation?: OperationType, itemType?: string, itemId?: string) {
    if (operation) {
      setDialogState({
        operation,
        itemType,
        itemId
      })
    } else {
      console.debug('Close menu')
    }
  }

  return openDialog
}
