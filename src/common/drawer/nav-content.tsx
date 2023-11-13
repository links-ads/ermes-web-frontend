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
import TwitterIcon from '@material-ui/icons/Twitter'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import Info from '@material-ui/icons/Info'
import Settings from '@material-ui/icons/Settings'
import SupervisedUserCircle from '@material-ui/icons/SupervisedUserCircle'
import Watch from '@material-ui/icons/Watch'
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import PublishIcon from '@material-ui/icons/Publish'
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useUser } from '../../state/auth/auth.hooks'
import { UserRole } from 'ermes-ts-sdk'
import { useSidebarCollapse } from '@mui-treasury/layout/hooks'
import { controlAccess } from '../../pages/protected/control-access'
import { SvgIcon, makeStyles } from '@material-ui/core'
import { Event, Person } from '@material-ui/icons'

interface INavContentLinkConfig {
  primaryText: string
  icon: React.ReactNode
  to: string
}

type NavContentLinkConfig = INavContentLinkConfig | null

const MapIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M152 228 c-18 -18 -15 -43 8 -69 l20 -24 20 24 c32 37 21 81 -20 81
-9 0 -21 -5 -28 -12z m38 -28 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5
10 10 10 6 0 10 -4 10 -10z"
        />
        <path
          d="M58 198 c-27 -9 -28 -12 -28 -89 0 -43 2 -79 4 -79 3 0 16 4 30 10
17 6 35 6 52 -1 19 -6 37 -6 60 1 31 11 34 15 34 51 0 24 -4 38 -10 34 -5 -3
-10 -19 -10 -36 0 -19 -5 -29 -15 -29 -10 0 -15 10 -15 34 0 19 -4 38 -10 41
-6 4 -10 -10 -10 -35 0 -34 -3 -41 -17 -38 -14 2 -19 15 -21 57 -2 34 1 57 9
61 14 9 3 30 -14 29 -7 0 -24 -5 -39 -11z m22 -78 c0 -47 -3 -60 -15 -60 -12
0 -15 13 -15 60 0 47 3 60 15 60 12 0 15 -13 15 -60z"
        />
      </g>
    </SvgIcon>
  )
}

const GraphsIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M160 120 l0 -80 30 0 30 0 0 80 0 80 -30 0 -30 0 0 -80z m40 0 c0
-33 -4 -60 -10 -60 -6 0 -10 27 -10 60 0 33 4 60 10 60 6 0 10 -27 10 -60z"
        />
        <path
          d="M90 100 l0 -60 30 0 30 0 0 60 0 60 -30 0 -30 0 0 -60z m40 0 c0 -22
-4 -40 -10 -40 -5 0 -10 18 -10 40 0 22 5 40 10 40 6 0 10 -18 10 -40z"
        />
        <path
          d="M20 80 c0 -38 2 -40 30 -40 28 0 30 2 30 40 0 38 -2 40 -30 40 -28 0
-30 -2 -30 -40z m40 0 c0 -11 -4 -20 -10 -20 -5 0 -10 9 -10 20 0 11 5 20 10
20 6 0 10 -9 10 -20z"
        />
      </g>
    </SvgIcon>
  )
}

const ConnectIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M167 204 c-4 -4 -7 -15 -7 -24 0 -21 -31 -50 -53 -50 -10 0 -26 5
-36 12 -24 15 -51 4 -51 -22 0 -26 27 -37 51 -22 39 25 82 4 91 -43 2 -14 11
-20 28 -20 20 0 25 5 25 25 0 18 -6 26 -22 28 -12 2 -27 10 -33 18 -16 18 1
41 33 46 30 4 31 52 2 56 -12 2 -24 0 -28 -4z"
        />
      </g>
    </SvgIcon>
  )
}

const SchoolBuildingIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M93 218 c-14 -7 -23 -20 -23 -34 0 -16 -7 -24 -22 -26 -21 -3 -23 -9
-26 -70 l-3 -68 101 0 101 0 -3 68 c-3 61 -5 67 -25 70 -16 2 -23 10 -23 26 0
15 -9 27 -25 34 -14 7 -27 12 -28 11 -1 0 -12 -5 -24 -11z m37 -48 c0 -5 -4
-10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z m-50 -60 c0
-5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z m50 0
c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z m50
0 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z
m-100 -40 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4
10 -10z m50 -10 c0 -11 -4 -20 -10 -20 -5 0 -10 9 -10 20 0 11 5 20 10 20 6 0
10 -9 10 -20z m50 10 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10
6 0 10 -4 10 -10z"
        />
      </g>
    </SvgIcon>
  )
}

const UploadIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M85 190 c-28 -29 -28 -30 -7 -30 19 0 22 -5 22 -45 0 -38 3 -45 20
-45 17 0 20 7 20 45 0 40 3 45 22 45 21 0 21 1 -7 30 -16 17 -32 30 -35 30 -3
0 -19 -13 -35 -30z"
        />
        <path
          d="M20 30 c0 -6 40 -10 100 -10 60 0 100 4 100 10 0 6 -40 10 -100 10
