import api from '@/lib/axios';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  AssignTeamRequest,
  CreateProductRequest,
  UpdateProductRequest,
  CreateSubProjectRequest,
  UpdateSubProjectRequest,
  CreateTeamRequest
} from '@/types/project';
export const projectsApi = {

  // ── Projects ──────────────────────────────────────────
  getAll: async () => {
    const { data } = await api.get('/api/projects');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/api/projects/${id}`);
    return data;
  },
  create: async (request: CreateProjectRequest) => {
    const { data } = await api.post('/api/projects', request);
    return data;
  },
  update: async (id: number, request: UpdateProjectRequest) => {
    const { data } = await api.put(`/api/projects/${id}`, request);
    return data;
  },
  archive: async (id: number) => {
    await api.put(`/api/projects/${id}/archive`);
  },
  delete: async (id: number) => {
    await api.delete(`/api/projects/${id}`);
  },
  getSummary: async (id: number) => {
    const { data } = await api.get(`/api/projects/${id}/summary`);
    return data;
  },
  exportSummary: async (id: number) => {
    const response = await api.get(`/api/projects/${id}/summary/export`, {
      responseType: 'blob'
    });
    return response.data;
  },
  assignTeam: async (id: number, request: AssignTeamRequest) => {
    await api.post(`/api/projects/${id}/teams`, request);
  },

  // ── Products ──────────────────────────────────────────
  getProducts: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/products`);
    return data;
  },
  getProductById: async (projectId: number, productId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/products/${productId}`);
    return data;
  },
  createProduct: async (projectId: number, request: CreateProductRequest) => {
    const { data } = await api.post(`/api/projects/${projectId}/products`, request);
    return data;
  },
  updateProduct: async (projectId: number, productId: number, request: UpdateProductRequest) => {
    const { data } = await api.put(`/api/projects/${projectId}/products/${productId}`, request);
    return data;
  },
  deleteProduct: async (projectId: number, productId: number) => {
    await api.delete(`/api/projects/${projectId}/products/${productId}`);
  },

  // ── Sub-Projects ──────────────────────────────────────
  getSubProjects: async (projectId: number, productId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/products/${productId}/subprojects`
    );
    return data;
  },
  getSubProjectById: async (projectId: number, productId: number, subProjectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/products/${productId}/subprojects/${subProjectId}`
    );
    return data;
  },
  createSubProject: async (projectId: number, productId: number, request: CreateSubProjectRequest) => {
    const { data } = await api.post(
      `/api/projects/${projectId}/products/${productId}/subprojects`,
      request
    );
    return data;
  },
  updateSubProject: async (projectId: number, productId: number, subProjectId: number, request: UpdateSubProjectRequest) => {
    const { data } = await api.put(
      `/api/projects/${projectId}/products/${productId}/subprojects/${subProjectId}`,
      request
    );
    return data;
  },
  deleteSubProject: async (projectId: number, productId: number, subProjectId: number) => {
    await api.delete(
      `/api/projects/${projectId}/products/${productId}/subprojects/${subProjectId}`
    );
  },
  getSubProjectProgress: async (projectId: number, productId: number, subProjectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/products/${productId}/subprojects/${subProjectId}/progress`
    );
    return data;
  },
  assignSubProjectTeam: async (projectId: number, productId: number, subProjectId: number, request: AssignTeamRequest) => {
    await api.post(
      `/api/projects/${projectId}/products/${productId}/subprojects/${subProjectId}/teams`,
      request
    );
  },

  // ── Teams ─────────────────────────────────────────────
  getTeams: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/teams`);
    return data;
  },
  createTeam: async (projectId: number, request: CreateTeamRequest) => {
    const { data } = await api.post(`/api/projects/${projectId}/teams`, request);
    return data;
  },
  getMembers: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/members`);
    return data;
  },
  getTeamMembers: async (projectId: number, teamId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/teams/${teamId}/members`);
    return data;
  },

  // ── Statuses ──────────────────────────────────────────
  getStatuses: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/statuses`);
    return data;
  },

  // ── Charts ────────────────────────────────────────────
  getTicketStatusDistribution: async (projectId: number, subProjectId?: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/charts/ticket-status-distribution`,
      { params: { subProjectId } }
    );
    return data;
  },
  getMilestoneProgress: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/charts/milestone-progress`);
    return data;
  },
  getTeamWorkload: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/charts/team-workload`);
    return data;
  },

  // ── Delays ────────────────────────────────────────────
  getDelays: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/delays`);
    return data;
  },

  // ── Access rules ──────────────────────────────────────
  getAccessRules: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/access-rules`);
    return data;
  },

  // ── Notification rules ────────────────────────────────
  getNotificationRules: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/notification-rules`);
    return data;
  },
};
