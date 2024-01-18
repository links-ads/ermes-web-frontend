import React, { memo } from 'react'
import { Popup } from 'react-map-gl'
import Paper from '@material-ui/core/Paper'

import List from '@material-ui/core/List'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import Add from '@material-ui/icons/Add' // provisional: add item-type specific icons
import Edit from '@material-ui/icons/Edit'
import Delete from '@material-ui/icons/Delete'
import CloseOutlined from '@material-ui/icons/CloseOutlined'
import { ProvisionalFeatureType, ProvisionalOperationType } from './map.context'
import { useTranslation } from 'react-i18next'
import { Info } from '@material-ui/icons'
import { useUserPermission } from '../../../state/auth/auth.hooks'
import { PermissionAction, PermissionEntity } from '../../../state/auth/auth.consts'
import { EntityType } from 'ermes-backoffice-ts-sdk'

export type ItemWithType<T = any> = T & { type: string }

export type ContextMenuItemClickListener = (
  evt: any,
  operation?: ProvisionalOperationType,
  type?: ProvisionalFeatureType,
  itemId?: string,
  data?: string | [number, number]
) => void

interface ContextMenuProps {
  item?: ItemWithType | null
  latitude?: number
  longitude?: number
  onListItemClick: ContextMenuItemClickListener
  selectedLayer?: any | null
}

const ContextMenuOption = (props) => {
  const { keyName, onClickHandler, itemIcon, itemText } = props
  return (
    <ListItem key={keyName} onClick={onClickHandler}>
      <ListItemIcon style={{ minWidth: 32 }}>{itemIcon}</ListItemIcon>
      <ListItemText primary={itemText} />
    </ListItem>
  )
}

