import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintsApi } from '@/lib/api/sprints';
import type {
  CreateSprintRequest,
  UpdateSprintRequest,
  CloseSprintRequest,
  SetMemberCapacityRequest,
} from '@/types/sprint';

export function useSprints(projectId: number) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintsApi.getAll(projectId),
    enabled: !!projectId,
  });
}

export function useActiveSprint(projectId: number, subProjectId?: number) {
  return useQuery({
    queryKey: ['active-sprint', projectId, subProjectId],
    queryFn: () => sprintsApi.getActive(projectId, subProjectId),
    enabled: !!projectId,
  });
}

export function useSprintCapacity(projectId: number, sprintId: number) {
  return useQuery({
    queryKey: ['sprint-capacity', sprintId],
    queryFn: () => sprintsApi.getCapacity(projectId, sprintId),
    enabled: !!sprintId,
  });
}

export function useSprintTickets(projectId: number, sprintId: number) {
  return useQuery({
    queryKey: ['sprint-tickets', sprintId],
    queryFn: () => sprintsApi.getTickets(projectId, sprintId),
    enabled: !!sprintId,
  });
}

export function useSprintSummary(projectId: number, sprintId: number) {
  return useQuery({
    queryKey: ['sprint-summary', sprintId],
    queryFn: () => sprintsApi.getSummary(projectId, sprintId),
    enabled: !!sprintId,
  });
}

export function useSprintHistory(projectId: number) {
  return useQuery({
    queryKey: ['sprint-history', projectId],
    queryFn: () => sprintsApi.getHistory(projectId),
    enabled: !!projectId,
  });
}

export function useSprintVelocity(projectId: number) {
  return useQuery({
    queryKey: ['sprint-velocity', projectId],
    queryFn: () => sprintsApi.getVelocity(projectId),
    enabled: !!projectId,
  });
}

export function useSprintBurndown(sprintId: number) {
  return useQuery({
    queryKey: ['sprint-burndown', sprintId],
    queryFn: () => sprintsApi.getBurndown(sprintId),
    enabled: !!sprintId,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });
}

export function useSprintScopeChanges(projectId: number, sprintId: number) {
  return useQuery({
    queryKey: ['sprint-scope-changes', sprintId],
    queryFn: () => sprintsApi.getScopeChanges(projectId, sprintId),
    enabled: !!sprintId,
  });
}

export function useCreateSprint(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateSprintRequest) =>
      sprintsApi.create(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    },
  });
}

export function useUpdateSprint(projectId: number, sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateSprintRequest) =>
      sprintsApi.update(projectId, sprintId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['active-sprint', projectId] });
    },
  });
}

export function useActivateSprint(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: number) =>
      sprintsApi.activate(projectId, sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['active-sprint', projectId] });
    },
  });
}

export function useCloseSprint(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, request }: {
      sprintId: number;
      request: CloseSprintRequest;
    }) => sprintsApi.close(projectId, sprintId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['active-sprint', projectId] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}

export function useAddTicketToSprint(projectId: number, sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: number) =>
      sprintsApi.addTicket(projectId, sprintId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-tickets', sprintId] });
      queryClient.invalidateQueries({ queryKey: ['sprint-capacity', sprintId] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}

export function useRemoveTicketFromSprint(projectId: number, sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, reason }: { ticketId: number; reason?: string }) =>
      sprintsApi.removeTicket(projectId, sprintId, ticketId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-tickets', sprintId] });
      queryClient.invalidateQueries({ queryKey: ['sprint-capacity', sprintId] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}

export function useSetMemberCapacity(projectId: number, sprintId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SetMemberCapacityRequest) =>
      sprintsApi.setMemberCapacity(projectId, sprintId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-capacity', sprintId] });
    },
  });
}
