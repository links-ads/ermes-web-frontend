import Divider from '@material-ui/core/Divider'
import Icon from '@material-ui/core/Icon'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Dashboard from '@material-ui/icons/Dashboard'
import Map from '@material-ui/icons/Map'
import People from '@material-ui/icons/People'
import TwitterIcon from '@material-ui/icons/Twitter';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import Info from '@material-ui/icons/Info'
import Settings from '@material-ui/icons/Settings'
import SupervisedUserCircle from '@material-ui/icons/SupervisedUserCircle'
import Watch from '@material-ui/icons/Watch'
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useUser } from '../../state/auth/auth.hooks'
import { UserRole } from 'ermes-ts-sdk'
import { useSidebarCollapse } from '@mui-treasury/layout/hooks'
import { controlAccess } from '../../pages/protected/control-access'


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

// TODO org id, org Name (with support in translation, e.g. Edit {{orgName}})
const orgManagement = (oid: string): NavContentLinkConfig[] => [
  {
    primaryText: 'common:page_organization',
    icon: <SupervisedUserCircle />,
    to: `/organizations/${oid}`
  },
  {
    primaryText: 'common:page_org_users',
    icon: <People />,
    to: `/organizations/${oid}/users`
  },
  {
    primaryText: 'common:page_teams',
    icon: <GroupWorkIcon />,
    to: `/organizations/${oid}/teams`
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
  {
    primaryText: 'common:page_administration',
    icon: <Settings />,
    to: '/administration'
  },
  {
    primaryText: 'common:page_organizations',
    icon: <SupervisedUserCircle />,
    to: '/organizations'
  },
  {
    primaryText: 'common:page_users',
    icon: <People />,
    to: '/users'
  }
]

function getLinks(role: UserRole, oid: string = 'unkn'): NavContentLinkConfig[] {
  let linksConfig: NavContentLinkConfig[] = []
  // switch (role) {
  //   case 'administrator':
  //     linksConfig = [...admin, null, ...decisionMaking, null, ...personal]
  //     break
  //   case 'organization_manager':
  //     linksConfig = [...decisionMaking, null, ...orgManagement(oid), null, ...personal]
  //     break
  //   case 'decision_maker':
  //     linksConfig = [...decisionMaking, null, ...personal]
  //     break
  //   case 'first_responder':
  //     linksConfig = personal
  //     break
  //   default:
  //     break
  // }

  //check which admin content can see
  linksConfig = linksConfig.concat(admin.filter(i=>controlAccess(i?.to,role)),[null])
  //check which decision making content can see
  linksConfig = linksConfig.concat(decisionMaking.filter(i=>controlAccess(i?.to,role)),[null])
  //check whether user can see organizations content
  if(controlAccess('/organizations/',role))
  {
    linksConfig = linksConfig.concat(orgManagement(oid),[null])

  }
  //personal content always visible
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
  const linksConfig = useCallback<(UserRole, string) => NavContentLinkConfig[]>(getLinks, [
    role,
    organizationId
  ])
  const list: NavContentLinkConfig[] = linksConfig(role, organizationId)

  return (
    <List>
      {list.map((config, i) => {
        if (config === null) {
          return <Divider key={i} style={{ margin: '12px 0' }} />
        } else {
          const text: string = t(config.primaryText, { orgName: profile?.organization?.name || '' })
          return (
            <Tooltip key={i} title={text}>
              <ListItem
                button
                onClick={onClickItem}
                component={NavLink}
                activeClassName="Mui-selected"
                exact={true}
                to={config.to}
              >
                <ListItemIcon onClick={onClickItem} style={{ minWidth: 46 }}>
                  <Icon>{config.icon}</Icon>
                </ListItemIcon>
                <ListItemText
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
