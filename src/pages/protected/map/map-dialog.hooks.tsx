import React, { useState, useEffect, useMemo, useReducer } from 'react'
import { useModal } from 'react-modal-hook'
import { ConfirmDialog } from '../../../common/dialogs/confirm-dialog.component'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { CircularProgress, Grid, IconButton } from '@material-ui/core'
import TodayIcon from '@material-ui/icons/Today'
import TextField from '@material-ui/core/TextField';


import {
  MuiPickersUtilsProvider,
  DateTimePicker
} from '@material-ui/pickers'

import DateFnsUtils from '@date-io/date-fns'
import useLanguage from '../../../hooks/use-language.hook'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { CommunicationsApiFactory, MissionsApiFactory } from 'ermes-ts-sdk'
import useAPIHandler from '../../../hooks/use-api-handler'
import { ProvisionalFeatureType } from './map.contest'

// Find a more suitable solution, especially for large screens
const Container = styled.div`
  width: 100%;
  height: 200px;
`
export type DialogResponseType = 'confirm' | 'cancel'

type OperationType = 'create' | 'update' | 'delete'

type DialogStateType = {
  operation: OperationType
  itemType?: ProvisionalFeatureType
  itemId?: string
  area: any
}

type EditStateType = {
  startDate: Date
  endDate: Date | null
  description: string
}

type EditActionType = {
  type: "START_DATE" | "END_DATE" | "DESCRIPTION" | "RESET"
  value?: Date | string
}


const editReducer = (currentState: EditStateType, action: EditActionType): EditStateType => {
  switch (action.type) {
    case 'START_DATE':
      return {
        ...currentState,
        startDate: action.value as Date
      }
    case 'END_DATE':
      return {
        ...currentState,
        endDate: action.value as Date
      }
    case 'DESCRIPTION':
      return {
        ...currentState,
        description: action.value as string
      }
    case 'RESET':
      return {
        startDate: new Date(),
        endDate: null,
        description: ""
      }
    default:
      throw new Error("Invalid action type")
  }
}

