import 'styled-components'
import { Theme as MUITheme } from '@material-ui/core/styles/createMuiTheme'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme extends MUITheme {}
}
