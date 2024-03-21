// Configuration for FusionAuth Implicit Grant
// Ensure you don't have another FusionAuth session open, or use an anonymous window
export const SCOPE = ['openid']

// Permissions for the application
export enum PermissionEntity {
  MISSION = 'Missions',
  MAP_REQUEST = 'MapRequests',
  COMMUNICATION = 'Communications',
  TEAM = 'Teams',
  ORGANIZATION = 'Organizations'
}

export enum PermissionGranularity {
  PARENT = 'Father',
  CHILD = 'Child'
}

export enum PermissionAction {
  CREATE = 'CanCreate',
  UPDATE = 'CanUpdate',
  UPDATE_ALL = 'CanUpdateAll',
  DELETE = 'CanDelete'
}
