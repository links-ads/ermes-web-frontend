import React, { memo } from 'react'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import { Link } from 'react-router-dom'
import Watch from '@material-ui/icons/Watch'
import Exit from '@material-ui/icons/ExitToApp'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useTranslation } from 'react-i18next'
import { /* useAuth */ useLogout, useUser } from '../../../state/auth/auth.hooks'
import { Avatar } from '@material-ui/core'
import styled from 'styled-components'
const AvatarContainer = styled.div.attrs({ className: 'avatar-container' })`
  display: flex;
  flex-grow: 1;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 32px 16px 32px;
  box-sizing: border-box;
`

const StyledCardActions = styled(CardActions)`
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: space-between;

  .MuiButton-contained:nth-child(2) {
    min-width: 120px;
    ${(props) => props.theme.breakpoints.down('xs')} {
      margin: 8px 0;
    }
  }
`

const USER_KEYS = [
  ['user_first_name', 'firstName'],
  ['user_middle_name', 'middleName'],
  ['user_last_name', 'lastName'],
  ['user_birth_date', 'birthDate'],
  ['user_email', 'email'],
  ['user_role', 'role'],
  ['org_name', 'organization.name']
]

const isDebug = process.env.NODE_ENV !== 'production'

export const UserCard = memo(function UserCard() {
  const { t } = useTranslation()
  // const { logout, user } = useAuth()
  const logout = useLogout()
  const { profile } = useUser()

  return profile ? (
    <Card style={{ margin: 'auto' }}>
      <CardHeader title={t('common:authenticated_as', { displayName: (profile.user.displayName == null ? (profile.user.username == null ? profile.user.email : profile.user.username) : profile.user.displayName)  })} />
      <CardContent>
        <AvatarContainer>
          <Avatar
            style={{
              width: 80,
              height: 80
            }}
            src={profile.user.imageUrl || ''}
            alt="user-profile"
          />
        </AvatarContainer>
        {isDebug && (
          <Typography variant="body2" color="textSecondary" component="p">
            <b>Id: </b> {profile.user.id}
          </Typography>
        )}
        {USER_KEYS.map(([tkey, userField], i) =>
          profile[userField] || profile.user[userField] ? (
            <Typography key={i} variant="body2" color="textSecondary" component="p">
              {t(tkey, {
                [userField]:
                  userField === 'role'
                    ? t('common:role_' + profile.role)
                    : userField === 'organization' && typeof profile[userField] !== 'undefined'
                    ? profile?.organization?.name
                    : profile.user[userField]
              })}
            </Typography>
          ) : null
        )}
      </CardContent>
      <StyledCardActions>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/device-auth"
          startIcon={<Watch />}
        >
          {t('common:page_dev_auth')}
        </Button>
        <Button variant="contained" color="secondary" onClick={logout} startIcon={<Exit />}>
          {t('common:logout')}
        </Button>
      </StyledCardActions>
    </Card>
  ) : null
})
