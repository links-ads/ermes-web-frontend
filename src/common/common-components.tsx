import React from 'react'
import styled from 'styled-components'
import Typography from '@material-ui/core/Typography'
import { getFooter, getContent } from '@mui-treasury/layout'
import { useTranslation } from 'react-i18next'
import { rgba } from 'polished'
const Content = getContent(styled)
const Footer = getFooter(styled)

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
  height: calc(100% - 112px);
  @media (min-width: 600px) {
    top: 64px;
    height: calc(100% - 128px);
  }
`

const StyledFooter = styled(Footer).attrs({ className: 'faster-footer' })`
  position: fixed;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  overflow: hidden;
  background-color: ${(props) => props.theme.palette.background.default};
  height: 56px;
  width: 100%;
  border-top: 1px solid ${(props) => rgba(props.theme.palette.text.primary, 0.5)};
  /* TODO use props.theme for media queries */
  @media (min-width: 600px) {
    height: 64px;
  }
  z-index: -1;
`

export function GlobalFooter() {
  const { t } = useTranslation()
  return (
    <StyledFooter>
      <FooterWrapper>
        <Typography variant="body2" color="textSecondary" component="p">
          {t('common:footer')}
        </Typography>
      </FooterWrapper>
    </StyledFooter>
  )
}
