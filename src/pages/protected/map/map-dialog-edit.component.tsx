import React from 'react';
import { EditActionType, EditStateType, OperationType } from './map-dialog.hooks';
import { ProvisionalFeatureType } from './map.contest';
import { MissionDialog } from './map-dialogs/mission-dialog.component';
import { CommunicationDialog } from './map-dialogs/comm-dialog.component';
import { MapRequestDialog } from './map-dialogs/map-request-dialog.component';

interface DialogEditProps {
    itemType: ProvisionalFeatureType
    operationType: OperationType
    editState: EditStateType
    dispatchEditAction: React.Dispatch<EditActionType>
    editError: boolean
    setEditError: React.Dispatch<React.SetStateAction<boolean>>
}

export interface GenericDialogProps {
    operationType: OperationType
    editState: EditStateType
    dispatchEditAction: React.Dispatch<EditActionType>
    editError: boolean
    setEditError: React.Dispatch<React.SetStateAction<boolean>>
}

export function DialogEdit({
    itemType,
    operationType,
    editState,
    dispatchEditAction,
    editError,
    setEditError
}: React.PropsWithChildren<DialogEditProps>) {

    switch(itemType) {
        case 'Mission':
            return (<MissionDialog
                operationType={operationType}
                editState={editState}
                dispatchEditAction={dispatchEditAction}
                editError={editError}
                setEditError={setEditError}
                />)
        case 'Communication':
            return (<CommunicationDialog
                operationType={operationType}
                editState={editState}
                dispatchEditAction={dispatchEditAction}
                editError={editError}
                setEditError={setEditError}
                />)
        case 'MapRequest':
            return (<MapRequestDialog
                operationType={operationType}
                editState={editState}
                dispatchEditAction={dispatchEditAction}
                editError={editError}
                setEditError={setEditError}
                />)
        default:
            return (<div>Coming Soon</div>)
    }
}