export function useMapDialog(onDialogClose: (data: any) => void) {
  const initialEditState = useMemo(() => { return { startDate: new Date(), endDate: null, description: "" } }, [])
  const [dialogState, setDialogState] = useState<DialogStateType | null>(null)
  const { t } = useTranslation(['maps'])
  const { dateFormat } = useLanguage()
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const commApiFactory = useMemo(() => CommunicationsApiFactory(backendAPIConfig), [backendAPIConfig])
  const {apiHandlerState, handleAPICall,resetApiHandlerState} = useAPIHandler()
  const [editState, dispatchEditAction] = useReducer(editReducer, initialEditState)
  const [editError,setEditError] = useState(false)
  const endAdornment = useMemo(() => {
    return (<IconButton>
      <TodayIcon />
    </IconButton>)
  }, [])

  // TODO: implement stepper for creation
  // and enable "Send" button with onDialogClose("Done",newFeature)
  const [showDialog, hideDialog] = useModal(
    ({ in: open, onExited }) => {
      return dialogState && (
        <ConfirmDialog
          open={open}
          fullWidth={true}
          maxWidth={'lg'}
          onExited={onExited}
          title={`${t('maps:operation_' + dialogState.operation)} ${t("maps:"+dialogState.itemType)}`}
          confirmLabel={t("maps:dialog_confirm")}
          cancelLabel={t("maps:dialog_cancel")}
          onConfirm={() => {
            if (!checkInputForms(editState, dialogState))
            {
              setEditError(true)
            }
            else
            {
              setEditError(false)
              applyHandler(editState, dialogState)
            }
          }}
          onCancel={() => {
            console.debug('Dialog Canceled')
            hideDialog()
            onDialogClose('cancel')
          }}
        >

          {dialogState.operation === 'create' &&
            apiHandlerState.loading ?
            (<Grid container justify='center' alignItems='center'>
                <Grid>
                  <CircularProgress size={100} thickness={4} />
                </Grid>
              </Grid>
            ) :
            (<Grid container direction='column'>
              <Grid>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DateTimePicker
                    style={{ paddingTop: 0, marginTop: 0 }}
                    variant="inline"
                    format={dateFormat}
                    margin="normal"
                    id="start-date-picker-inline"
                    label={t('common:date_picker_test_start')}
                    value={editState.startDate}
                    onChange={d => dispatchEditAction({ type: 'START_DATE', value: d as Date })}
                    disableFuture={false}
                    autoOk={true}
                    ampm={false}
                    clearable={true}
                    InputProps={{
                      endAdornment: endAdornment
                    }}
                  />
                  <DateTimePicker
                    style={{ paddingTop: 0, marginTop: 0 }}
                    variant="inline"
                    format={dateFormat}
                    margin="normal"
                    id="end-date-picker-inline"
                    label={t('common:date_picker_test_end')}
                    value={editState.endDate}
                    onChange={d => dispatchEditAction({ type: 'END_DATE', value: d as Date })}
                    disableFuture={false}
                    autoOk={true}
                    ampm={false}
                    minDate={editState.startDate}
                    InputProps={{
                      endAdornment: endAdornment
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid>
                <TextField
                  id="description"
                  label={t("maps:description_label")}
                  multiline
                  error={editError&&editState.description.length === 0}
                  helperText={t("maps:description_error")}
                  value={editState.description}
                  onChange={e => dispatchEditAction({ type: 'DESCRIPTION', value: e.target.value })}
                  variant='filled'
                  placeholder={t("maps:description_placeholder")}
                  color='primary'
                  rowsMax={4}
                  rows={4}
                  fullWidth={true}
                />
              </Grid>
            </Grid>)}
          {dialogState.operation === 'delete' && (
            <Container>
              Are you sure to delete {dialogState.itemType} {dialogState.itemId}?
            </Container>
          )}
          {/* {dialogState.operation !== 'delete' && <Container>Coming soon</Container>} */}
        </ConfirmDialog>
      )
    },
    [dialogState, onDialogClose, editState, apiHandlerState,editError]
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

  function openDialog(operation?: OperationType, itemType?: ProvisionalFeatureType, itemId?: string, area: any = {}) {
    if (operation) {
      dispatchEditAction({ type: 'RESET' })
      resetApiHandlerState()
      setEditError(false)
      setDialogState({
        operation,
        itemType,
        itemId,
        area
      })
    } else {
      console.debug('Close menu')
    }
  }

  const checkInputForms = (editState: EditStateType, dialogState: DialogStateType):boolean => {
    return editState.description.length > 0
  }

  const applyHandler = (editState: EditStateType, dialogState: DialogStateType) => {
    switch (dialogState.itemType) {
      case 'Report':
        console.log("CREATE REPORT")
        break;
      case 'ReportRequest':
        console.log("CREATE REPORT REQUEST")
        break;
      case 'Mission':
        console.log("CREATE MISSION")
        break;
      case 'Communication':
        console.log("CREATE COMMUNICATION with ",getCommunicationDto(editState.startDate.toISOString(),
        editState.endDate ? editState.endDate.toISOString() : editState.startDate.toISOString(),
        editState.description,
        JSON.stringify(dialogState.area)))
        handleAPICall(()=>{
          return commApiFactory.communicationsCreateOrUpdateCommunication(getCommunicationDto(editState.startDate.toISOString(),
          editState.endDate ? editState.endDate.toISOString() : editState.startDate.toISOString(),
          editState.description,
          JSON.stringify(dialogState.area.geometry)))
        },'Communication created successfully',()=>{
          hideDialog()
          onDialogClose('confirm')
        },()=>{
          hideDialog()
          onDialogClose('cancel')
        })
        break;
    }

  }

  const getCommunicationDto = (startDate: string, endDate: string, description: string, area: string) => {
    return {
      "feature": {
        "type": "Feature",
        "properties": {
          "id": 0,
          "message": description,
          "duration": {
            "lowerBound": startDate,
            "upperBound": endDate,
            "lowerBoundIsInclusive": true,
            "upperBoundIsInclusive": true
          },
        },
        "geometry": area
      }
    }
  }

  return openDialog
}
