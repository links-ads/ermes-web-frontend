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
import { ProvisionalFeatureType, ProvisionalOperationType } from './map.contest'
import { useTranslation } from 'react-i18next'
import { GetApp, Info } from '@material-ui/icons'

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
  downloadGeojsonFeatureCollection: () => void
}

export const ContextMenu = memo(
  function ContextMenu({ item, latitude, longitude, onListItemClick, downloadGeojsonFeatureCollection }: ContextMenuProps) {
    
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
                  <ListItem
                    key="dwl"
                    onClick={downloadGeojsonFeatureCollection}
                  >
                    <ListItemIcon>
                      <GetApp />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('maps:download_button')}
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
