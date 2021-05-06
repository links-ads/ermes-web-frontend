import React from 'react'
import { ComingSoon } from '../../../common/coming-soon'
import Save from '@material-ui/icons/Save'
import { Button } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { useSnackbars } from '../../../hooks/use-snackbars.hook'
import { useModal } from 'react-modal-hook'
import { ConfirmDialog } from '../../../common/dialogs/confirm-dialog.component'

export function Settings() {
  const { t } = useTranslation()
  const { displayMessage } = useSnackbars()

  const [showConfirmModal, hideConfirmModal] = useModal(
    ({ in: open, onExited }) => (
      <ConfirmDialog
        open={open}
        onExited={onExited}
        title="Do you confirm?"
        confirmLabel="Confirm Save"
        onConfirm={() => {
          hideConfirmModal()
          displayMessage('Confirmed')
        }}
        onCancel={hideConfirmModal}
      >
        Do you confirm? (Just a test for snackbars and modals)
      </ConfirmDialog>
    ),
    []
  )

  return (
    <div className="full column centered">
      <ComingSoon title="common:page_settings" />
      <Button variant="contained" color="secondary" onClick={showConfirmModal} startIcon={<Save />}>
        {t('common:save')}
      </Button>
    </div>
  )
}
