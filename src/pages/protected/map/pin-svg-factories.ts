import { contrastColor } from '../../../utils/color.utils'
import yellow from '@material-ui/core/colors/yellow'

export type SVGPinPointStyle = 'standard' | 'old-fashioned'
// ADD any strange pin shape here

// Classic Pin shape
const PIN_SHAPE = `<path d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
C20.1,15.8,20.2,15.8,20.2,15.7z" />`

function StandardPinSVG(color: string, size: number, iconBorder: boolean = false) {
  const viewBox = iconBorder ? '-0 -2 24 32' : '0 0 1024 960'
  let style = `fill:${color};`
  if (iconBorder) {
    const borderColor = contrastColor(color)
    style += `stroke:${borderColor};stroke-width:2;stroke-linecap:round;fill-rule:nonzero;stroke-opacity:0.5`
  } else {
    style += 'stroke:none;'
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
viewBox="${viewBox}"
width="${size}"
height="${size}"
style="${style}">
${PIN_SHAPE}
</svg>`
}

// An icon shape from an old project...
export const OLD_FASHIONED_PIN_SHAPE = `<path d="M512 956.897c-280.985-0.177-508.72-227.912-508.897-508.88v-0.017c0-280.824 238.933-508.897 508.897-508.897 127.224 0 349.091 79.127 508.897 0v508.897c-0.177 280.985-227.912 508.72-508.88 508.897h-0.017z" />`

function OldFashionedSVG(color: string, size: number, iconBorder: boolean = false) {
  const viewBox = iconBorder ? '-40 -40 1124 1024' : '0 0 1024 960'
  let style = `fill:${color};`
  if (iconBorder) {
    const borderColor = contrastColor(color)
    style += `stroke:${borderColor};stroke-width:100;stroke-linecap:round;fill-rule:nonzero;stroke-opacity:0.5`
  } else {
    style += 'stroke:none;'
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
version="1.1"  
viewBox="${viewBox}"  width="${size}"  height="${size}" transform="scale(1, -1) translate(0, 0)" style="${style}">
${OLD_FASHIONED_PIN_SHAPE}
</svg>`
}

function SVGIconString(
  color: string,
  size: number,
  style: SVGPinPointStyle = 'standard',
  iconBorder: boolean = false
) {
  let svg: string = ''
  switch (style) {
    case 'old-fashioned':
      svg = OldFashionedSVG(color, size, iconBorder)
      break
    case 'standard':
    default:
      svg = StandardPinSVG(color, size, iconBorder)
      break
  }
  return svg
}

/**
 * Return an Image element to be used with mapbox.addImage
 * @param color color
 * @param size size in pixel
 * @param style one of the supported styles
 * @param iconBorder if true the icon will have a border (of the contrast color)
 */
export function SVGImage(
  color: string,
  size: number,
  style: SVGPinPointStyle = 'standard',
  iconBorder: boolean = false
) {
  return new Promise<HTMLImageElement>((succ, fail) => {
    const img = new Image()
    img.onload = () => succ(img)
    img.onerror = fail
    img.src = 'data:image/svg+xml;base64,' + btoa(SVGIconString(color, size, style, iconBorder))
  })
}

// maps item-type: color
export interface ColorMap {
  [k: string]: string
}

// Map color map to pins
export function getPinImages(
  colorMap: ColorMap,
  style?: SVGPinPointStyle,
  drawIconBorder?: boolean
) {
  return Promise.all([
    ...Object.entries(colorMap).map(
      async ([id, color]): Promise<[string, HTMLImageElement]> => [
        id,
        await SVGImage(color, 20, style, drawIconBorder)
      ]
    ),
    // hovered point
    (async (): Promise<[string, HTMLImageElement]> => [
      'hovered-pin',
      await SVGImage(yellow[500], 20, style, drawIconBorder)
    ])()
  ])
}
