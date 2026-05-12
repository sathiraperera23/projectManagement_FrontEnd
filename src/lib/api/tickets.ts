import api from '@/lib/axios';
import type { TicketFilters, BulkStatusRequest, BulkAssignRequest, CreateTicketRequest } from '@/types/ticket';
import type { CreateStatusRequest, UpdateStatusRequest } from '@/types/kanban';

export const ticketsApi = {

  // Get all tickets for the current user across all projects
  getMyTickets: async (filters?: TicketFilters) => {
    const { data } = await api.get('/api/tickets', { params: filters });
    return data;
  },

  // Get a single ticket by ID
  getById: async (id: number) => {
    const { data } = await api.get(`/api/tickets/${id}`);
    return data;
  },

  // Create a new ticket
  create: async (ticket: CreateTicketRequest) => {
    const { data } = await api.post('/api/tickets', ticket);
    return data;
  },

  // Update ticket status
  updateStatus: async (id: number, statusId: number, reason?: string) => {
    const { data } = await api.put(`/api/tickets/${id}/status`, { statusId, reason });
    return data;
  },

  // Bulk operations
  bulkUpdateStatus: async (request: BulkStatusRequest) => {
    const { data } = await api.put('/api/tickets/bulk/status', request);
    return data;
  },

  bulkAssign: async (request: BulkAssignRequest) => {
    const { data } = await api.put('/api/tickets/bulk/assign', request);
    return data;
  },

  // Get ticket status history
  getHistory: async (id: number) => {
    const { data } = await api.get(`/api/tickets/${id}/history`);
    return data;
  },

  // Update ticket (general)
  update: async (id: number, updates: Partial<CreateTicketRequest>) => {
    const { data } = await api.patch(`/api/tickets/${id}`, updates);
    return data;
  },

  // Comments
  getComments: async (ticketId: number) => {
    const { data } = await api.get(`/api/tickets/${ticketId}/comments`);
    return data;
  },
  addComment: async (ticketId: number, body: string, isInternalNote: boolean) => {
    const { data } = await api.post(`/api/tickets/${ticketId}/comments`, { body, isInternalNote });
    return data;
  },
  editComment: async (commentId: number, body: string) => {
    const { data } = await api.put(`/api/comments/${commentId}`, { body });
    return data;
  },
  deleteComment: async (commentId: number) => {
    await api.delete(`/api/comments/${commentId}`);
  },
  addReaction: async (commentId: number, emoji: string) => {
    await api.post(`/api/comments/${commentId}/reactions`, { emoji });
  },
  removeReaction: async (commentId: number, emoji: string) => {
    await api.delete(`/api/comments/${commentId}/reactions/${emoji}`);
  },

  // Attachments
  getAttachments: async (ticketId: number) => {
    const { data } = await api.get(`/api/tickets/${ticketId}/attachments`);
    return data;
  },
  uploadAttachment: async (ticketId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/api/tickets/${ticketId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  addExternalLink: async (ticketId: number, url: string, label: string) => {
    const { data } = await api.post(`/api/tickets/${ticketId}/attachments/link`, { externalUrl: url, externalLabel: label });
    return data;
  },
  deleteAttachment: async (ticketId: number, attachmentId: number) => {
    await api.delete(`/api/tickets/${ticketId}/attachments/${attachmentId}`);
  },
  downloadAttachment: (attachmentId: number) => {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attachments/${attachmentId}/download`;
  },

  // Watchers
  getWatchers: async (ticketId: number) => {
    const { data } = await api.get(`/api/tickets/${ticketId}/watchers`);
    return data;
  },
  watch: async (ticketId: number) => {
    await api.post(`/api/tickets/${ticketId}/watch`);
  },
  unwatch: async (ticketId: number) => {
    await api.delete(`/api/tickets/${ticketId}/watch`);
  },

  // Ticket links
  addLink: async (ticketId: number, linkedTicketId: number, relationshipType: string) => {
    const { data } = await api.post(`/api/tickets/${ticketId}/links`, { linkedTicketId, relationshipType });
    return data;
  },
  removeLink: async (ticketId: number, linkId: number) => {
    await api.delete(`/api/tickets/${ticketId}/links/${linkId}`);
  },

  // Time logging
  getTimeLogs: async (ticketId: number) => {
    const { data } = await api.get(`/api/tickets/${ticketId}/time-logs`);
    return data;
  },
  logTime: async (ticketId: number, hoursLogged: number, description?: string) => {
    const { data } = await api.post(`/api/tickets/${ticketId}/time-logs`, { hoursLogged, description });
    return data;
  },
  deleteTimeLog: async (timeLogId: number) => {
    await api.delete(`/api/time-logs/${timeLogId}`);
  },

  // Approval (for customer bugs)
  approveBug: async (ticketId: number) => {
    await api.post(`/api/tickets/${ticketId}/approve`);
  },
  rejectBug: async (ticketId: number, reason: string) => {
    await api.post(`/api/tickets/${ticketId}/reject`, { reason });
  },
  requestMoreInfo: async (ticketId: number, message: string) => {
    await api.post(`/api/tickets/${ticketId}/request-more-info`, { message });
  },

  // Kanban board data
  getKanbanBoard: async (projectId: number, params?: {
    subProjectId?: number;
    teamId?: number;
    groupBy?: string;
  }) => {
    const { data } = await api.get(`/api/projects/${projectId}/kanban`, { params });
    return data;
  },

  // Sub-project kanban
  getSubProjectKanban: async (subProjectId: number) => {
    const { data } = await api.get(`/api/subprojects/${subProjectId}/kanban`);
    return data;
  },

  // Team kanban
  getTeamKanban: async (teamId: number) => {
    const { data } = await api.get(`/api/teams/${teamId}/kanban`);
    return data;
  },

  // Project statuses
  getProjectStatuses: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/statuses`);
    return data;
  },
  createStatus: async (projectId: number, request: CreateStatusRequest) => {
    const { data } = await api.post(`/api/projects/${projectId}/statuses`, request);
    return data;
  },
  updateProjectStatus: async (projectId: number, statusId: number, request: UpdateStatusRequest) => {
    const { data } = await api.put(`/api/projects/${projectId}/statuses/${statusId}`, request);
    return data;
  },
  deleteStatus: async (projectId: number, statusId: number) => {
    await api.delete(`/api/projects/${projectId}/statuses/${statusId}`);
  },
};
