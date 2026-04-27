import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, rolesApi } from '@/lib/api/users';
import type {
  InviteUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
} from '@/types/user';

// ── User hooks ─────────────────────────────────────────
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    staleTime: 60 * 1000,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: usersApi.getInvitations,
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: InviteUserRequest) =>
      usersApi.invite(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

// ── Bug Queue hooks ────────────────────────────────────
export function useBugApprovalQueue(projectId: number) {
  const { bugReportApi } = require('@/lib/api/bugReport');
  return useQuery({
    queryKey: ['bug-approval-queue', projectId],
    queryFn: () => bugReportApi.getApprovalQueue(projectId),
    enabled: !!projectId,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useBugSubmissions(projectId: number) {
  const { bugReportApi } = require('@/lib/api/bugReport');
  return useQuery({
    queryKey: ['bug-submissions', projectId],
    queryFn: () => bugReportApi.getSubmissions(projectId),
    enabled: !!projectId,
  });
}

export function useApproveBug(projectId: number) {
  const queryClient = useQueryClient();
  const { bugReportApi } = require('@/lib/api/bugReport');
  return useMutation({
    mutationFn: (ticketId: number) => bugReportApi.approve(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bug-approval-queue', projectId]
      });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}

export function useRejectBug(projectId: number) {
  const queryClient = useQueryClient();
  const { bugReportApi } = require('@/lib/api/bugReport');
  return useMutation({
    mutationFn: ({ ticketId, reason }: { ticketId: number; reason: string }) =>
      bugReportApi.reject(ticketId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bug-approval-queue', projectId]
      });
    },
  });
}

export function useRequestMoreInfo(projectId: number) {
  const queryClient = useQueryClient();
  const { bugReportApi } = require('@/lib/api/bugReport');
  return useMutation({
    mutationFn: ({ ticketId, message }: {
      ticketId: number; message: string
    }) => bugReportApi.requestMoreInfo(ticketId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bug-approval-queue', projectId]
      });
    },
  });
}

export function useBugSla(projectId: number) {
  const { bugReportApi } = require('@/lib/api/bugReport');
  return useQuery({
    queryKey: ['bug-sla', projectId],
    queryFn: () => bugReportApi.getSla(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateBugSla(projectId: number) {
  const queryClient = useQueryClient();
  const { bugReportApi } = require('@/lib/api/bugReport');
  return useMutation({
    mutationFn: (request: any) =>
      bugReportApi.updateSla(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-sla', projectId] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.reactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.revokeInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useAssignRole(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AssignRoleRequest) =>
      usersApi.assignRole(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ── Role hooks ─────────────────────────────────────────
export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRole(id: number) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: rolesApi.getAllPermissions,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateRoleRequest) =>
      rolesApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateRole(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateRoleRequest) =>
      rolesApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', id] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rolesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateRolePermissions(roleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionIds: number[]) =>
      rolesApi.updatePermissions(roleId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
