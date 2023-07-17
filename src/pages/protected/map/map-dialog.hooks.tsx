import React, { useState, useEffect, useMemo, useReducer } from 'react'
import { useModal } from 'react-modal-hook'
import { ConfirmDialog } from '../../../common/dialogs/confirm-dialog.component'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { CircularProgress, Grid } from '@material-ui/core'

import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { CommunicationRestrictionType, CommunicationsApiFactory, CommunicationScopeType, CreateOrUpdateCommunicationInput, CreateOrUpdateMapRequestInput, CreateOrUpdateMissionInput, EntityType, MapRequestsApiFactory, MapRequestType, MissionsApiFactory, MissionStatusType } from 'ermes-ts-sdk'
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

export enum FireBreakType {
  CANADAIR = 'Canadair',
  HELICOPTER = 'Helicopter',
  WATERLINE = 'WaterLine',
  VEHICLE = 'Vehicle'
}

type FireSimulationBoundaryCondition = {
  timeOffset: number
  windDirection: number
  windSpeed: number
  fuelMoistureContent: number
  fireBreakType: any
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
  type: MapRequestType
  frequency: string
  dataType: string[]
  requestTitle: string
  resolution: string
  probabilityRange: number
  hoursOfProjection: number
  boundaryConditions: FireSimulationBoundaryCondition[]
  simulationFireSpotting: boolean
  mapSelectionCompleted: boolean
  mapArea: any
  scope: CommunicationScopeType | null
  restrictionType: CommunicationRestrictionType | null
  organizationReceiverIds: number[]
}

export enum CoordinatorType {
  ORGANIZATION = "Organization",
  TEAM = "Team",
  USER = "User",
  NONE = ''
}

export type EditActionType = {
  type:
    | 'START_DATE'
    | 'END_DATE'
    | 'DESCRIPTION'
    | 'COORDINATOR'
    | 'TITLE'
    | 'STATUS'
    | 'RESET'
    | 'DATATYPE'
    | 'TYPE'
    | 'FREQUENCY'
    | 'RESOLUTION'
    | 'REQUEST_TITLE'
    | 'HOURS_OF_PROJECTION'
    | 'PROBABILITY_RANGE'
    | 'SIMULATION_FIRE_SPOTTING'
    | 'BOUNDARY_CONDITION_EDIT'
    | 'BOUNDARY_CONDITION_ADD'
    | 'BOUNDARY_CONDITION_REMOVE'
    | 'MAP_SELECTION_COMPLETED'
    | 'MAP_AREA'
    | 'RESTRICTION'
    | 'SCOPE'
    | 'ORGANIZATIONRECEIVERIDS'
  value?: Date | string | any
}
const getStartDayDate = () =>{
  let d = new Date()
  let d1 = new Date(d.setHours(0,0,0,0))
  return d1
}

const defaultBoundaryCondition : FireSimulationBoundaryCondition = {
  timeOffset: 0,
  windDirection: 0,
  windSpeed: 0,
  fuelMoistureContent: 0,
  fireBreakType: {}
}

const defaultEditState = {
  title: '',
  coordinatorType: CoordinatorType.NONE,
  orgId: -1,
  teamId: -1,
  userId: -1,
  startDate: getStartDayDate(),
  endDate: null,
  description: '',
  status: MissionStatusType.CREATED,
  type: '',
  frequency: '0',
  dataType: [],
  resolution: '10',
  requestTitle: '',
  probabilityRange: 0.75,
  hoursOfProjection: 1,
  simulationFireSpotting: false,
  boundaryConditions: [
    {
      timeOffset: 0,
      windDirection: 0,
      windSpeed: 0,
      fuelMoistureContent: 0,
      fireBreakType: {}
    }
  ],
  mapSelectionCompleted: false,
  mapArea: {},
  restrictionType: CommunicationRestrictionType.NONE,
  scope: CommunicationScopeType.PUBLIC,
  organizationReceiverIds: []
}

