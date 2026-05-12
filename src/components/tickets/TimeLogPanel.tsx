'use client';

import React, { useState } from 'react';
import { useTicketTimeLogs, useLogTime } from '@/hooks/useTickets';
import { Clock, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TimeLog } from '@/types/ticket';
import { ticketsApi } from '@/lib/api/tickets';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
  ticketId: number;
  storyPoints?: number;
}

export function TimeLogPanel({ ticketId, storyPoints = 0 }: Props) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  const { data: timeLogs, isLoading } = useTicketTimeLogs(ticketId);
  const logTimeMutation = useLogTime(ticketId);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ticketsApi.deleteTimeLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-timelogs', ticketId] });
    }
  });

  const totalLogged = timeLogs?.reduce((acc: number, log: TimeLog) => acc + log.hoursLogged, 0) || 0;
  const progress = storyPoints > 0 ? Math.min((totalLogged / (storyPoints * 8)) * 100, 100) : 0; // Assume 1 SP = 8 hours

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours) return;

    await logTimeMutation.mutateAsync({
      hoursLogged: parseFloat(hours),
      description
    });

    setIsAdding(false);
    setHours('');
    setDescription('');
  };

  if (isLoading) return <div>Loading time logs...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Time Tracking</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
        >
          {isAdding ? 'Cancel' : 'Log Time'}
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{totalLogged}h logged</span>
          <span>{storyPoints} SP (~{storyPoints * 8}h)</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-indigo-700 uppercase">Hours</label>
              <input
                type="number"
                step="0.1"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="block w-full rounded-md border-gray-300 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.0"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-indigo-700 uppercase">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What did you do?"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={logTimeMutation.isPending}
            className="w-full rounded-md bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            {logTimeMutation.isPending ? 'Logging...' : 'Save Entry'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {timeLogs?.map((log: TimeLog) => (
          <div key={log.id} className="group flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900">{log.hoursLogged}h</span>
                <span className="text-[10px] text-gray-500">{log.userDisplayName}</span>
              </div>
              {log.description && <p className="text-[10px] text-gray-400 italic">{log.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">{formatDate(log.loggedAt)}</span>
              <button
                onClick={() => deleteMutation.mutate(log.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
