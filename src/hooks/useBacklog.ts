import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backlogApi } from '@/lib/api/backlog';

export function useProjectBacklog(projectId: number) {
  return useQuery({
    queryKey: ['backlog', projectId],
    queryFn: () => backlogApi.getProjectBacklog(projectId),
    enabled: !!projectId,
  });
}

export function useBacklogItem(id: number) {
  return useQuery({
    queryKey: ['backlog-item', id],
    queryFn: () => backlogApi.getBacklogItem(id),
    enabled: !!id,
  });
}

export function useCreateBacklogItem(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: any) => backlogApi.createBacklogItem(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog', projectId] });
    },
  });
}

export function useUpdateBacklogItem(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: any }) =>
      backlogApi.updateBacklogItem(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['backlog', projectId] });
      queryClient.invalidateQueries({ queryKey: ['backlog-item', variables.id] });
    },
  });
}

export function useBacklogVersions(id: number) {
  return useQuery({
    queryKey: ['backlog-versions', id],
    queryFn: () => backlogApi.getItemVersions(id),
    enabled: !!id,
  });
}

export function useBacklogApprovals(id: number) {
  return useQuery({
    queryKey: ['backlog-approvals', id],
    queryFn: () => backlogApi.getApprovalRequests(id),
    enabled: !!id,
  });
}

export function useRequestApproval(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: any) => backlogApi.requestApproval(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-approvals', id] });
    },
  });
}
