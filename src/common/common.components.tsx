import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import styled from 'styled-components'
import ReplayIcon from '@material-ui/icons/Replay'
import { useTranslation } from 'react-i18next'
import Typography from '@material-ui/core/Typography'
import { getFooter, getContent } from '@mui-treasury/layout'
import { rgba } from 'polished'
import { Box } from '@material-ui/core'

const Content = getContent(styled)
const Footer = getFooter(styled)

// const { theme} = useUITheme()

export const AdministrationContainer = styled.div.attrs({ className: 'full column centered' })`
  flex-grow: 1;
  justify-content: space-evenly;
  .card-root {
    width: 300px;
    min-width: 300px;
  }
  .table-container {
    position: relative;
    width: calc(100% - ${(props) => props.theme.spacing(4)}px);
    height: calc(100% - ${(props) => props.theme.spacing(4)}px);
    tfoot {
      position: absolute;
      bottom: 0;
      width: 100%;
    }
  }
  .not-column-centered {
    flex-direction: row !important;
    width: calc(100% - ${(props) => props.theme.spacing(4)}px);
    height: calc(100% - ${(props) => props.theme.spacing(4)}px);
  }
  .table-container-half {
    display: inline-flex;
    height: 100%;
    .MuiPaper-elevation2 {
      box-shadow: none !important;
    }
  }
  .table-container-half-left {
    width: 65% !important;
    border-right: 1px rgba(255, 255, 255, 0.4) solid;
  }
  .table-container-half-right {
    width: 35% !important;
  }
`

export function RefreshButton({ onClick, disabled = false, icon = <ReplayIcon /> }) {
  const { t } = useTranslation()
  const title = t('common:refresh')
  return onClick ? (
    <Tooltip title={title}>
      <span>
        <IconButton
          disabled={disabled}
          edge="end"
          aria-label="comments"
          size="small"
          onClick={onClick}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  ) : null
}

export const Spacer = styled.div.attrs({ className: 'spacer' })`
  flex-grow: 1;
`

const FooterWrapper = styled.div`
  width: min(100%, 700px);
  height: 100%;
  margin: auto;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  p {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`

export const Main = styled(Content)`
  top: 56px;
  width: 100%;
  /* TODO use props.theme for media queries */
  // height: calc(100% - 112px);
  @media (min-width: 600px) {
    top: 64px;
    // height: calc(100% - 97px);
  }
`

const StyledFooter = styled(Footer).attrs({ className: 'faster-footer' })`
  position: fixed;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  overflow: hidden;
  background-color: ${(props) => props.theme.palette.background.default};
  height: 25px;
  width: 100%;
  border-top: 1px solid ${(props) => rgba(props.theme.palette.text.primary, 0.5)};
  /* TODO use props.theme for media queries */
  @media (min-width: 600px) {
    height: 30px;
  }
  z-index: -1;
`

export function GlobalFooter() {
  const { t } = useTranslation()
  return (
    <StyledFooter>
      <FooterWrapper>
        <Typography variant="caption" color="textSecondary" component="p">
          {t('common:footer')}
        </Typography>
      </FooterWrapper>
    </StyledFooter>
  )
}

interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: any
  value: any
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  )
}

export function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

export const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number,setter) => {
  setter(newValue);
};