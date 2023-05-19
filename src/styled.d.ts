import 'styled-components'
import { Theme as MUITheme } from '@mui/material/styles'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme extends MUITheme {}
}
