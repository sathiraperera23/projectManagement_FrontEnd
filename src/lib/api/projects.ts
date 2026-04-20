import api from '@/lib/axios';
import { WipLimitRequest } from '@/types/kanban';

export const projectsApi = {
  getAll: async () => {
    const { data } = await api.get('/api/projects');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/projects/${id}`);
    return data;
  },
  getProducts: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/products`);
    return data;
  },
  getSubProjects: async (projectId: number, productId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/products/${productId}/subprojects`);
    return data;
  },
  getTeams: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/teams`);
    return data;
  },
  getTeamMembers: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/team`);
    return data;
  },
  getStatuses: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/statuses`);
    return data;
  },
  getWipLimits: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/wip-limits`);
    return data;
  },
  setWipLimits: async (projectId: number, limits: WipLimitRequest) => {
    const { data } = await api.put(`/api/projects/${projectId}/wip-limits`, limits);
    return data;
  },
};
