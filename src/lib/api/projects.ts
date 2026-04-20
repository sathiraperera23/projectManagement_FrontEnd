import api from '@/lib/axios';

export const projectsApi = {
  getAll: async () => {
    const { data } = await api.get('/api/projects');
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
  getTeamMembers: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/team`);
    return data;
  }
};
