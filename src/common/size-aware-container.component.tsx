import React, { useRef } from 'react'
import { useClientSize } from '../hooks/use-window-size.hook'

export interface ContainerSize {
  width: number
  height: number
}

interface SizeAwareContainerProps {
  initialWidth?: number
  initialHeight?: number
  style?: React.CSSProperties
  className?: string
}

export const ContainerSizeContext = React.createContext<ContainerSize>({
  height: window.innerHeight,
  width: window.innerWidth
})

export function SizeAwareContainer({
  initialHeight = window.innerHeight,
  initialWidth = window.innerWidth,
  children,
  style,
  className,
  ...rest
}: React.PropsWithChildren<SizeAwareContainerProps> & React.AriaAttributes) {
  const container = useRef<HTMLDivElement>(null)
  const containerSize: ContainerSize = useClientSize(container, initialWidth, initialHeight)
  return (
    <div ref={container} className={className} style={style} {...rest}>
      <ContainerSizeContext.Provider value={containerSize}>
        {children}
      </ContainerSizeContext.Provider>
    </div>
  )
}
