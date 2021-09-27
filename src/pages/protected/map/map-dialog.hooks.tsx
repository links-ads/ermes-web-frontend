import React, { useState, useEffect, useMemo, useReducer } from 'react'
import { useModal } from 'react-modal-hook'
import { ConfirmDialog } from '../../../common/dialogs/confirm-dialog.component'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { CircularProgress, Grid } from '@material-ui/core'

import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { CommunicationsApiFactory, CreateOrUpdateCommunicationInput, CreateOrUpdateMissionInput, MissionsApiFactory, MissionStatusType } from 'ermes-ts-sdk'
import useAPIHandler from '../../../hooks/use-api-handler'
import { ProvisionalFeatureType } from './map.contest'
import { DialogEdit } from './map-dialog-edit.component'

// Find a more suitable solution, especially for large screens
const Container = styled.div`
  width: 100%;
  height: 200px;
`
export type DialogResponseType = 'confirm' | 'cancel'

export type OperationType = 'create' | 'update' | 'delete'

type DialogStateType = {
  operation: OperationType
  itemType?: ProvisionalFeatureType
  itemId?: string
  area: any
}

export type EditStateType = {
  title: string
  coordinatorType: CoordinatorType
  orgId: number
  teamId: number
  userId: number
  startDate: Date
  endDate: Date | null
  description: string
  status: MissionStatusType
}

export enum CoordinatorType {
  ORGANIZATION = "Organization",
  TEAM = "Team",
  USER = "User",
  NONE = ''
}

export type EditActionType = {
  type: "START_DATE" | "END_DATE" | "DESCRIPTION" | "COORDINATOR" | "TITLE" | "STATUS" | "RESET"
  value?: Date | string | any
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
    case 'TITLE':
      return {
        ...currentState,
        title: action.value as string
      }
    case 'COORDINATOR':
      switch (action.value.coordType) {
        case CoordinatorType.ORGANIZATION:
          return {
            ...currentState,
            coordinatorType: CoordinatorType.ORGANIZATION,
            orgId: action.value.coordId as number,
            teamId: -1,
            userId: -1
          }
        case CoordinatorType.TEAM:
          return {
            ...currentState,
            coordinatorType:action.value.coordId as number !== -1 ? CoordinatorType.TEAM : CoordinatorType.ORGANIZATION,
            teamId: action.value.coordId as number,
            userId: -1
          }
        case CoordinatorType.USER:
          return {
            ...currentState,
            coordinatorType:action.value.coordId as number !== -1 ? CoordinatorType.USER : CoordinatorType.TEAM,
            userId: action.value.coordId as number
          }
        default: return currentState
      }
    case "STATUS":
      return {
        ...currentState,
        status: action.value as MissionStatusType
      }
    case 'RESET':
      return {
        title: "",
        coordinatorType: CoordinatorType.NONE,
        orgId: -1,
        teamId: -1,
        userId: -1,
        startDate: new Date(),
        endDate: null,
        description: "",
        status: MissionStatusType.CREATED
      }
    default:
      throw new Error("Invalid action type")
  }
}