export const ContextMenu = memo(
  function ContextMenu({
    item,
    latitude,
    longitude,
    onListItemClick,
    selectedLayer
  }: ContextMenuProps) {
    const { t } = useTranslation(['maps'])
    const canCreateMission = useUserPermission(PermissionEntity.MISSION, PermissionAction.CREATE)
    const canCreateCommunication = useUserPermission(
      PermissionEntity.COMMUNICATION,
      PermissionAction.CREATE
    )
    const canCreateMapRequest = useUserPermission(
      PermissionEntity.MAP_REQUEST,
      PermissionAction.CREATE
    )
    const canDeleteMapRequest = useUserPermission(
      PermissionEntity.MAP_REQUEST,
      PermissionAction.DELETE
    )
    const coordInfo = latitude + ', ' + longitude
    return typeof latitude === 'number' && typeof longitude === 'number' ? (
      <Popup
        tipSize={5}
        anchor="top"
        longitude={longitude}
        latitude={latitude}
        closeButton={false}
        closeOnClick={true}
      >
        <Paper>
          <List id="map-menu-list" dense>
            {item && item.type === EntityType.MAP_REQUEST && canDeleteMapRequest
              ? [
                  // <ListItem
                  //   key="upd"
                  //   onClick={(evt) => onListItemClick(evt, 'update', item.type, item.id || '1234')}
                  // >
                  //   <ListItemIcon>
                  //     <Edit />
                  //   </ListItemIcon>
                  //   <ListItemText
                  //     primary={t('maps:operation_update') + ' ' + t('maps:' + item.type)}
                  //   />
                  // </ListItem>,
                  <ListItem
                    key="del"
                    onClick={(evt) => onListItemClick(evt, 'delete', item.type, item.id || '1234')}
                  >
                    <ListItemIcon>
                      <Delete />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('maps:operation_delete') + ' ' + t('maps:' + item.type)}
                    />
                  </ListItem>,
                  <Divider key="div" />,
                  <ListItem key="cls" onClick={(evt) => onListItemClick(evt)}>
                    <ListItemIcon>
                      <CloseOutlined />
                    </ListItemIcon>
                    <ListItemText primary={t('maps:operation_close') + ' Menu'} />
                  </ListItem>
                ]
              : selectedLayer
              ? [
                  <ContextMenuOption
                    key={'coords'}
                    onClickHandler={(evt) =>
                      onListItemClick(evt, 'copy', 'Coordinates', undefined, coordInfo)
                    }
                    itemIcon={<Info fontSize="small" />}
                    itemText={coordInfo}
                  />,
                  <Divider key="div-0" />,
                  canCreateCommunication ? (
                    <ContextMenuOption
                      key={'cc'}
                      onClickHandler={(evt) => onListItemClick(evt, 'create', 'Communication')}
                      itemIcon={<Add fontSize="small" />}
                      itemText={t('maps:operation_create') + ' ' + t('maps:Communication')}
                    />
                  ) : (
                    <></>
                  ),
                  canCreateMission ? (
                    <ContextMenuOption
                      key={'cm'}
                      onClickHandler={(evt) => onListItemClick(evt, 'create', 'Mission')}
                      itemIcon={<Add fontSize="small" />}
                      itemText={t('maps:operation_create') + ' ' + t('maps:Mission')}
                    />
                  ) : (
                    <></>
                  ),
                  canCreateMapRequest ? (
                    <ContextMenuOption
                      key={'cmp'}
                      onClickHandler={(evt) => onListItemClick(evt, 'create', 'MapRequest')}
                      itemIcon={<Add fontSize="small" />}
                      itemText={t('maps:operation_create') + ' ' + t('maps:MapRequest')}
                    />
                  ) : (
                    <></>
                  ),
                  <Divider key="div-1" />,
                  <ContextMenuOption
                    key={'gts'}
                    onClickHandler={(evt) =>
                      onListItemClick(evt, 'get', 'Timeseries', undefined, [longitude, latitude])
                    }
                    itemIcon={<Add fontSize="small" />}
                    itemText={t('maps:operation_get') + ' ' + t('maps:timeseries')}
                  />,
                  <ContextMenuOption
                    key={'gfi'}
                    onClickHandler={(evt) =>
                      onListItemClick(evt, 'get', 'FeatureInfo', undefined, [longitude, latitude])
                    }
                    itemIcon={<Add fontSize="small" />}
                    itemText={t('maps:operation_get') + ' ' + t('maps:featureInfo')}
                  />,
                  <Divider key="div-2" />,
                  <ContextMenuOption
                    key={'cls'}
                    onClickHandler={(evt) => onListItemClick(evt)}
                    itemIcon={<CloseOutlined fontSize="small" />}
                    itemText={t('maps:operation_close') + ' Menu'}
                  />
                ]
              : [
                  <ContextMenuOption
                    key={'coords'}
                    onClickHandler={(evt) =>
                      onListItemClick(evt, 'copy', 'Coordinates', undefined, coordInfo)
                    }
                    itemIcon={<Info fontSize="small" />}
                    itemText={coordInfo}
                  />,
                  !canCreateCommunication && !canCreateMapRequest && !canCreateMission ? (
                    <></>
                  ) : (
                    <Divider key="div-0" />
                  ),
                  canCreateCommunication ? (
                    <ContextMenuOption
                      key={'cc'}
                      onClickHandler={(evt) => onListItemClick(evt, 'create', 'Communication')}
                      itemIcon={<Add fontSize="small" />}
                      itemText={t('maps:operation_create') + ' ' + t('maps:Communication')}
                    />
                  ) : (
                    <></>
                  ),
                  canCreateMission ? (
                    <ContextMenuOption
                      key={'cm'}
                      onClickHandler={(evt) => onListItemClick(evt, 'create', 'Mission')}
                      itemIcon={<Add fontSize="small" />}
                      itemText={t('maps:operation_create') + ' ' + t('maps:Mission')}
                    />
                  ) : (
                    <></>
                  ),
                  canCreateMapRequest ? (
                    <ContextMenuOption
                      key={'cmp'}
                      onClickHandler={(evt) => onListItemClick(evt, 'create', 'MapRequest')}
                      itemIcon={<Add fontSize="small" />}
                      itemText={t('maps:operation_create') + ' ' + t('maps:MapRequest')}
                    />
                  ) : (
                    <></>
                  ),
                  !canCreateCommunication && !canCreateMapRequest && !canCreateMission ? (
                    <></>
                  ) : (
                    <Divider key="div-2" />
                  ),
                  !canCreateCommunication && !canCreateMapRequest && !canCreateMission ? (
                    <></>
                  ) : (
                    <ContextMenuOption
                      key={'cls'}
                      onClickHandler={(evt) => onListItemClick(evt)}
                      itemIcon={<CloseOutlined fontSize="small" />}
                      itemText={t('maps:operation_close') + ' Menu'}
                    />
                  )
                ]}
          </List>
        </Paper>
      </Popup>
    ) : null
  },
  (prev, next) => prev.latitude === next.latitude && prev.longitude === next.longitude
)
