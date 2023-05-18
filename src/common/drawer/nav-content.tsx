import Divider from '@mui/material/Divider'
import Icon from '@mui/material/Icon'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import AccountCircle from '@mui/icons-material/AccountCircle'
import Dashboard from '@mui/icons-material/Dashboard'
import Map from '@mui/icons-material/Map'
import People from '@mui/icons-material/People'
import TwitterIcon from '@mui/icons-material/Twitter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Info from '@mui/icons-material/Info'
import Settings from '@mui/icons-material/Settings'
import SupervisedUserCircle from '@mui/icons-material/SupervisedUserCircle'
import Watch from '@mui/icons-material/Watch'
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PublishIcon from '@mui/icons-material/Publish';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import React, {useMemo} from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useUser } from '../../state/auth/auth.hooks'
import { UserRole } from 'ermes-ts-sdk'
import { useSidebarCollapse } from '@mui-treasury/layout/hooks';
import { controlAccess} from '../../pages/protected/control-access'; 
import { makeStyles } from 'tss-react/mui'

interface INavContentLinkConfig {
  primaryText: string
  icon: React.ReactNode
  to: string
}

type NavContentLinkConfig = INavContentLinkConfig | null

const personal: NavContentLinkConfig[] = [
  {
    primaryText: 'common:page_profile', // TODO use 18next dict keys
    icon: <AccountCircle />,
    to: '/profile'
  },
  {
    primaryText: 'common:page_dev_auth',
    icon: <Watch />,
    to: '/device-auth'
  },
  {
    primaryText: 'common:page_settings',
    icon: <Settings />,
    to: '/settings'
  }
]



const useStyles = makeStyles()((theme) => ({
  listItemStyle: {
    '&:hover': {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.primary.contrastText
    },
    '&active':{
      backgroundColor: theme.palette.background.default,
      color: theme.palette.primary.contrastText
    }
  },

  iconStyle: {
    minWidth: '46px',
    color: theme.palette.primary.contrastText,
    '&:hover': {
      color: theme.palette.primary.contrastText,
    }
  },
       
  drawerTextStyle: { 
    color: theme.palette.primary.contrastText,
    '&:hover': {
      color: theme.palette.primary.contrastText,
    }
  },

  drawerDividerStyle: { 
    backgroundColor: theme.palette.primary.contrastText,
    margin: '12px 0'
  },
  active: {
     backgroundColor: theme.palette.secondary.main,
   }


}))

// TODO org id, org Name (with support in translation, e.g. Edit {{orgName}})
const orgManagement = (oid: string): NavContentLinkConfig[] => [
  {
    primaryText: 'common:page_organization',
    icon: <SupervisedUserCircle />,
    // to: `/organizations/${oid}`
    to: `/organizations`
  },
  {
    primaryText: 'common:page_org_users',
    icon: <People />,
    // to: `/organizations/${oid}/users`
    to: `/organizations/users`
  },
  {
    primaryText: 'common:page_teams',
    icon: <GroupWorkIcon />,
    // to: `/organizations/${oid}/teams`
    to: `/organizations/teams`
  }
]

const decisionMaking: NavContentLinkConfig[] = [
  {
    primaryText: 'common:page_dashboard',
    icon: <Dashboard />,
    to: '/dashboard'
  },
  {
    primaryText: 'common:page_map',
    icon: <Map />,
    to: '/map'
  },
  {
    primaryText: 'common:page_social',
    icon: <TwitterIcon />,
    to: '/social'
  },
  {
    primaryText: 'common:page_events',
    icon: <CalendarTodayIcon />,
    to: '/events'
  }
]

const admin: NavContentLinkConfig[] = [
  // {
  //   primaryText: 'common:page_administration',
  //   icon: <Settings />,
  //   to: '/administration'
  // },
  // {
  //   primaryText: 'common:page_organizations',
  //   icon: <SupervisedUserCircle />,
  //   to: '/organizations'
  // },
  // {
  //   primaryText: 'common:page_users',
  //   icon: <People />,
  //   to: '/users'
  // }
  {
    primaryText: 'common:page_import',
    icon: <PublishIcon />,
    to: '/import'
  },
  {
    primaryText: 'common:page_uncompleted_users',
    icon: <PersonAddDisabledIcon />,
    to: '/uncompleted-users'
  }
]

function getLinks(role: UserRole, oid: string = 'unkn'): NavContentLinkConfig[] {
  let linksConfig: NavContentLinkConfig[] = []
  //check which admin and decision making content logged user can see
  const adminContent = admin.filter(i=>controlAccess(i?.to,role))
  if (adminContent.length > 0) 
    linksConfig = linksConfig.concat(adminContent,[null])

  const decisionMakingContent = decisionMaking.filter(i=>controlAccess(i?.to,role))
  if (decisionMakingContent.length > 0)
    linksConfig = linksConfig.concat(decisionMakingContent,[null])

  if(controlAccess('/organizations',role))
  {
    linksConfig = linksConfig.concat(orgManagement(oid),[null])

  }
  //personal content always visible to each ukind of user
  linksConfig = linksConfig.concat(personal)
  return [
    ...linksConfig,
    null,
    {
      primaryText: 'page_about',
      icon: <Info />,
      to: '/about'
    }
  ]
}

export function NavContent() {
  const { t } = useTranslation()
  const { profile } = useUser()
  const { state, /* setCollapsed, */ setOpen } = useSidebarCollapse('left_sidebar')
  const {classes} = useStyles()
  function onClickItem() {
    if (!state.collapsed) {
      if (state.open) {
        setOpen('left_sidebar', false)
      }
    }
    /*     if (state.open) {
      if (state.collapsed) {
        setCollapsed('left_sidebar', false)
      } else {
        setOpen('left_sidebar', false)
      }
    } */
  }

  const role: string = profile?.role || ''
  const organizationId: string = profile?.organization?.name || 'unkn'
  const list = useMemo(()=> getLinks(role as UserRole,organizationId), [
    role,
    organizationId
  ])

  return (
    <List>
      {list.map((config, i) => {
        if (config === null) {
          return <Divider key={i} className={classes.drawerDividerStyle}  />
        } else {
          const text: string = t(config.primaryText, { orgName: profile?.organization?.name || '' })
          return (
            <Tooltip key={i} title={text}>
              <ListItem  className={classes.listItemStyle}
                button
                onClick={onClickItem}
                component={NavLink}
                activeClassName={classes.active}
                exact={true}
                to={config.to}
              >
                <ListItemIcon onClick={onClickItem} className={classes.iconStyle} >
                  <Icon>{config.icon}</Icon>
                </ListItemIcon>
                <ListItemText  className={classes.drawerTextStyle}
                  onClick={onClickItem}
                  primary={text}
                  primaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            </Tooltip>
          )
        }
      })}
    </List>
  )
}
