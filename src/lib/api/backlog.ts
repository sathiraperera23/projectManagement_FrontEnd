import api from '@/lib/axios';

export const backlogApi = {
  // ── Backlog Items ─────────────────────────────────────
  getProjectBacklog: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/backlog`);
    return data;
  },
  getBacklogItem: async (id: number) => {
    const { data } = await api.get(`/api/backlog/${id}`);
    return data;
  },
  createBacklogItem: async (projectId: number, request: any) => {
    const { data } = await api.post(`/api/projects/${projectId}/backlog`, request);
    return data;
  },
  updateBacklogItem: async (id: number, request: any) => {
    const { data } = await api.put(`/api/backlog/${id}`, request);
    return data;
  },
  deleteBacklogItem: async (id: number) => {
    await api.delete(`/api/backlog/${id}`);
  },

  // ── Versions ──────────────────────────────────────────
  getItemVersions: async (id: number) => {
    const { data } = await api.get(`/api/backlog/${id}/versions`);
    return data;
  },
  rollbackToVersion: async (id: number, versionId: number) => {
    const { data } = await api.post(`/api/backlog/${id}/rollback/${versionId}`);
    return data;
  },

  // ── Approvals ─────────────────────────────────────────
  getApprovalRequests: async (id: number) => {
    const { data } = await api.get(`/api/backlog/${id}/approvals`);
    return data;
  },
  requestApproval: async (id: number, request: any) => {
    const { data } = await api.post(`/api/backlog/${id}/approvals`, request);
    return data;
  },
  approveItem: async (id: number, approvalId: number, comment?: string) => {
    const { data } = await api.post(`/api/backlog/${id}/approvals/${approvalId}/approve`, { comment });
    return data;
  },
  rejectItem: async (id: number, approvalId: number, reason: string) => {
    const { data } = await api.post(`/api/backlog/${id}/approvals/${approvalId}/reject`, { reason });
    return data;
  },

  // ── Attachments ───────────────────────────────────────
  uploadAttachment: async (id: number, formData: FormData) => {
    const { data } = await api.post(`/api/backlog/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  deleteAttachment: async (id: number, attachmentId: number) => {
    await api.delete(`/api/backlog/${id}/attachments/${attachmentId}`);
  },
};
