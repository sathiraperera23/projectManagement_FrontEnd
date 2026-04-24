import api from '@/lib/axios';
import {
  CreateSprintRequest,
  UpdateSprintRequest,
  CloseSprintRequest,
  SetMemberCapacityRequest,
} from '@/types/sprint';

export const sprintsApi = {
  // ── Sprint CRUD ───────────────────────────────────────
  getAll: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints`);
    return data;
  },
  getById: async (projectId: number, sprintId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/${sprintId}`);
    return data;
  },
  getActive: async (projectId: number, subProjectId?: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/active`, {
      params: { subProjectId },
    });
    return data;
  },
  create: async (projectId: number, request: CreateSprintRequest) => {
    const { data } = await api.post(`/api/projects/${projectId}/sprints`, request);
    return data;
  },
  update: async (projectId: number, sprintId: number, request: UpdateSprintRequest) => {
    const { data } = await api.put(`/api/projects/${projectId}/sprints/${sprintId}`, request);
    return data;
  },
  delete: async (projectId: number, sprintId: number) => {
    await api.delete(`/api/projects/${projectId}/sprints/${sprintId}`);
  },

  // ── Sprint lifecycle ──────────────────────────────────
  activate: async (projectId: number, sprintId: number) => {
    const { data } = await api.post(`/api/projects/${projectId}/sprints/${sprintId}/activate`);
    return data;
  },
  close: async (projectId: number, sprintId: number, request: CloseSprintRequest) => {
    const { data } = await api.post(`/api/projects/${projectId}/sprints/${sprintId}/close`, request);
    return data;
  },

  // ── Ticket management ─────────────────────────────────
  getTickets: async (projectId: number, sprintId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/${sprintId}/tickets`);
    return data;
  },
  addTicket: async (projectId: number, sprintId: number, ticketId: number) => {
    await api.post(`/api/projects/${projectId}/sprints/${sprintId}/tickets/${ticketId}`);
  },
  removeTicket: async (projectId: number, sprintId: number, ticketId: number, reason?: string) => {
    await api.delete(`/api/projects/${projectId}/sprints/${sprintId}/tickets/${ticketId}`, {
      params: { reason },
    });
  },

  // ── Capacity ──────────────────────────────────────────
  getCapacity: async (projectId: number, sprintId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/${sprintId}/capacity`);
    return data;
  },
  setMemberCapacity: async (projectId: number, sprintId: number, request: SetMemberCapacityRequest) => {
    await api.put(`/api/projects/${projectId}/sprints/${sprintId}/capacity`, request);
  },

  // ── Summary and history ───────────────────────────────
  getSummary: async (projectId: number, sprintId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/${sprintId}/summary`);
    return data;
  },
  getHistory: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/history`);
    return data;
  },
  getScopeChanges: async (projectId: number, sprintId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/${sprintId}/scope-changes`);
    return data;
  },

  // ── Velocity ──────────────────────────────────────────
  getVelocity: async (projectId: number, lastNSprints: number = 10) => {
    const { data } = await api.get(`/api/projects/${projectId}/sprints/velocity`, {
      params: { lastNSprints },
    });
    return data;
  },

  // ── Burndown ──────────────────────────────────────────
  getBurndown: async (sprintId: number) => {
    const { data } = await api.get(`/api/sprints/${sprintId}/burndown`);
    return data;
  },
};
