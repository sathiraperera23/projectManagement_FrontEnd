import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import {
  UpdateProjectRequest,
  CreateProjectRequest,
  CreateProductRequest,
  CreateSubProjectRequest
} from '@/types/project';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
    staleTime: 60 * 1000,
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useProjectSummary(id: number) {
  return useQuery({
    queryKey: ['project-summary', id],
    queryFn: () => projectsApi.getSummary(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useProducts(projectId: number) {
  return useQuery({
    queryKey: ['products', projectId],
    queryFn: () => projectsApi.getProducts(projectId),
    enabled: !!projectId,
  });
}

export function useSubProjects(projectId: number, productId: number) {
  return useQuery({
    queryKey: ['subprojects', projectId, productId],
    queryFn: () => projectsApi.getSubProjects(projectId, productId),
    enabled: !!projectId && !!productId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateProjectRequest) => projectsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateProjectRequest) => projectsApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useCreateProduct(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateProductRequest) => projectsApi.createProduct(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', projectId] });
    },
  });
}

export function useCreateSubProject(projectId: number, productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateSubProjectRequest) => projectsApi.createSubProject(projectId, productId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subprojects', projectId, productId] });
    },
  });
}
