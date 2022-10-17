import React, { memo, useContext, useEffect, useMemo } from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'

import Typography from '@material-ui/core/Typography'

import { useTranslation } from 'react-i18next'
import { /* useAuth */ useLogout, useUser } from '../../../state/auth/auth.hooks'

import styled from 'styled-components'
import { RefreshButton } from '../../../common/common.components'
import MaterialTable, { Column, Options } from 'material-table'
import useLeaderboard from '../../../hooks/use-gamification.hook'
import { AppConfig, AppConfigContext } from '../../../config'

const options: Options<any> = {
  sorting: false,
  search: false,
paging:false


}


const isDebug = process.env.NODE_ENV !== 'production'

export const UserLeaderboard = memo(function UserLeaderboard() {
  const { t } = useTranslation()
  const { profile } = useUser()
  const { statsState, fetchLeaderboard } = useLeaderboard()

  useEffect(() => {
    fetchLeaderboard( {
      headers: {
        Accept: 'application/json'
      }
    } )
  }, [])
  const appConfig = useContext<AppConfig>(AppConfigContext)

  return profile ? (
    <Card style={{ marginTop: '32px',
            
    width:'95%' }}>
      
      <CardContent  style={{ paddingTop:'0px !important' }}>
      <div   style={{
      //  height: '300px',
            overflowY:'auto'
          }}>
        <MaterialTable
isLoading={statsState.isLoading}
          style={{
            width: '100%',
            height: '100%'
          }}
          title={
            <Typography variant="h5" component="span">
              {t('common:leaderboard')}
              <RefreshButton
                onClick={() =>
                  fetchLeaderboard( {
                    headers: {
                      Accept: 'application/json'
                    }
                  } )
                }
              />
            </Typography>
          }
          options={options}
          //options={{ ...options, minBodyHeight: bodyHeight, maxBodyHeight: bodyHeight }}
          //localization={localization}
          data={statsState.data.competitors}
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
           { title: t('common:nickname'), field: 'displayName' == null ? 'username' : 'displayName'},
           { title: t('common:leader_points'), field:'points'},
            { title: t('common:leader_gpos'), field:'position'},
            { title: t('common:leader_level'), field:'levelName'},
            {
              //title: t('admin:user_avatar'),
              title: t('common:icon'),
              field: 'levelName',
              
              render: (rowData) => (
            
                <img
                  alt= {t('common:image_not_available')}
                  src={appConfig.gamificationUrl + "levels/" + rowData.levelName+'.svg'} 
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
