import React, { memo, useContext } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import MaterialTable, { Column, Options } from 'material-table'
import Typography from '@material-ui/core/Typography'
import { useTranslation } from 'react-i18next'
import {  useUser } from '../../../state/auth/auth.hooks'
import { AppConfig, AppConfigContext } from '../../../config'
const options: Options<any> = {
  sorting: false,
  search: false,
  pageSize: 5,
 pageSizeOptions: [5],
  emptyRowsWhenPaging:false,
  padding:'dense',

}
export const UserBadges = memo(function UserBadges() {
  const { t } = useTranslation()
  // const { logout, user } = useAuth()

  const { profile } = useUser()
  const uBadges = (profile as any).badges
  const appConfig = useContext<AppConfig>(AppConfigContext)

  return profile ? (
    <Card style={{ margin: 'auto',
            
    paddingTop:'0px !important' }}>
      
      <CardContent style={{ paddingTop:'0px !important' }}>
      <div   style={{
  
            overflowY:'auto',
          }}>
        <MaterialTable

          style={{
            width: '100%',
            height: '100%'
          }}
          title={
            <Typography variant="h5" component="span">
              {t('common:badges')}

            </Typography>
          }
          //options={options}
          options={{ ...options, minBodyHeight: '326px', maxBodyHeight: '326px' }}
          data={uBadges}
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
                src={appConfig.gamificationUrl + "badges/" +(rowData as any).name+'.svg'} 
                style={{ width: 40, borderRadius: '50%' }}
              />
            ),
            initialEditValue: ''
          },
           { title: t('common:description'),
            field:'name',
            render:(rowData)=>(
              <Typography>
          {t('gamification:'+ rowData.name.toLowerCase())}
            </Typography>
            )
          },
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
