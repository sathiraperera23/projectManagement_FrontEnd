import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api/tickets';
import type { TicketFilters } from '@/types/ticket';

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

export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ticketsApi.bulkUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
}
