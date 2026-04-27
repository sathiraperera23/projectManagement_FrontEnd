import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import { SetBudgetRequest } from '@/types/reports';

export function useRtmReport(projectId: number, params?: {
  subProjectId?: number;
  productId?: number;
}) {
  return useQuery({
    queryKey: ['report-rtm', projectId, params],
    queryFn: () => reportsApi.getRtm(projectId, params),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCostingReport(projectId: number) {
  return useQuery({
    queryKey: ['report-costing', projectId],
    queryFn: () => reportsApi.getCosting(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDelayReport(projectId: number) {
  return useQuery({
    queryKey: ['report-delays', projectId],
    queryFn: () => reportsApi.getDelays(projectId),
    enabled: !!projectId,
  });
}

export function useBugReport(projectId: number) {
  return useQuery({
    queryKey: ['report-bugs', projectId],
    queryFn: () => reportsApi.getBugReport(projectId),
    enabled: !!projectId,
  });
}

export function useWorkloadReport(projectId: number, params?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['report-workload', projectId, params],
    queryFn: () => reportsApi.getWorkload(projectId, params),
    enabled: !!projectId,
  });
}

export function useTicketAgeReport(projectId: number) {
  return useQuery({
    queryKey: ['report-ticket-age', projectId],
    queryFn: () => reportsApi.getTicketAge(projectId),
    enabled: !!projectId,
  });
}

export function useStatusDistribution(projectId: number, subProjectId?: number) {
  return useQuery({
    queryKey: ['chart-status-dist', projectId, subProjectId],
    queryFn: () => reportsApi.getStatusDistribution(projectId, subProjectId),
    enabled: !!projectId,
  });
}

export function useCategoryBreakdown(projectId: number) {
  return useQuery({
    queryKey: ['chart-category-breakdown', projectId],
    queryFn: () => reportsApi.getCategoryBreakdown(projectId),
    enabled: !!projectId,
  });
}

export function useBugTrend(projectId: number, weeks: number = 12) {
  return useQuery({
    queryKey: ['chart-bug-trend', projectId, weeks],
    queryFn: () => reportsApi.getBugTrend(projectId, weeks),
    enabled: !!projectId,
  });
}

export function useTeamWorkloadChart(projectId: number) {
  return useQuery({
    queryKey: ['chart-team-workload', projectId],
    queryFn: () => reportsApi.getTeamWorkload(projectId),
    enabled: !!projectId,
  });
}

export function useMilestoneProgress(projectId: number) {
  return useQuery({
    queryKey: ['chart-milestone-progress', projectId],
    queryFn: () => reportsApi.getMilestoneProgress(projectId),
    enabled: !!projectId,
  });
}

export function useDelaysDashboard(projectId: number) {
  return useQuery({
    queryKey: ['delays-dashboard', projectId],
    queryFn: () => reportsApi.getDelaysDashboard(projectId),
    enabled: !!projectId,
  });
}

export function useSetBudget(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SetBudgetRequest) =>
      reportsApi.setBudget(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['report-costing', projectId]
      });
    },
  });
}
