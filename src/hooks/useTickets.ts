import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api/tickets';
import type { TicketFilters, CreateTicketRequest } from '@/types/ticket';

export function useMyTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['my-tickets', filters],
    queryFn: () => ticketsApi.getMyTickets(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusId, reason }: {
      id: number; statusId: number; reason?: string
    }) => ticketsApi.updateStatus(id, statusId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id),
    enabled: !!id,
  });
}

export function useTicketComments(ticketId: number) {
  return useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: () => ticketsApi.getComments(ticketId),
    enabled: !!ticketId,
  });
}

export function useAddComment(ticketId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, isInternalNote }: { body: string; isInternalNote: boolean }) =>
      ticketsApi.addComment(ticketId, body, isInternalNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
    },
  });
}

export function useUpdateTicket(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<CreateTicketRequest>) =>
      ticketsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}

export function useTicketTimeLogs(ticketId: number) {
  return useQuery({
    queryKey: ['ticket-timelogs', ticketId],
    queryFn: () => ticketsApi.getTimeLogs(ticketId),
    enabled: !!ticketId,
  });
}

export function useLogTime(ticketId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hoursLogged, description }: { hoursLogged: number; description?: string }) =>
      ticketsApi.logTime(ticketId, hoursLogged, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-timelogs', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
  });
}

export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ticketsApi.bulkUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}
