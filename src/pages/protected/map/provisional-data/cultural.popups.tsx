import React, { memo } from 'react'
import {
  CulturalPropsWithLocation,
  CulturalHoverCardContent,
  CulturalProps,
  CulturalDrawerDetails
} from './cultural.component'
import { PopupCard } from '../popup-card.component'
import { Popup } from 'react-map-gl'
import { ItemWithLatLng } from '../map.context'

type CulturalCardProps = ItemWithLatLng<CulturalProps>

function compareProperties(prevProps: CulturalCardProps, nextProps: CulturalCardProps) {
  return (
    (prevProps?.item === null && nextProps?.item === null) ||
    // TODO better use a feature.id here!
    (prevProps?.latitude === nextProps?.latitude && prevProps?.longitude === nextProps?.longitude)
  )
}

export const CulturalHoverPopup = memo(
  function CulturalHoverPopup({ point }: { point: CulturalCardProps | null }) {
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
          <PopupCard<CulturalProps>
            Element={CulturalHoverCardContent}
            {...point.item}
            title={point.item?.description}
            src={point.item?.image}
            imageHeight={84}
            style={{ width: 300, height: 200 }}
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

export const CulturalDetailsCard = memo(function CulturalClickPopup({
  item,
  ...rest
}: CulturalCardProps) {
  /* TODO a smart details component that can differentiate between content types */
  return item ? <CulturalDrawerDetails item={item} {...rest} /> : null
},
compareProperties)

// ON CTX -> Create | Update | Delete
export function CulturalItemCreationStepper({
  clickedInfo,
  operation
}: {
  operation: 'create' | 'update' | 'delete'
  clickedInfo?: CulturalPropsWithLocation
}) {
  console.debug(operation, clickedInfo)
  return <div>To Be defined</div>
}
