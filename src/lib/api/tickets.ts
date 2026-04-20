import api from '@/lib/axios';
import type { TicketFilters, BulkStatusRequest, BulkAssignRequest, CreateTicketRequest } from '@/types/ticket';

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
};
