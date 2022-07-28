import React, { useRef } from 'react'
import Avatar, { AvatarProps } from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Stars from '@material-ui/icons/Stars'
import { useClientSize } from '../../hooks/use-window-size.hook'
import { useUser } from '../../state/auth/auth.hooks'
import { Tooltip, useTheme } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useSidebarCollapse } from '@mui-treasury/layout/hooks'

const AvatarsContainer = styled.div.attrs({ className: 'avatars-container' })`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  overflow: hidden;
`

interface NavHeaderProps {
  collapsed: boolean
  open: boolean
}

const NavHeaderContainer = styled.div<NavHeaderProps>`
  padding: ${(props) => (props.collapsed ? 8 : 16)}px;
  transition: 0.3s;
  display: ${(props) => (props.open ? 'inherit' : 'none')};
  width: ${(props) => (props.open ? 'clamp(63px, 100%, 360px)' : 0)};
  overflow: hidden;
  .text-properties {
    width: 100%;
    color: ${(props) => props.theme.palette.primary.contrastText};
  }
  .secondary-text{
    width: 100%;
    color: ${(props) => props.theme.palette.primary.dark};
    font-weight: 200;
  }
`

const StyledAvatar = styled(Avatar)<{ large: string } & AvatarProps>`
  width: ${(props) => (props.large === 'true' ? 60 : 44)}px;
  height: ${(props) => (props.large === 'true' ? 60 : 44)}px;
  transition: 0.3s;
`

export function NavHeader() {
  const { state } = useSidebarCollapse('left_sidebar')
  const { collapsed, open } = state

  const headerRef = useRef<HTMLDivElement>(null)
  const size = useClientSize(headerRef, 0, 0)
  const isLarge = size.width > 63
  // console.debug('SIZE', size)

  const { profile } = useUser()
  const theme = useTheme()
  const { t } = useTranslation()
  const title: string = profile
    ? t('common:authenticated_as', { displayName: (profile?.user.displayName == null ? (profile?.user.username == null ? profile?.user.email : profile?.user.username) : profile?.user.displayName) })
    : ''
  return profile ? (
    <>
      <NavHeaderContainer
        ref={headerRef}
        className="nav-header"
        collapsed={!!collapsed}
        open={!!open}
      >
        <AvatarsContainer className="avatars-container">
          <Tooltip title={title}>
            <Link to="/profile">
              <StyledAvatar
                large={isLarge + ''}
                src={profile?.user.imageUrl || ''}
                alt="profile-image"
              />
            </Link>
          </Tooltip>
          {isLarge && profile?.organization?.name && (
            <Tooltip title={profile.organization?.name}>
              <Avatar
                style={{
                  width: 80,
                  height: 80,
                  transition: '0.3s',
                  backgroundColor: theme.palette.secondary.dark
                }}
              >
                <Stars style={{ fontSize: 60 }} />
              </Avatar>
            </Tooltip>
          )}
        </AvatarsContainer>
        <div className="padder" style={{ paddingBottom: 16 }} />
        {isLarge && (
          <div className="text-properties">
            <Typography variant={'h6'} noWrap>
              {profile.user.displayName}
            </Typography>
            <Typography  noWrap gutterBottom>
              {profile.user.username}
            </Typography>
            <Typography noWrap gutterBottom>
              {profile.user.email}
            </Typography>
            <Typography noWrap gutterBottom>
              {t('common:' + profile.role)}
            </Typography>
          </div>
        )}
      </NavHeaderContainer>
      <Divider style={{ backgroundColor: theme.palette.primary.contrastText}}/>
    </>
  ) : null
}
