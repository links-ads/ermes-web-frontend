import React, { memo } from 'react'
import {
  EmergencyPropsWithLocation,
  EmergencyHoverCardContent,
  EmergencyProps,
  EmergencyDrawerDetails
} from './emergency.component'
import { PopupCard } from '../popup-card.component'
import { Popup } from 'react-map-gl'
import { ItemWithLatLng } from '../map.contest'

type EmergencyCardProps = ItemWithLatLng<EmergencyProps>

function compareProperties(prevProps: EmergencyCardProps, nextProps: EmergencyCardProps) {
  return (
    (prevProps?.item === null && nextProps?.item === null) ||
    // TODO better use a feature.id here!
    (prevProps?.latitude === nextProps?.latitude && prevProps?.longitude === nextProps?.longitude)
  )
}

export const EmergencyHoverPopup = memo(
  function EmergencyHoverPopup({ point }: { point: EmergencyCardProps | null }) {
    return point ? (
      <Popup
        tipSize={5}
        anchor="top"
        longitude={point.longitude}
        latitude={point.latitude}
        closeButton={false}
        closeOnClick={true}
      >
        {typeof point.item !== 'undefined' && (
          <PopupCard<EmergencyProps>
            Element={EmergencyHoverCardContent}
            {...point.item}
            title={point.item?.details}
            // src={point.item?.image}
            // imageHeight={84}
            style={{ width: 300, borderRadius: 10}}
          />
        )}
      </Popup>
    ) : null
  },
  (prevProps, nextProps) => {
    return (
      (prevProps.point === null && nextProps.point === null) ||
      (prevProps.point !== null &&
        nextProps.point !== null &&
        compareProperties(prevProps.point, nextProps.point))
    )
  }
)

export const EmergencyDetailsCard = memo(function EmergencyClickPopup({
  item,
  ...rest
}: EmergencyCardProps) {
  /* TODO a smart details component that can differentiate between content types */
  return item ? <EmergencyDrawerDetails item={item} {...rest} /> : null
},
compareProperties)

// ON CTX -> Create | Update | Delete
export function EmergencyItemCreationStepper({
  clickedInfo,
  operation
}: {
  operation: 'create' | 'update' | 'delete'
  clickedInfo?: EmergencyPropsWithLocation
}) {
  console.debug(operation, clickedInfo)
  return <div>To Be defined</div>
}