export function useMapDialog(onDialogClose: (data: any, entityType: EntityType) => void, customState: any | null) {
  const initialEditState = useMemo(() => {
    if(!!customState) return customState 
    else return defaultEditState }, [customState])
  const setinitialEditState = (customState) => {
      if(customState!=null) return customState 
      else return defaultEditState }
  const [dialogState, setDialogState] = useState<DialogStateType | null>(null)
  const { t } = useTranslation(['maps'])

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const commApiFactory = useMemo(() => CommunicationsApiFactory(backendAPIConfig), [backendAPIConfig])
  const missionsApiFactory = useMemo(() => MissionsApiFactory(backendAPIConfig), [backendAPIConfig])
  const mapRequestApiFactory = useMemo(() => MapRequestsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [apiHandlerState, handleAPICall, resetApiHandlerState] = useAPIHandler()
  //const [editState, dispatchEditAction] = useReducer(editReducer, initialEditState)

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
              coordinatorType:
                (action.value.coordId as number) !== -1
                  ? CoordinatorType.TEAM
                  : CoordinatorType.ORGANIZATION,
              teamId: action.value.coordId as number,
              userId: -1
            }
          case CoordinatorType.USER:
            return {
              ...currentState,
              coordinatorType:
                (action.value.coordId as number) !== -1
                  ? CoordinatorType.USER
                  : CoordinatorType.TEAM,
              userId: action.value.coordId as number
            }
          default:
            return currentState
        }
      case 'STATUS':
        return {
          ...currentState,
          status: action.value as MissionStatusType
        }
      case 'DATATYPE':
        return {
          ...currentState,
          dataType: action.value
        }

      case 'RESTRICTION':
        return {
          ...currentState,
          restrictionType: action.value as CommunicationRestrictionType
        }

      case 'SCOPE':
        return {
          ...currentState,
          scope: action.value as CommunicationScopeType
        }
      case 'ORGANIZATIONRECEIVERIDS':
        return {
          ...currentState,
          organizationReceiverIds: action.value as number[]
        }
      case 'TYPE':
        return {
          ...currentState,
          type: action.value
        }
      case 'FREQUENCY':
        var number = parseInt(action.value)
        return {
          ...currentState,
          frequency: isNaN(number) || number < 0 ? '0' : number > 30 ? '30' : number.toString()
        }
      case 'RESOLUTION':
        var number = parseInt(action.value)
        return {
          ...currentState,
          resolution: isNaN(number) || number < 0 ? '0' : number > 60 ? '60' : number.toString()
        }
      case 'REQUEST_TITLE':
        return {
          ...currentState,
          requestTitle: action.value
        }
      case 'HOURS_OF_PROJECTION':
        return {
          ...currentState,
          hoursOfProjection: action.value
        }
      case 'PROBABILITY_RANGE':
        return {
          ...currentState,
          probabilityRange: action.value
        }
      case 'SIMULATION_FIRE_SPOTTING':
        return {
          ...currentState,
          simulationFireSpotting: action.value
        }
      case 'BOUNDARY_CONDITION_ADD':
        let currentBoundaryConditions = [...currentState.boundaryConditions]
        let newBoundaryCondition = {...defaultBoundaryCondition}
        currentBoundaryConditions.push(newBoundaryCondition)
        return {
          ...currentState,
          boundaryConditions: [...currentBoundaryConditions]
        }
      case 'BOUNDARY_CONDITION_EDIT':
        let modifiedBoundaryConditions = [...currentState.boundaryConditions]
        let editBoundaryCondition = modifiedBoundaryConditions[action.value.index]
        editBoundaryCondition[action.value.property] = action.value.newValue
        modifiedBoundaryConditions[action.value.index] = editBoundaryCondition
        return {
          ...currentState,
          boundaryConditions: [...modifiedBoundaryConditions]
        }
      case 'BOUNDARY_CONDITION_REMOVE':
        let removedBoundaryConditions = [...currentState.boundaryConditions]
        removedBoundaryConditions.splice(action.value.index, 1)
        return {
          ...currentState,
          boundaryConditions: [...removedBoundaryConditions]
        }
      case 'MAP_SELECTION_COMPLETED':
        return {
          ...currentState,
          mapSelectionCompleted: action.value
        }
      case 'MAP_AREA':
        return {
          ...currentState,
          mapArea: action.value
        }
      case 'RESET':
        return setinitialEditState(customState)
      //return defaultEditState
      default:
        throw new Error('Invalid action type')
    }
  }

  const [editState, dispatchEditAction] = useReducer(editReducer, defaultEditState, setinitialEditState)
  const [editError, setEditError] = useState(false)


  //const customState = {coordinatorType: CoordinatorType.ORGANIZATION,dataType: [],description: "",endDate: null,frequency: "5",orgId: -1,resolution: "12",restrictionType: CommunicationRestrictionType.NONE,scope: null,startDate: new Date(),status: MissionStatusType.CREATED,teamId: -1,title: "",userId: -1}

  // TODO: implement stepper for creation
  // and enable "Send" button with onDialogClose("Done",newFeature)
  const [showDialog, hideDialog] = useModal(
    ({ in: open, onExited }) => {
      return dialogState && (
          <ConfirmDialog
            open={open}
            fullWidth={false}
            maxWidth={'xl'}
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
              onDialogClose('cancel', EntityType.OTHER)
            }}
          >

          {dialogState.operation === 'create' &&
            apiHandlerState.loading ?
            (<Grid container justifyContent='center' alignItems='center'>
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
                setEditError={setEditError}
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

  /**
   *  method that checks if the forms are filled and the parameters correct once the user clicks 'confirm' in a create popup
   * @param editState state representing all the parameters to check
   * @param dialogState type of the popup
   * @returns
   */
  const checkInputForms = (editState: EditStateType, dialogState: DialogStateType): boolean => {
    if (!editState.endDate) return false
    if ((dialogState.itemType === EntityType.MISSION || dialogState.itemType === EntityType.COMMUNICATION) && editState.description.length === 0) return false
    if (
      dialogState.itemType === EntityType.MISSION &&
      editState.coordinatorType === CoordinatorType.NONE
    )
      return false
    if (
      dialogState.itemType === EntityType.MAP_REQUEST &&
      editState.type === MapRequestType.FIRE_AND_BURNED_AREA
    ) {
      if (
        isNaN(parseInt(editState.frequency)) ||
        parseInt(editState.frequency) < 0 ||
        editState.dataType.length == 0 ||
        !editState.mapSelectionCompleted ||
        !editState.requestTitle ||
        editState.requestTitle === '' ||
        editState.requestTitle.length < 1
      )
        return false
    }
    if (
      dialogState.itemType === EntityType.MAP_REQUEST &&
      editState.type === MapRequestType.POST_EVENT_MONITORING
    ) {
      if (
        editState.dataType.length == 0 ||
        !editState.mapSelectionCompleted ||
        !editState.requestTitle ||
        editState.requestTitle === '' ||
        editState.requestTitle.length < 1
      )
        return false
    }
    if (
      dialogState.itemType === EntityType.MAP_REQUEST &&
      editState.type === MapRequestType.WILDFIRE_SIMULATION
    ) {
      if (
        !editState.mapSelectionCompleted ||
        !editState.requestTitle ||
        editState.requestTitle === '' ||
        editState.requestTitle.length < 1 ||
        !editState.description ||
        editState.description === '' ||
        editState.description.length < 1 ||
        isNaN(editState.probabilityRange) ||
        editState.simulationFireSpotting === undefined ||
        editState.boundaryConditions.length < 1 ||
        editState.boundaryConditions.map(e => e.timeOffset).filter((e, idx) => editState.boundaryConditions.map(e => e.timeOffset).indexOf(e) !== idx).length > 0 ||
        Object.keys(editState.boundaryConditions[0].fireBreakType).length < 1 ||
        Object.values(editState.boundaryConditions[0].fireBreakType).length < 1
      )
        return false
    }

    if (dialogState.itemType === EntityType.COMMUNICATION)
    { 
      if (!(!!editState.scope || !!editState.restrictionType)) return false
      if (editState.scope == CommunicationScopeType.RESTRICTED)
      {
        if(editState.restrictionType == CommunicationRestrictionType.NONE)
          return false;
        if (
          editState.restrictionType == CommunicationRestrictionType.ORGANIZATION &&
          (!editState.organizationReceiverIds || editState.organizationReceiverIds.length === 0)
        )
          return false
      }
    }
    return true
  }

  const applyHandler = (editState: EditStateType, dialogState: DialogStateType) => {
    const successMessage = `${t("maps:" + dialogState.itemType)} created successfully`
    switch (dialogState.itemType) {
      // case 'Report':
      //   console.log("CREATE REPORT")
      //   break;
      // case 'ReportRequest':
      //   console.log("CREATE REPORT REQUEST")
      //   break;
      case 'Mission':
        console.log("CREATE MISSION with ", getFeatureDto(editState, dialogState))
        handleAPICall(() => {
          return missionsApiFactory.missionsCreateOrUpdateMission(getFeatureDto(editState, dialogState) as unknown as CreateOrUpdateMissionInput)
        },successMessage , () => {
            hideDialog()
            onDialogClose('confirm', EntityType.MISSION)
        }, () => {
            hideDialog()
            onDialogClose('cancel', EntityType.OTHER)
        })
        break;
      case 'MapRequest':
        console.debug("CREATE MapRequest with ", getFeatureDto(editState, dialogState))
        hideDialog() //hide dialog immediately since success and errors are shown externally
        handleAPICall(() => {
        return mapRequestApiFactory.mapRequestsCreateOrUpdateMapRequest(getFeatureDto(editState, dialogState) as unknown as CreateOrUpdateMapRequestInput)
        },successMessage , () => {
            //hideDialog()
            onDialogClose('confirm', EntityType.MAP_REQUEST)
        }, () => {
            //hideDialog()
            onDialogClose('cancel', EntityType.OTHER)
        })
        break;
      case 'Communication':
        console.log("CREATE COMMUNICATION with ", getFeatureDto(editState, dialogState))
        handleAPICall(() => {
          return commApiFactory.communicationsCreateOrUpdateCommunication(getFeatureDto(editState, dialogState) as unknown as CreateOrUpdateCommunicationInput)
        }, successMessage, () => {
            hideDialog()
            onDialogClose('confirm', EntityType.COMMUNICATION)
        }, () => {
            hideDialog()
            onDialogClose('cancel', EntityType.OTHER)
        })
        break;
    }

  }

  const getFeatureDto = (editState: EditStateType, dialogState: DialogStateType) => {
    console.debug('getFeatureDto', dialogState)
    let featureDto = {}
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
      case EntityType.COMMUNICATION:
        baseObj['feature']['properties']['message'] = editState.description
        baseObj['feature']['properties']['scope'] = editState.scope as string
        baseObj['feature']['properties']['restriction'] = editState.restrictionType as string
        baseObj['feature']['properties']['organizationReceiverIds'] =
          editState.organizationReceiverIds
        featureDto = baseObj
        break
      case EntityType.MAP_REQUEST:
        featureDto = createMapRequest(editState)
        break
      case EntityType.MISSION:
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
        featureDto = baseObj
        break
    }
    return featureDto
  }

  const createMapRequest = (editState: EditStateType) => {
    let newMapRequest: CreateOrUpdateMapRequestInput = {
      feature: {
        properties: {
          id: 0,
          duration: {
            lowerBound: editState.startDate.toISOString(),
            upperBound: editState.endDate!.toISOString(),
            lowerBoundIsInclusive: true, 
            upperBoundIsInclusive: true
          },
          mapRequestType: editState.type,
          title: editState.requestTitle
        },
        geometry: JSON.stringify(editState.mapArea.geometry)
      }
    }

    switch (editState.type) {
      case MapRequestType.FIRE_AND_BURNED_AREA:
        newMapRequest.feature.properties.frequency = parseInt(editState.frequency)
        newMapRequest.feature.properties.resolution = parseInt(editState.resolution)
        if (editState.dataType.length > 0) {
          newMapRequest.feature.properties.dataTypeIds = editState.dataType.map((d) => parseInt(d))
        }
        break
      case MapRequestType.POST_EVENT_MONITORING:
        if (editState.dataType.length > 0) {
          newMapRequest.feature.properties.dataTypeIds = editState.dataType.map((d) => parseInt(d))
        }
        break
      case MapRequestType.WILDFIRE_SIMULATION:
        newMapRequest.feature.properties.description = editState.description
        newMapRequest.feature.properties.timeLimit = editState.hoursOfProjection
        newMapRequest.feature.properties.probabilityRange = editState.probabilityRange
        newMapRequest.feature.properties.doSpotting = editState.simulationFireSpotting
        newMapRequest.feature.properties.boundaryConditions = editState.boundaryConditions.map(e => {
          return {
            time: e.timeOffset,
            windDirection: e.windDirection, 
            windSpeed: e.windSpeed,
            moisture: e.fuelMoistureContent,
            fireBreak: e.fireBreakType
          }
        })
        break
    }

    return newMapRequest
  }

  return openDialog
}