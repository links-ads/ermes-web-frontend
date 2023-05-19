import React, { memo, useContext, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { Route, useLocation } from 'react-router'
import Tooltip from '@mui/material/Tooltip'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { staticAssetsUrl } from '../../../config/base-path'
import { AppConfig, AppConfigContext } from '../../../config'
import { getRandomBackgroundAndTextColors } from '../../../utils/color.utils'
import { useUITheme } from   '../../../state/preferences/preferences.hooks'

const rotate360 = keyframes`
  from {
    transform: rotateY(0deg);
  }

  to {
    transform: rotateY(360deg);
  }
`


interface BrandLogoProps {
  envTag?: string
  envTagBackgroundColor?: string
  envTagColor?: string
  logoSrc?: string
}

export const BrandLogoD = styled.div<BrandLogoProps>`
  background-image: url(${(props) => props.logoSrc});
  background-position: center;
  background-origin: content-box;
  background-repeat: no-repeat;
  background-size: contain;
  height: 56px;
  padding: 7px;
  padding-left: 0px;
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
  const location = useLocation()
  const isAboutPage = location.pathname === '/about'
  const title = isAboutPage ? t('common:homepage') : t('common:about')

  const { theme, themeName } = useUITheme()
var logoSrc =  new URL('icons/brand_light.png', staticAssetsUrl).href
if(themeName == 'light')
  logoSrc = new URL('icons/brand_light.png', staticAssetsUrl).href
else 
  logoSrc = new URL('icons/brand_dark.png', staticAssetsUrl).href
  return (
    <Route
      element={
        <Tooltip title={title}>
          <Link
            to={
              ['/about', '/device-auth'].includes(location.pathname)
                ? { ...location, pathname: '/' }
                : { ...location, pathname: '/about' }
            }
          >
            <BrandLogoD
              className="brand-logo"
              logoSrc={logoSrc}
              // envTag={envTag}
              // envTagBackgroundColor={backgroundColor}
              // envTagColor={textColor}
            />
          </Link>
        </Tooltip>
      }
    ></Route>
  )
})