-60 0 -100 -4 -100 -10z"
        />
      </g>
    </SvgIcon>
  )
}

const WatchesFrontViewIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <g
        transform="translate(0.000000,24.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="none"
      >
        <path
          d="M80 227 c0 -7 -9 -29 -20 -50 -25 -46 -25 -68 0 -114 11 -21 20 -43
20 -50 0 -8 14 -13 40 -13 26 0 40 5 40 13 0 7 9 29 20 50 25 46 25 68 0 114
-11 21 -20 43 -20 50 0 8 -14 13 -40 13 -26 0 -40 -5 -40 -13z m80 -67 c11
-11 20 -29 20 -40 0 -26 -34 -60 -60 -60 -26 0 -60 34 -60 60 0 26 34 60 60
60 11 0 29 -9 40 -20z"
        />
        <path
          d="M110 135 c0 -18 5 -25 20 -25 11 0 20 5 20 10 0 6 -4 10 -10 10 -5 0
-10 7 -10 15 0 8 -4 15 -10 15 -5 0 -10 -11 -10 -25z"
        />
      </g>
    </SvgIcon>
  )
}

const useStyles = makeStyles((theme) => ({
  listItemStyle: {
    '&:hover': {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.primary.contrastText
    },
    '&active': {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.primary.contrastText
    }
  },
  iconStyle: {
    minWidth: '46px',
    color: theme.palette.primary.contrastText,
    '&:hover': {
      color: theme.palette.primary.contrastText
    }
  },
  drawerTextStyle: {
    color: theme.palette.primary.contrastText,
    '&:hover': {
      color: theme.palette.primary.contrastText
    }
  },
  drawerDividerStyle: {
    backgroundColor: theme.palette.primary.contrastText,
    margin: '12px 0'
  },
  active: {
    backgroundColor: theme.palette.secondary.main
  }
}))

const personal: NavContentLinkConfig[] = [
  {
    primaryText: 'common:page_profile', // TODO use 18next dict keys
    icon: <AccountCircle />,
    to: '/profile'
  },
  {
    primaryText: 'common:page_dev_auth',
    icon: <WatchesFrontViewIcon />,
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
    primaryText: 'common:page_org_users',
    icon: <Person />,
    // to: `/organizations/${oid}/users`
    to: `/organizations/users`
  },
  {
    primaryText: 'common:page_teams',
    icon: <ConnectIcon />,
    // to: `/organizations/${oid}/teams`
    to: `/organizations/teams`
  },
  {
    primaryText: 'common:page_organization',
    icon: <SchoolBuildingIcon />,
    // to: `/organizations/${oid}`
    to: `/organizations`
  }
]

const decisionMaking: NavContentLinkConfig[] = [
  {
    primaryText: 'common:page_map',
    icon: <MapIcon />,
    to: '/map'
  },
  {
    primaryText: 'common:page_dashboard',
    icon: <GraphsIcon />,
    to: '/dashboard'
  }
]

const eventDecisionMaking: NavContentLinkConfig[] = [
  {
    primaryText: 'common:page_social',
    icon: <TwitterIcon />,
    to: '/social'
  },
  {
    primaryText: 'common:page_events',
    icon: <Event />,
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
    icon: <UploadIcon />,
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

  const decisionMakingContent = decisionMaking.filter((i) => controlAccess(i?.to, role))
  if (decisionMakingContent.length > 0)
    linksConfig = linksConfig.concat(decisionMakingContent, [null])

  const eventDecisionMakingContent = eventDecisionMaking.filter((i) => controlAccess(i?.to, role))
  if (eventDecisionMakingContent.length > 0)
    linksConfig = linksConfig.concat(eventDecisionMakingContent, [null])

  if (controlAccess('/organizations', role)) {
    linksConfig = linksConfig.concat(orgManagement(oid), [null])
  }

  //personal content always visible to each ukind of user
  linksConfig = linksConfig.concat(personal, [null])

  //check which admin and decision making content logged user can see
  const adminContent = admin.filter((i) => controlAccess(i?.to, role))
  if (adminContent.length > 0) linksConfig = linksConfig.concat(adminContent)

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
  const classes = useStyles()
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
  const list = useMemo(() => getLinks(role as UserRole, organizationId), [role, organizationId])

  return (
    <List>
      {list.map((config, i) => {
        if (config === null) {
          return <Divider key={i} className={classes.drawerDividerStyle} />
        } else {
          const text: string = t(config.primaryText, { orgName: profile?.organization?.name || '' })
          return (
            <Tooltip key={i} title={text}>
              <ListItem
                className={classes.listItemStyle}
                button
                onClick={onClickItem}
                component={NavLink}
                activeClassName={classes.active}
                exact={true}
                to={config.to}
              >
                <ListItemIcon onClick={onClickItem} className={classes.iconStyle}>
                  <Icon>{config.icon}</Icon>
                </ListItemIcon>
                <ListItemText
                  className={classes.drawerTextStyle}
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
