import React from 'react'
import { UserCard } from './user-card.component'
import { UserBadges } from './user-badges.component';
import { Grid } from '@mui/material';
import { UserMedals } from './user-medals.component';
import { UserLeaderboard } from './user-leaderboard.component';
import { useUser } from '../../../state/auth/auth.hooks'
import { ROLE_CITIZEN } from '../../../App.const';

export function Profile() {
  const { profile } = useUser()

  return profile?.role === ROLE_CITIZEN ? (
    <div style={{ height: 'inherit', overflowX: 'hidden', overflowY: 'auto' }}>
      <Grid container spacing={1} style={{ marginTop: '10px',  marginBottom: '32px', justifyContent: 'space-evenly' }}>
      <Grid container spacing={1} style={{ marginTop: '10px', justifyContent: 'space-between', width:'95%' }}>
        <Grid item xs={12} sm={6} md={4} lg={4} 
        style={{flex:'auto'}}>
          <div style={{height:'100%'}}>
            <UserCard />
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={8} lg={4}
        style={{flex:'auto'}}>
          <div >

            <UserBadges />
          </div>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={4}
        style={{flex:'auto'}}>
          <div >

            <UserMedals />
          </div>
        </Grid>
      </Grid>
<UserLeaderboard />
</Grid>
    </div>
  ) : (
    <div className="full column centered">
      <UserCard />
    </div>
  )
}
