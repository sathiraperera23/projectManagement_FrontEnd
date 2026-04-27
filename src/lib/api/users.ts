import api from '@/lib/axios';
import {
  UpdateProfileRequest,
  InviteUserRequest,
  AcceptInvitationRequest,
  AssignRoleRequest,
  CreateRoleRequest,
  UpdateRoleRequest
} from '@/types/user';

export const usersApi = {
  // ── Users ─────────────────────────────────────────────
  getAll: async () => {
    const { data } = await api.get('/api/users');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/users/${id}`);
    return data;
  },
  deactivate: async (id: number) => {
    await api.put(`/api/users/${id}/deactivate`);
  },
  reactivate: async (id: number) => {
    await api.put(`/api/users/${id}/reactivate`);
  },
  updateProfile: async (request: UpdateProfileRequest) => {
    const { data } = await api.put('/api/users/me/profile', request);
    return data;
  },

  // ── Invitations ───────────────────────────────────────
  invite: async (request: InviteUserRequest) => {
    const { data } = await api.post('/api/users/invite', request);
    return data;
  },
  getInvitations: async () => {
    const { data } = await api.get('/api/users/invitations');
    return data;
  },
  revokeInvitation: async (id: number) => {
    await api.delete(`/api/users/invitations/${id}`);
  },
  acceptInvitation: async (token: string, request: AcceptInvitationRequest) => {
    const { data } = await api.post('/api/users/accept-invitation', {
      token,
      ...request
    });
    return data;
  },

  // ── User project roles ────────────────────────────────
  assignRole: async (projectId: number, request: AssignRoleRequest) => {
    await api.post(`/api/projects/${projectId}/user-roles`, request);
  },
  removeRole: async (projectId: number, userId: number) => {
    await api.delete(`/api/projects/${projectId}/user-roles/${userId}`);
  },
  getUserPermissions: async (projectId: number, userId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/user-roles/${userId}/permissions`
    );
    return data;
  },
};

export const rolesApi = {
  // ── Roles ─────────────────────────────────────────────
  getAll: async () => {
    const { data } = await api.get('/api/roles');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/roles/${id}`);
    return data;
  },
  create: async (request: CreateRoleRequest) => {
    const { data } = await api.post('/api/roles', request);
    return data;
  },
  update: async (id: number, request: UpdateRoleRequest) => {
    const { data } = await api.put(`/api/roles/${id}`, request);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/roles/${id}`);
  },
  updatePermissions: async (id: number, permissionIds: number[]) => {
    await api.put(`/api/roles/${id}/permissions`, { permissionIds });
  },
  getAllPermissions: async () => {
    const { data } = await api.get('/api/roles/permissions');
    return data;
  },
};
