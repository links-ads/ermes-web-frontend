import {ROLE_ADMIN,ROLE_DECISION_MAKER,ROLE_FIRST_RESPONDER,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER} from '../../App.const';

//map each page to the list of account categories can access to
const accessPolicy = [
    //decision making routes
    {link:/^\/dashboard$/,users: [ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/map$/,users: [ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/details$/,users: [ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/social$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/events$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    //user specific pages
    {link:/^\/device-auth$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER,ROLE_FIRST_RESPONDER]},
    {link:/^\/profile$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER,ROLE_FIRST_RESPONDER]},
    {link:/^\/settings$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER,ROLE_FIRST_RESPONDER]},
    //admin routes
    {link:/^\/administration$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/organizations$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/users$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    {link:/^\/import$/,users:[ROLE_ADMIN]},
    //specific organization route
    {link:/^\/organizations\/.+$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    //specific user route
    {link:/^\/users\/[\s|\S]{1,}$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    //users organization route
    {link:/^\/organizations\/[\s|\S]{1,}\/users$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    //specific user organization route
    {link:/^\/organizations\/[\s|\S]{1,}\/users\/[\s|\S]{1,}$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]},
    //specific organization teams route
    {link:/^\/organizations\/[\s|\S]{1,}\/teams$/,users:[ROLE_ADMIN,ROLE_ORGANIZATION_MANAGER,ROLE_TEAM_LEADER,ROLE_DECISION_MAKER]}
]

export const controlAccess = (page,role) => {
    const pages = accessPolicy.filter(i=>i.link.test(page))
    if (pages.length === 0) return false
    const out = pages[0].users.includes(role)
    return out
  }
  