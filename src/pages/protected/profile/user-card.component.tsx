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
import { useUser } from '../../../state/auth/auth.hooks'
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
  ['org_name', 'organization.name'],
  ['user_current_status', 'currentStatus'],
  ['user_team', 'team']
]

const isDebug = process.env.NODE_ENV !== 'production'

export const UserCard = memo(function UserCard() {
  const { t } = useTranslation()

  const { profile } = useUser()

  return profile ? (
    <Card style={profile.role !== 'citizen' ? { margin: 'auto'} : { margin: 'auto', height:'100%', width:'100%' }}
    
    >
      <CardHeader title={t('common:authenticated_as', { displayName: profile.user.displayName })} />
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
          <div style={{display:'flex'}}>
             <Typography variant="body2" color="textSecondary" component="p"  style={{ textTransform: 'uppercase', marginRight:'5px', fontWeight:'bold' }}>
             Id: 
           </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
         {profile.user.id}
          </Typography>
          </div>
        )}
        {profile.role !== 'citizen' ? (USER_KEYS.map(([tkey, userField], i) =>
          profile[userField] || profile.user[userField] ? (
            <div style={{display:'flex'}}>
              <Typography variant="body2" color="textSecondary" component="p"  style={{ textTransform: 'uppercase', marginRight:'5px', fontWeight:'bold' }}>
              {t('admin:'+tkey)}
           </Typography>
           <Typography variant="body2" color="textSecondary" component="p"  >
           {
               userField === 'role'
                 ? t('common:role_' + profile.role) : ((userField === 'organization' && typeof profile[userField] !== 'undefined')
                     ? profile?.organization?.name : (userField === 'currentStatus' && typeof profile[userField] !== 'undefined') ? profile.currentStatus 
                 : profile.user[userField]) 
           }
           </Typography>
            </div>
          ) : null
        )) : (
          <div>
 <div style={{display:'flex'}}>
<Typography variant="body2" color="textSecondary" component="p"  style={{ textTransform: 'uppercase', marginRight:'5px', fontWeight:'bold' }}>
           { t('labels:username')+':'}
           </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
         {profile.user.displayName}
          </Typography>
          </div>
    
        { !!(profile as any).level ? (
 <div style={{display:'flex'}}>

<Typography variant="body2" color="textSecondary" component="p"  style={{ textTransform: 'uppercase', marginRight:'5px', fontWeight:'bold' }}>
           {  t('common:user_level')}
           </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
         {(profile as any).level}
          </Typography>
  
        </div>
        ) : null}
        </div>
        )}
      </CardContent>
      {profile.role !== 'citizen' ? (
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
      </StyledCardActions>) : null}
    </Card>
  ) : null
})
