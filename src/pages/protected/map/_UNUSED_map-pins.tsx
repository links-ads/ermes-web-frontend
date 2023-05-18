import React, { memo } from 'react'
import { Marker } from 'react-map-gl'
import { useTheme } from '@mui/material'
import { OLD_FASHIONED_PIN_SHAPE } from './pin-svg-factories'
interface PinsProps {
  data: any[]
  size?: number // size in px
  onClick?: (evt: any) => void
  onHover?: (evt: any) => void
  color?: 'primary' | 'secondary' | string
}

// PERFORMANCE SUCK WITH SEVERAL POINTS. UNUSABLE
// Important for perf: the markers never change, avoid rerender when the map viewport changes
export const Pins = memo(
  function PinsFn({ data, onClick, onHover, size = 20, color = 'secondary' }: PinsProps) {
    const theme = useTheme()
    const fillColor: string =
      color === 'primary'
        ? theme.palette.primary.light
        : color === 'secondary'
        ? theme.palette.secondary.dark
        : color

    return (
      <>
        {data.map((city, index) => (
          <Marker key={`marker-${index}`} longitude={city.longitude} latitude={city.latitude}>
            <svg
              height={size}
              viewBox="0 0 24 24"
              style={{
                cursor: 'pointer',
                fill: fillColor, // whatever the logic and style
                stroke: 'none',
                transform: `translate(${-size / 2}px,${-size}px)`
              }}
              onMouseEnter={onHover ? () => onHover(city) : undefined}
              onMouseLeave={onHover ? () => onHover(null) : undefined}
              onClick={onClick ? () => onClick(city) : undefined}
            >
              <path d={OLD_FASHIONED_PIN_SHAPE} />
            </svg>
          </Marker>
        ))}
      </>
    )
  },
  (prev, next) => {
    // use deep equal
    return prev.data === next.data
  }
)
