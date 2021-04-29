import React from 'react'
import Card from '@material-ui/core/Card'

type OnCloseCb = () => void

interface PopupCardHeaderProps {
  onClose?: OnCloseCb
  title?: React.ReactNode
  avatar?: React.ReactNode
  subheader?: React.ReactNode
  src?: string
  imageHeight?: string | number
  style?: React.CSSProperties
}

type PopupCardProps<T> = T & PopupCardHeaderProps

export function PopupCard<T = any>({
  onClose,
  title,
  avatar,
  subheader,
  src,
  style,
  imageHeight = '140',
  Element,
  ...props
}: PopupCardProps<T> & { Element: React.FC<T> | React.ComponentClass<T> }) {
  const properties: T = (props as unknown) as T
  return (
    <Card elevation={0} style={{ maxWidth: 300, ...style }}> 
      <Element {...properties} />
    </Card>
  )
}
