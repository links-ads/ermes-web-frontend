import React, { memo } from 'react'
import {
  EmergencyPropsWithLocation,
  EmergencyHoverCardContent,
  EmergencyProps,
  EmergencyDrawerDetails,
  EmergencyColorMap
} from './emergency.component'
import { PopupCard } from '../popup-card.component'
import { Popup } from 'react-map-gl'
import { ItemWithLatLng } from '../map.context'

type EmergencyCardProps = ItemWithLatLng<EmergencyProps>

function compareProperties(prevProps: EmergencyCardProps, nextProps: EmergencyCardProps) {
  return (
    (prevProps?.item === null && nextProps?.item === null) ||
    // TODO better use a feature.id here!
    (prevProps?.latitude === nextProps?.latitude && prevProps?.longitude === nextProps?.longitude)
  )
}

// function comparePropertiesWithPoly(prevProps, nextProps) {
//   return (
//     (prevProps?.item === null && nextProps?.item === null) ||
//     // TODO better use a feature.id here!
//     (prevProps?.latitude === nextProps?.latitude && prevProps?.longitude === nextProps?.longitude)
//   )
// }

export const EmergencyHoverPopup = memo(
  function EmergencyHoverPopup({ point }: { point: EmergencyCardProps | null }) {
    console.debug('Point info look at me', point)
    if (point != null && point.item)
      point.item.details =
        point.item.details.length > 200
          ? point.item?.details.substring(0, 200) + '...'
          : point.item?.details
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
            style={{
              width: 300,
              borderRadius: 10,
              borderStyle: 'solid',
              borderWidth: 3,
              borderColor: EmergencyColorMap[point?.item?.type]
            }}
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

export const EmergencyDetailsCard = function EmergencyClickPopup(props) {
  /* TODO a smart details component that can differentiate between content types */
  return props.item ? (
    <EmergencyDrawerDetails
      item={props.item}
      latitude={props.latitude}
      longitude={props.longitude}
      setPolyToMap={props.setPolyToMap}
      setGoToCoord={props.setGoToCoord}
      setSelectedCard={props.setSelectedCard}
      setPersonTeam={props.setPersonTeam}
      teamName={props.teamName}
    />
  ) : null
}
//, compareProperties)

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
