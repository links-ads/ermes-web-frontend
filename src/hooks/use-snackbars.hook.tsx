import { useSnackbar, OptionsObject } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Close from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'

type ErrorType = string | Error | object

/**
 * Extract relevant error message
 * @param err
 */
function getErrorMessage(err?: ErrorType): string {
  const errorMessage: string = err
    ? typeof err === 'string'
      ? err
      : err instanceof Error
      ? err.message
      : err['message'] || ''
    : ''
  return errorMessage
}

/**
 * Return callbacks for self-closing snackbars of different info types (variants)
 */
export function useSnackbars() {
  const { t } = useTranslation()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const displayErrorSnackbar = (err: string | Error | object, options: OptionsObject = { variant: 'error', autoHideDuration: 4000}) => {
    console.error('Error', err)
    const errorMessage = getErrorMessage(err)
    const message = errorMessage
      ? t('errors:error_detailed', { errorMessage })
      : t('errors:error_generic')
    enqueueSnackbar(message, {
      ...options,
      variant: 'error',
      persist: false,
      action: (key) => (
        <IconButton
          onClick={() => {
            closeSnackbar(key)
          }}
        >
          <Close />
        </IconButton>
      )
    })
  }

  const displayWarningSnackbar = (err: string | Error | object, options: OptionsObject = { variant: 'warning', autoHideDuration: 4000}) => {
    console.warn('Warning', err)
    const errorMessage = t(getErrorMessage(err))
    enqueueSnackbar(errorMessage, {
      ...options,
      variant: 'warning',
      persist: false,
      action: (key) => (
        <IconButton
          onClick={() => {
            closeSnackbar(key)
          }}
        >
          <Close />
        </IconButton>
      )
    })
  }

  const displayMessage = (message: string, options: OptionsObject = { variant: 'info', autoHideDuration: 4000}) => {
    console.debug('Snackbar message', message)
    enqueueSnackbar(t(message), {
      ...options,
      action: (key) => (
        <IconButton
          onClick={() => {
            closeSnackbar(key)
          }}
        >
          <Close />
        </IconButton>
      )
    })
  }

  const displaySuccessSnackbar = (message: string, options: OptionsObject = { variant: 'success', autoHideDuration: 4000}) => {
    console.debug('Snackbar message', message)
    enqueueSnackbar(t(message), {
      ...options,
      action: (key) => (
        <IconButton
          onClick={() => {
            closeSnackbar(key)
          }}
        >
          <Close />
        </IconButton>
      )
    })
  }

  return {
    displayErrorSnackbar,
    displayWarningSnackbar,
    displayMessage,
    displaySuccessSnackbar
  }
}
