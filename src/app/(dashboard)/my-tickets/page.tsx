'use client';

import React, { useState } from 'react';
import { useMyTickets, useBulkUpdateStatus } from '@/hooks/useTickets';
import { useTicketStore } from '@/store/ticketStore';
import { TicketFilterSidebar } from '@/components/tickets/TicketFilterSidebar';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketForm } from '@/components/tickets/TicketForm';
import type { Ticket } from '@/types/ticket';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import {
  List,
  LayoutGrid,
  Activity,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

type ViewMode = 'list' | 'board' | 'activity';

export default function MyTicketsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { filters, selectedTicketIds, clearSelection, selectAll, toggleTicketSelection } = useTicketStore();
  const { data, isLoading, isError, refetch } = useMyTickets(filters);
  const bulkUpdateMutation = useBulkUpdateStatus();

  const tickets = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);

  const handleBulkStatusChange = (statusId: number) => {
    bulkUpdateMutation.mutate({
      ticketIds: selectedTicketIds,
      statusId
    }, {
      onSuccess: () => {
        clearSelection();
        setIsBulkStatusModalOpen(false);
      }
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-sm text-gray-500">
            {totalCount} open tickets assigned to you
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === 'list' ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === 'board' ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('activity')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === 'activity' ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              isFilterSidebarOpen ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Filter Sidebar */}
        {isFilterSidebarOpen && <TicketFilterSidebar />}

        <div className="flex-1 overflow-y-auto p-0 relative">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-500">Loading tickets...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Failed to load tickets</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs">
                There was an error fetching your tickets. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs">
                Try adjusting your filters or search terms to find what you&apos;re looking for.
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'list' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-indigo-600"
                              onChange={(e) => {
                                if (e.target.checked) selectAll(tickets.map((t: { id: number }) => t.id));
                                else clearSelection();
                              }}
                            />
                          </th>
                          <th className="px-4 py-3 font-medium hover:text-indigo-600 cursor-pointer">Ticket ID</th>
                          <th className="px-4 py-3 font-medium hover:text-indigo-600 cursor-pointer">Title</th>
                          <th className="px-4 py-3 font-medium">Project</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Priority</th>
                          <th className="px-4 py-3 font-medium">Due Date</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tickets.map((ticket: Ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedTicketIds.includes(ticket.id)}
                              onChange={() => toggleTicketSelection(ticket.id)}
                              className="rounded border-gray-300 text-indigo-600"
                            />
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-500">{ticket.ticketNumber}</td>
                          <td className="px-4 py-4 font-semibold text-gray-900">{ticket.title}</td>
                          <td className="px-4 py-4 text-gray-600">{ticket.projectName}</td>
                          <td className="px-4 py-4">
                            <TicketStatusBadge status={ticket.status.name} colour={ticket.status.colour} />
                          </td>
                          <td className="px-4 py-4">
                            <PriorityBadge priority={ticket.priority} />
                          </td>
                          <td className="px-4 py-4 text-gray-500">
                            {ticket.expectedDueDate ? formatDate(ticket.expectedDueDate) : '-'}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">1</span> to <span className="font-medium">{tickets.length}</span> of{' '}
                          <span className="font-medium">{totalCount}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button aria-current="page" className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            1
                          </button>
                          <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                            2
                          </button>
                          <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'board' && (
                <div className="flex gap-6 overflow-x-auto p-6 pb-4 h-full">
                  {/* Simplistic status grouping for demonstration */}
                  {['Todo', 'In Progress', 'Done'].map((statusName) => {
                    const statusTickets = tickets.filter((t: Ticket) => t.status.name === statusName);
                    return (
                      <div key={statusName} className="flex min-w-[300px] max-w-[300px] flex-col gap-4 rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{statusName}</h3>
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                            {statusTickets.length}
                          </span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {statusTickets.map((ticket: Ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === 'activity' && (
                <div className="space-y-8 max-w-3xl mx-auto py-10 px-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Today</h3>
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              <span className="font-semibold">You</span> updated the status of <span className="font-semibold text-indigo-600">TMS-00{i}</span> to <span className="font-medium text-gray-700 italic">In Progress</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Yesterday</h3>
                    <div className="space-y-3">
                      <div className="flex gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                          <Plus className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">You</span> created a new ticket <span className="font-semibold text-indigo-600">TMS-042</span>
                          </p>
                          <p className="mt-1 text-xs text-gray-500">Yesterday at 4:30 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bulk Operations Bar */}
      {selectedTicketIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-6 rounded-full bg-gray-900 px-6 py-3 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-medium text-white">
            {selectedTicketIds.length} tickets selected
          </span>
          <div className="h-4 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkStatusModalOpen(true)}
              className="text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Change Status
            </button>
            <button
              className="text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Reassign
            </button>
            <button
              onClick={clearSelection}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Bulk Status Modal (Simple implementation) */}
      {isBulkStatusModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Change Status</h3>
            <div className="space-y-2">
              {[
                { id: 1, name: 'Todo' },
                { id: 2, name: 'In Progress' },
                { id: 3, name: 'Done' }
              ].map(status => (
                <button
                  key={status.id}
                  onClick={() => handleBulkStatusChange(status.id)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {status.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsBulkStatusModalOpen(false)}
              className="mt-4 w-full text-sm text-gray-500 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ticket Form Modal */}
      <TicketForm isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