export function useMapDialog(onDialogClose: (data: any) => void) {
  const initialEditState = useMemo(() => { return { title: "", startDate: new Date(), endDate: null, description: "", coordinatorType: CoordinatorType.NONE, orgId: -1, teamId: -1, userId: -1, status: MissionStatusType.CREATED } }, [])
  const [dialogState, setDialogState] = useState<DialogStateType | null>(null)
  const { t } = useTranslation(['maps'])

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const commApiFactory = useMemo(() => CommunicationsApiFactory(backendAPIConfig), [backendAPIConfig])
  const missionsApiFactory = useMemo(() => MissionsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [apiHandlerState, handleAPICall, resetApiHandlerState] = useAPIHandler()
  const [editState, dispatchEditAction] = useReducer(editReducer, initialEditState)
  const [editError, setEditError] = useState(false)


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
          title={`${t('maps:operation_' + dialogState.operation)} ${t("maps:" + dialogState.itemType)}`}
          confirmLabel={t("maps:dialog_confirm")}
          cancelLabel={t("maps:dialog_cancel")}
          onConfirm={() => {
            if (!checkInputForms(editState, dialogState)) {
              setEditError(true)
            }
            else {
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
            (
              <DialogEdit
                itemType={dialogState.itemType!}
                operationType={dialogState.operation}
                editState={editState}
                dispatchEditAction={dispatchEditAction}
                editError={editError}
              />
            )}
          {dialogState.operation === 'delete' && (
            <Container>
              Are you sure to delete {dialogState.itemType} {dialogState.itemId}?
            </Container>
          )}
          {/* {dialogState.operation !== 'delete' && <Container>Coming soon</Container>} */}
        </ConfirmDialog>
      )
    },
    [dialogState, onDialogClose, editState, apiHandlerState, editError]
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

  const checkInputForms = (editState: EditStateType, dialogState: DialogStateType): boolean => {
    if (editState.description.length === 0) return false
    if (!editState.endDate) return false
    if (dialogState.itemType == 'Mission' && editState.coordinatorType === CoordinatorType.NONE) return false
    return true
  }

  const applyHandler = (editState: EditStateType, dialogState: DialogStateType) => {
    const successMessage = `${t("maps:" + dialogState.itemType)} created successfully`
    switch (dialogState.itemType) {
      case 'Report':
        console.log("CREATE REPORT")
        break;
      case 'ReportRequest':
        console.log("CREATE REPORT REQUEST")
        break;
      case 'Mission':
        console.log("CREATE MISSION with ", getFeatureDto(editState, dialogState))
        handleAPICall(() => {
          return missionsApiFactory.missionsCreateOrUpdateMission(getFeatureDto(editState, dialogState) as unknown as CreateOrUpdateMissionInput)
        },successMessage , () => {
          hideDialog()
          onDialogClose('confirm')
        }, () => {
          hideDialog()
          onDialogClose('cancel')
        })
        break;
      case 'Communication':
        console.log("CREATE COMMUNICATION with ", getFeatureDto(editState, dialogState))
        handleAPICall(() => {
          return commApiFactory.communicationsCreateOrUpdateCommunication(getFeatureDto(editState, dialogState) as unknown as CreateOrUpdateCommunicationInput)
        }, successMessage, () => {
          hideDialog()
          onDialogClose('confirm')
        }, () => {
          hideDialog()
          onDialogClose('cancel')
        })
        break;
    }

  }

  const getFeatureDto = (editState: EditStateType, dialogState: DialogStateType) => {
    const baseObj = {
      "feature": {
        "type": "Feature",
        "properties": {
          "id": 0, // solo in creazione
          "duration": {
            "lowerBound": editState.startDate.toISOString(),
            "upperBound": editState.endDate!.toISOString(),
            "lowerBoundIsInclusive": true,
            "upperBoundIsInclusive": true
          },
        },
        "geometry": JSON.stringify(dialogState.area.geometry)
      }
    }
    switch (dialogState.itemType) {
      case 'Communication':
        baseObj['feature']['properties']['message'] = editState.description 
        break;
      case 'Mission':
        baseObj['feature']['properties']['title'] = editState.title 
        baseObj['feature']['properties']['description'] = editState.description 
        baseObj['feature']['properties']['currentStatus'] = editState.status as string
        baseObj['feature']['properties']['organizationId'] = editState.orgId as number
        switch (editState.coordinatorType) {
          case CoordinatorType.TEAM:
            baseObj['feature']['properties']['coordinatorTeamId'] = editState.teamId as number
            break
          case CoordinatorType.USER:
            baseObj['feature']['properties']['coordinatorPersonId'] = editState.userId as number
            break
        }
        break;
    }
    return baseObj
  }


  return openDialog
}
