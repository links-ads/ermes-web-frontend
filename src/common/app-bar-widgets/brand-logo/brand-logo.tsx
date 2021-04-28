import React, { memo, useContext, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { Route } from 'react-router'
import Tooltip from '@material-ui/core/Tooltip'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { staticAssetsUrl } from '../../../config/base-path'
import { AppConfig, AppConfigContext } from '../../../config'
import { getRandomBackgroundAndTextColors } from '../../../utils/color.utils'

const rotate360 = keyframes`
  from {
    transform: rotateY(0deg);
  }

  to {
    transform: rotateY(360deg);
  }
`

const logoSrc = new URL('icons/brand.png', staticAssetsUrl).href

interface BrandLogoProps {
  envTag?: string
  envTagBackgroundColor?: string
  envTagColor?: string
}

export const BrandLogoD = styled.div<BrandLogoProps>`
  background-image: url(${logoSrc});
  background-position: center;
  background-origin: content-box;
  background-repeat: no-repeat;
  background-size: contain;
  height: 56px;
  width: 198px; /* 200 is 320:90 = 198:56 = 226:64 */
  transform-style: preserve-3d;
  transition: transform 1s linear;
  transform: rotateY(0deg);
  position: relative;
  &:active {
    animation: ${rotate360} 1s 0s linear;
  }
  &:hover {
    animation: ${rotate360} 1s 0s linear;
  }
  @media (min-width: 600px) {
    height: 64px;
    width: 226px;
  }

  &::after {
    content: '${(props) => props.envTag || ''}';
    display: ${(props) => (props.envTag ? 'block' : 'none')};
    position: absolute;
    right: -30px;
    top: 4px;
    height: 16px;
    font-size: 12px;
    padding: 4px 6px;
    border: 2px solid;
    box-sizing: content-box;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 20px 5px 20px;
    color: ${(props) => props.envTagColor || '#000'};
    background-color: ${(props) => props.envTagBackgroundColor || '#FF0'}
  }
`

export const BrandLogo = memo(function BrandLogo() {
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const { t } = useTranslation()
  const envTag = appConfig.envTag || ''
  /* add color and background color picked randomly on the envTag letter */
  const getColors = useCallback(() => getRandomBackgroundAndTextColors(envTag), [envTag])
  const { textColor, backgroundColor } = getColors()
  return (
    <Route
      render={({ location }) => {
        const isAboutPage = location.pathname === '/about'
        const title = isAboutPage ? t('common:homepage') : t('common:about')
        return (
          <Tooltip title={title}>
            <Link
              to={(location) =>
                ['/about', '/device-auth'].includes(location.pathname)
                  ? { ...location, pathname: '/' }
                  : { ...location, pathname: '/about' }
              }
            >
              <BrandLogoD
                className="brand-logo"
                envTag={envTag}
                envTagBackgroundColor={backgroundColor}
                envTagColor={textColor}
              />
            </Link>
          </Tooltip>
        )
      }}
    ></Route>
  )
})
