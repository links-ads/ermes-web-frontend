import React, { memo } from 'react'
import { Popup } from 'react-map-gl'
import Paper from '@mui/material/Paper'

import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import Add from '@mui/icons-material/Add' // provisional: add item-type specific icons
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import CloseOutlined from '@mui/icons-material/CloseOutlined'
import { ProvisionalFeatureType, ProvisionalOperationType } from './map.contest'
import { useTranslation } from 'react-i18next'
import { Info } from '@mui/icons-material'

export type ItemWithType<T = any> = T & { type: string }

export type ContextMenuItemClickListener = (
  evt: any,
  operation?: ProvisionalOperationType,
  type?: ProvisionalFeatureType,
  itemId?: string,
  data?: string
) => void

interface ContextMenuProps {
  item?: ItemWithType | null
  latitude?: number
  longitude?: number
  onListItemClick: ContextMenuItemClickListener
}

export const ContextMenu = memo(
  function ContextMenu({ item, latitude, longitude, onListItemClick }: ContextMenuProps) {
    
    const { t } = useTranslation(['maps'])
    const coordInfo = latitude+ ', ' + longitude;
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
          <List id="map-menu-list">
            {item
              ? [
                  <ListItem
                    key="upd"
                    onClick={(evt) => onListItemClick(evt, 'update', item.type, item.id || '1234')}
                  >
                    <ListItemIcon>
                      <Edit />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('maps:operation_update') + ' ' + t('maps:' + item.type)}
                    />
                  </ListItem>,
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
              : [
                  <ListItem
                    key="coords"
                    onClick={(evt) => onListItemClick(evt, 'copy', 'Coordinates', undefined, coordInfo)}
                  >
                    <ListItemIcon>
                      <Info />
                    </ListItemIcon>
                    <ListItemText primary={coordInfo} />
                  </ListItem>,
                  <ListItem
                    key="cc"
                    onClick={(evt) => onListItemClick(evt, 'create', 'Communication')}
                  >
                    <ListItemIcon>
                      <Add />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('maps:operation_create') + ' ' + t('maps:Communication')}
                    />
                  </ListItem>,
                  <ListItem key="cm" onClick={(evt) => onListItemClick(evt, 'create', 'Mission')}>
                    <ListItemIcon>
                      <Add />
                    </ListItemIcon>
                    <ListItemText primary={t('maps:operation_create') + ' ' + t('maps:Mission')} />
                  </ListItem>,
                  <ListItem
                    key="cmp"
                    onClick={(evt) => onListItemClick(evt, 'create', 'MapRequest')}
                  >
                    <ListItemIcon>
                      <Add />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('maps:operation_create') + ' ' + t('maps:MapRequest')}
                    />
                  </ListItem>,
                  <Divider key="div" />,
                  <ListItem key="cls" onClick={(evt) => onListItemClick(evt)}>
                    <ListItemIcon>
                      <CloseOutlined />
                    </ListItemIcon>
                    <ListItemText primary={t('maps:operation_close') + ' Menu'} />
                  </ListItem>
                ]}
          </List>
        </Paper>
      </Popup>
    ) : null
  },
  (prev, next) => prev.latitude === next.latitude && prev.longitude === next.longitude
)
