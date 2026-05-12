import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api/tickets';

export function useKanbanBoard(projectId: number, params?: {
  subProjectId?: number;
  teamId?: number;
  groupBy?: string;
}) {
  return useQuery({
    queryKey: ['kanban', projectId, params],
    queryFn: () => ticketsApi.getKanbanBoard(projectId, params),
    enabled: !!projectId,
    staleTime: 15 * 1000,
  });
}

export function useProjectStatuses(projectId: number) {
  return useQuery({
    queryKey: ['project-statuses', projectId],
    queryFn: () => ticketsApi.getProjectStatuses(projectId),
    enabled: !!projectId,
  });
}
