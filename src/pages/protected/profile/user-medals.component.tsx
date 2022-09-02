import React, { memo } from 'react'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import MaterialTable, { Column, Options } from 'material-table'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useTranslation } from 'react-i18next'
import {  useUser } from '../../../state/auth/auth.hooks'
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

const StyledTable = styled(MaterialTable)`
  .mat-table{
    overflow-x: scroll;
    overflow-y: auto;
      }
  .mat-cell, .mat-header-cell {

  }
`


const options: Options<any> = {
  sorting: false,
  search: false,
  pageSize: 5,
  pageSizeOptions: [5],
//paging:false,
  // addRowPosition: 'first',
  actionsColumnIndex: -1,
  rowStyle: {paddingTop:'0px', paddingBottom:'0px'},
  emptyRowsWhenPaging:false,
  padding:'dense',
//  paginationType:'stepped',
}
export const UserMedals = memo(function UserMedals() {
  const { t } = useTranslation()
  // const { logout, user } = useAuth()

  const { profile } = useUser()
  const uMedals = (profile as any).medals
//console.log('med',uMedals)
  return profile ? (
    <Card style={{ margin: 'auto',
            
    paddingTop:'0px !important' }}>
      
      <CardContent  style={{ paddingTop:'0px !important' }}>
      <div   style={{
      //  height: '300px',
            overflowY:'auto'
          }}>
        <StyledTable

          style={{
            width: '100%',
            height: '100%'
          }}
          title={
            <Typography variant="h5" component="span">
              {t('common:medals')}

            </Typography>
          }
  
          options={{...options, minBodyHeight: '326px', maxBodyHeight: '326px'}}
          //localization={localization}
          data={uMedals}
          columns={ 
            [
            // {
            //   title: 'Icon',
            //   field: 'user.imageUrl',
            //   render: (uMedals) => (
            //     <img
            //       alt="profile"
            //       src={
            //         uMedals.user.imageUrl
            //           ? rowData.user.imageUrl
            //           : 'https://via.placeholder.com/40x40.png?text=' + t('common:image_not_available')
            //       }
            //       style={{ width: 40, borderRadius: '50%' }}
            //     />
            //   ),
            //   initialEditValue: ''
            // },
           // { title: t('admin:user_username'), field: 'user.displayName' == null ? ('user.username' == null ? 'user.email' : 'user.username') : 'user.displayName'},
           {
            //title: t('admin:user_avatar'),
            title: t('common:icon'),
            field: 'name',
            
            render: (rowData) => (
          
              <img
                alt= {t('common:image_not_available')}
                src={process.env.PUBLIC_URL + "/svg/gamification/medals/" + (rowData as any).name+'.svg'} 
                // src={
                //   !!rowData.competitors.levelName
                //     ? rowData.user.imageUrl
                //     : 'https://via.placeholder.com/40x40.png?text=' + t('common:image_not_available')
                // }
                style={{ width: 40, borderRadius: '50%' }}
              />
            ),
            initialEditValue: ''
          },
            { title: t('common:description'), field:'name'},
        
          ]}

        />
      </div>




        {/* <AvatarContainer>
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
        )} */}
      </CardContent>

    </Card>
  ) : null
})
