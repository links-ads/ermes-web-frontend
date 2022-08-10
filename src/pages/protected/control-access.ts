import {ROLE_ADMIN,ROLE_CITIZEN,ROLE_DECISION_MAKER,ROLE_FIRST_RESPONDER,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER} from '../../App.const';

//map each page to the list of account categories can access to
const accessPolicy = [
    //decision making routes
    {link:/^\/dashboard$/,users: [ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER, ROLE_CITIZEN]},
    {link:/^\/map$/,users: [ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER, ROLE_CITIZEN]},
    {link:/^\/details$/,users: [ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/social$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER, ROLE_CITIZEN]},
    {link:/^\/events$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER, ROLE_CITIZEN]},
    //user specific pages
    {link:/^\/device-auth$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER,ROLE_FIRST_RESPONDER, ROLE_CITIZEN]},
    {link:/^\/profile$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER,ROLE_FIRST_RESPONDER, ROLE_CITIZEN]},
    {link:/^\/settings$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER,ROLE_FIRST_RESPONDER, ROLE_CITIZEN]},
    //admin routes
    {link:/^\/administration$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/organizations$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/users$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/import$/,users:[ROLE_ADMIN]},
    {link:/^\/organizations\/users$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/organizations\/teams$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]}
]

export const controlAccess = (page,role) => {
    const pages = accessPolicy.filter(i=>i.link.test(page))
    if (pages.length === 0) return false
    const out = pages[0].users.includes(role)
    return out
  }
  