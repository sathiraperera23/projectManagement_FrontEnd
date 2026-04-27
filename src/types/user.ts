export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: string;
  providerId: string;
  isActive: boolean;
  mobileNumber?: string;
  mobileVerified: boolean;
  hourlyRate?: number;
  dailyRate?: number;
  createdAt: string;
  lastLoginAt?: string;
  deactivatedAt?: string;
}

export interface UserInvitation {
  id: number;
  email: string;
  status: 'Pending' | 'Accepted' | 'Expired' | 'Revoked';
  invitedByUserId: number;
  invitedByName: string;
  projectId?: number;
  projectName?: string;
  roleId?: number;
  roleName?: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  isSystem: boolean;
  parentRoleId?: number;
  parentRoleName?: string;
  permissions: Permission[];
  createdAt: string;
}

export interface Permission {
  id: number;
  name: string;
  displayName: string;
  group: string;
  description: string;
}

export interface Team {
  id: number;
  name: string;
  projectId: number;
  description?: string;
  members: TeamMember[];
  createdAt: string;
}

export interface TeamMember {
  userId: number;
  displayName: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface InviteUserRequest {
  email: string;
  projectId?: number;
  roleId?: number;
}

export interface AcceptInvitationRequest {
  displayName: string;
  avatarUrl?: string;
}

export interface AssignRoleRequest {
  userId: number;
  projectId: number;
  roleId: number;
}

export interface UpdateProfileRequest {
  displayName: string;
  avatarUrl?: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  isDefault: boolean;
  parentRoleId?: number;
  permissionIds: number[];
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
  isDefault: boolean;
  parentRoleId?: number;
}

// All 31 permission groups matching the backend Permissions constants
export const PermissionGroups = {
  Project: [
    'CREATE_PROJECT',
    'EDIT_PROJECT',
    'ARCHIVE_PROJECT',
    'DELETE_PROJECT',
    'VIEW_ALL_PROJECTS',
  ],
  Product: [
    'CREATE_PRODUCT',
    'EDIT_PRODUCT',
    'MANAGE_RELEASE_NOTES',
    'VIEW_PRODUCT_BACKLOG',
  ],
  Ticket: [
    'CREATE_TICKET',
    'EDIT_OWN_TICKETS',
    'EDIT_ALL_TICKETS',
    'DELETE_TICKET',
    'REASSIGN_TICKET',
    'CHANGE_STATUS',
    'VIEW_ALL_TICKETS',
    'APPROVE_TICKETS',
  ],
  Backlog: [
    'MANAGE_BRDS',
    'MANAGE_USER_STORIES',
    'APPROVE_REQUIREMENTS',
  ],
  Sprint: [
    'CREATE_SPRINT',
    'CLOSE_SPRINT',
    'MOVE_TICKETS_TO_SPRINT',
  ],
  Report: [
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
    'VIEW_COSTING_DATA',
    'VIEW_BUDGET_DATA',
  ],
  Settings: [
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'MANAGE_NOTIFICATION_SETTINGS',
    'MANAGE_ACCESS_RULES',
  ],
} as const;
