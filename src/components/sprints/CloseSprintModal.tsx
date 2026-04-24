'use client';

import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  LayoutList,
  CalendarDays
} from 'lucide-react';
import type { SprintSummary, SprintClosureDisposition, Sprint } from '@/types/sprint';
import { useSprints } from '@/hooks/useSprints';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (disposition: SprintClosureDisposition, nextSprintId?: number) => Promise<void>;
  sprintSummary: SprintSummary | null;
  projectId: number;
}

export function CloseSprintModal({ isOpen, onClose, onConfirm, sprintSummary, projectId }: Props) {
  const [disposition, setDisposition] = useState<SprintClosureDisposition>('MoveToBacklog');
  const [nextSprintId, setNextSprintId] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allSprints } = useSprints(projectId);
  const planningSprints = allSprints?.filter((s: Sprint) => s.status === 'Planning') || [];

  if (!isOpen || !sprintSummary) return null;

  const handleConfirm = async () => {
    if (disposition === 'MoveToNextSprint' && !nextSprintId) return;
    setIsSubmitting(true);
    try {
      await onConfirm(disposition, nextSprintId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const incompleteCount = sprintSummary.totalTickets - sprintSummary.completedTickets;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Close Sprint</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Preview */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Planned Points</p>
                <p className="text-lg font-bold text-gray-900">{sprintSummary.plannedStoryPoints}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Completed Points</p>
                <p className="text-lg font-bold text-emerald-600">{sprintSummary.completedStoryPoints}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Tickets Done</p>
                <p className="text-sm font-bold text-gray-900">{sprintSummary.completedTickets} / {sprintSummary.totalTickets}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Completion Rate</p>
                <p className="text-sm font-bold text-gray-900">{sprintSummary.completionRate}%</p>
             </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase tracking-tight">Incomplete Work</p>
              <p className="text-sm">{incompleteCount} tickets were not completed. Where should they go?</p>
            </div>
          </div>

          {/* Dispositions */}
          <div className="space-y-3">
            <label
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                disposition === 'MoveToBacklog' ? "border-indigo-600 bg-indigo-50/30" : "border-gray-100 hover:border-gray-200"
              )}
              onClick={() => setDisposition('MoveToBacklog')}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", disposition === 'MoveToBacklog' ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500")}>
                  <LayoutList className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-900">Move to Backlog</p>
                   <p className="text-[10px] text-gray-500 font-medium">Tickets will become unassigned</p>
                </div>
              </div>
              <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", disposition === 'MoveToBacklog' ? "border-indigo-600" : "border-gray-300")}>
                {disposition === 'MoveToBacklog' && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
              </div>
            </label>

            <label
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                disposition === 'MoveToNextSprint' ? "border-indigo-600 bg-indigo-50/30" : "border-gray-100 hover:border-gray-200"
              )}
              onClick={() => setDisposition('MoveToNextSprint')}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", disposition === 'MoveToNextSprint' ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500")}>
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-900">Move to Next Sprint</p>
                   <p className="text-[10px] text-gray-500 font-medium">Tickets will stay in the next planned sprint</p>
                </div>
              </div>
              <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", disposition === 'MoveToNextSprint' ? "border-indigo-600" : "border-gray-300")}>
                {disposition === 'MoveToNextSprint' && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
              </div>
            </label>

            {disposition === 'MoveToNextSprint' && (
              <div className="pl-14 pr-4">
                 <select
                   className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                   value={nextSprintId || ''}
                   onChange={(e) => setNextSprintId(Number(e.target.value))}
                 >
                   <option value="">Select a planned sprint...</option>
                   {planningSprints.map((s: Sprint) => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
                 {planningSprints.length === 0 && <p className="text-[10px] text-red-500 mt-1 font-bold">No planned sprints available. Create one first.</p>}
              </div>
            )}

            <label
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                disposition === 'LeaveInPlace' ? "border-indigo-600 bg-indigo-50/30" : "border-gray-100 hover:border-gray-200"
              )}
              onClick={() => setDisposition('LeaveInPlace')}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", disposition === 'LeaveInPlace' ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500")}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-900">Leave in Place</p>
                   <p className="text-[10px] text-gray-500 font-medium">Tickets will stay assigned to this closed sprint</p>
                </div>
              </div>
              <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", disposition === 'LeaveInPlace' ? "border-indigo-600" : "border-gray-300")}>
                {disposition === 'LeaveInPlace' && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
              </div>
            </label>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || (disposition === 'MoveToNextSprint' && !nextSprintId)}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {isSubmitting ? 'Closing...' : 'Confirm Closure'}
          </button>
        </div>
      </div>
    </div>
  );
}
