import api from '@/lib/axios';

export const sprintsApi = {
  getSprints: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints`);
    return data;
  },
  getSprintById: async (projectId: number, sprintId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/${sprintId}`);
    return data;
  },
  createSprint: async (projectId: number, data: any) => {
    const { data: result } = await api.post(`/api/projects/${projectId}/sprints`, data);
    return result;
  },
  updateSprint: async (projectId: number, sprintId: number, data: any) => {
    const { data: result } = await api.put(`/api/projects/${projectId}/sprints/${sprintId}`, data);
    return result;
  },
  deleteSprint: async (projectId: number, sprintId: number) => {
    await api.delete(`/api/projects/${projectId}/sprints/${sprintId}`);
  },
};
