import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';

export function useProjectGantt(projectId: number) {
  return useQuery({
    queryKey: ['gantt', 'project', projectId],
    queryFn: () => projectsApi.getProjectGantt(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

export function useProductGantt(projectId: number, productId: number) {
  return useQuery({
    queryKey: ['gantt', 'product', productId],
    queryFn: () => projectsApi.getProductGantt(projectId, productId),
    enabled: !!productId,
  });
}

export function useSubProjectGantt(subProjectId: number) {
  return useQuery({
    queryKey: ['gantt', 'subproject', subProjectId],
    queryFn: () => projectsApi.getSubProjectGantt(subProjectId),
    enabled: !!subProjectId,
  });
}
