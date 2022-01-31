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
}

export interface GenericDialogProps {
    operationType: OperationType
    editState: EditStateType
    dispatchEditAction: React.Dispatch<EditActionType>
    editError: boolean
}

export function DialogEdit({
    itemType,
    operationType,
    editState,
    dispatchEditAction,
    editError
}: React.PropsWithChildren<DialogEditProps>) {

    switch(itemType) {
        case 'Mission':
            return (<MissionDialog
                operationType={operationType}
                editState={editState}
                dispatchEditAction={dispatchEditAction}
                editError={editError}
                />)
        case 'Communication':
            return (<CommunicationDialog
                operationType={operationType}
                editState={editState}
                dispatchEditAction={dispatchEditAction}
                editError={editError}
                />)
        case 'MapRequest':
            return (<MapRequestDialog
                operationType={operationType}
                editState={editState}
                dispatchEditAction={dispatchEditAction}
                editError={editError}
                />)
        default:
            return (<div>Coming Soon</div>)
    }
}