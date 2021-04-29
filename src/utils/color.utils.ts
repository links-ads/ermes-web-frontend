import {
  blue,
  green,
  red,
  deepOrange,
  deepPurple,
  cyan,
  amber,
  indigo,
  teal,
  lime,
  pink
} from '@material-ui/core/colors'
import { intInRange } from './number.utils'
import createPalette from '@material-ui/core/styles/createPalette'

const colors = [blue, green, red, deepOrange, deepPurple, cyan, amber, indigo, teal, lime, pink]

/**
 * Get a random color
 * @param strSeed
 */
export function randomColor(strSeed: string) {
  const random = intInRange(colors.length - 1, 0, strSeed)
  const n: number = Math.abs(
    [...Array(strSeed.length).keys()].reduce((v, ni) => {
      v += strSeed.charCodeAt(ni) - 97
      return v
    }, 0)
  )
  const hue = (((n + 1) % 9) + 1) * 100
  return colors[random][hue]
}

const { getContrastText } = createPalette({})

/**
 * Return contrast color
 * @param color
 */
export function contrastColor(color: string) {
  return getContrastText(color)
}

/**
 * Get a random color and its contrast color
 * @param strSeed
 */
export function getRandomBackgroundAndTextColors(strSeed: string) {
  const backgroundColor = randomColor(strSeed)
  const textColor = getContrastText(backgroundColor)
  return { backgroundColor, textColor }
}
