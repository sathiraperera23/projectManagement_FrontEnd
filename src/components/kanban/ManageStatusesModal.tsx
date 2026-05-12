'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api/tickets';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { CreateStatusRequest } from '@/types/kanban';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export function ManageStatusesModal({ isOpen, onClose, projectId }: Props) {
  const queryClient = useQueryClient();
  const { data: statuses, isLoading } = useQuery({
    queryKey: ['project-statuses', projectId],
    queryFn: () => ticketsApi.getProjectStatuses(projectId),
    enabled: isOpen
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateStatusRequest) => ticketsApi.createStatus(projectId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-statuses', projectId] });
      toast.success('Status created');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ticketsApi.deleteStatus(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-statuses', projectId] });
      toast.success('Status deleted');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
           <h2 className="text-xl font-bold text-gray-900">Manage Project Statuses</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           <p className="text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider">Project Statuses</p>

           <div className="space-y-3">
              {statuses?.map((status: { id: number; name: string; colour: string; isTerminal: boolean }) => (
                <div key={status.id} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 bg-white shadow-sm hover:border-gray-300 transition-all">
                   <GripVertical className="h-5 w-5 text-gray-300 cursor-move shrink-0" />
                   <div className="h-6 w-6 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: status.colour }} />
                   <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{status.name}</p>
                      {status.isTerminal && <span className="text-[10px] font-bold text-green-600 uppercase">Terminal Status</span>}
                   </div>

                   {!['Open', 'Completed', 'Closed', 'Cancelled'].includes(status.name) && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this status?')) {
                            deleteMutation.mutate(status.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                         <Trash2 className="h-4 w-4" />
                      </button>
                   )}
                </div>
              ))}

              {statuses?.length === 0 && !isLoading && (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                   <p className="text-sm text-gray-400 font-medium">No custom statuses found</p>
                </div>
              )}
           </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
           <button
             onClick={() => {
               const name = prompt('Status Name:');
               if (name) createMutation.mutate({ name, colour: '#6b7280', order: (statuses?.length || 0) + 1 });
             }}
             className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
           >
              <Plus className="h-4 w-4" />
              Add Status
           </button>

           <button
             onClick={onClose}
             className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-md transition-all active:scale-95"
           >
              Done
           </button>
        </div>
      </div>
    </div>
  );
}
