'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useSprints,
  useActiveSprint,
  useSprintVelocity,
  useCreateSprint,
  useActivateSprint,
  useCloseSprint,
  useSprintSummary,
  useSprintBurndown,
  useSprintScopeChanges
} from '@/hooks/useSprints';
import { useProjects } from '@/hooks/useProjects';
import { SprintCard } from '@/components/sprints/SprintCard';
import { VelocityChart } from '@/components/sprints/VelocityChart';
import { BurndownChart } from '@/components/sprints/BurndownChart';
import { CloseSprintModal } from '@/components/sprints/CloseSprintModal';
import { SprintBacklog } from '@/components/sprints/SprintBacklog';
import { SprintCapacityBar } from '@/components/sprints/SprintCapacityBar';
import {
  ChevronRight,
  Plus,
  RefreshCw,
  History,
  BarChart3,
  Zap,
  CalendarDays,
  X,
  AlertCircle,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Sprint, SprintStatus } from '@/types/sprint';

const sprintSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  goal: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  storyPointCapacity: z.number().min(1, 'Capacity must be at least 1'),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"]
});

type SprintFormValues = z.infer<typeof sprintSchema>;

export default function SprintPlanningPage() {
  const { projectId } = useParams();
  const pid = Number(projectId);

  const [activeTab, setActiveTab] = useState<'sprints' | 'velocity'>('sprints');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingSprintId, setClosingSprintId] = useState<number | null>(null);

  // Queries
  const { data: project } = useProjects(); // Simplified or get current project
  const { data: sprints, isLoading: loadingSprints, refetch: refetchSprints } = useSprints(pid);
  const { data: activeSprint } = useActiveSprint(pid);
  const { data: velocity } = useSprintVelocity(pid);
  const { data: burndown } = useSprintBurndown(activeSprint?.id);
  const { data: scopeChanges } = useSprintScopeChanges(pid, activeSprint?.id);
  const { data: closingSummary } = useSprintSummary(pid, closingSprintId!);

  // Mutations
  const createMutation = useCreateSprint(pid);
  const activateMutation = useActivateSprint(pid);
  const closeMutation = useCloseSprint(pid);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: { storyPointCapacity: 30 }
  });

  const onSubmit = async (data: SprintFormValues) => {
    try {
      await createMutation.mutateAsync({ ...data, projectId: pid });
      setIsCreateOpen(false);
      reset();
      toast.success('Sprint created');
    } catch {
      toast.error('Failed to create sprint');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activateMutation.mutateAsync(id);
      toast.success('Sprint activated');
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 409) {
        toast.error('Cannot activate sprint — there is already an active sprint for this project. Close it first.');
      } else {
        toast.error('Failed to activate sprint');
      }
    }
  };

  const handleClose = async (disposition: any, nextSprintId?: number) => {
    if (!closingSprintId) return;
    try {
      await closeMutation.mutateAsync({
        sprintId: closingSprintId,
        request: { disposition, nextSprintId }
      });
      setClosingSprintId(null);
      toast.success('Sprint closed');
    } catch {
      toast.error('Failed to close sprint');
    }
  };

  const planningSprints = sprints?.filter((s: Sprint) => s.status === 'Planning') || [];
  const closedSprints = sprints?.filter((s: Sprint) => s.status === 'Closed') || [];

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
             <Link href="/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
             <ChevronRight className="h-3 w-3" />
             <span className="text-gray-900">Sprint Planning</span>
           </nav>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Project Sprints</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchSprints()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Create Sprint
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('sprints')}
          className={cn(
            "flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
            activeTab === 'sprints' ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Zap className="h-4 w-4" />
          Sprints
          {activeTab === 'sprints' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('velocity')}
          className={cn(
            "flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
            activeTab === 'velocity' ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Velocity & Analytics
          {activeTab === 'velocity' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'sprints' ? (
        <div className="space-y-10 pb-20">
          {/* Active Sprint Section */}
          {activeSprint ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                 <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Active Sprint</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                   <SprintCard
                     sprint={activeSprint}
                     onClose={(id) => { setClosingSprintId(id); setIsCloseModalOpen(true); }}
                   />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                   <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-3">Burndown</h3>
                   <BurndownChart data={burndown || []} sprintName={activeSprint.name} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50/50 border border-dashed border-indigo-200 rounded-2xl p-12 text-center">
               <Zap className="h-10 w-10 text-indigo-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-indigo-900 mb-2">No active sprint</h3>
               <p className="text-indigo-600/70 text-sm max-w-sm mx-auto mb-6">Activate a planned sprint to start tracking progress and see burndown analytics.</p>
            </div>
          )}

          {/* Planning Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Planning ({planningSprints.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planningSprints.map((sprint: Sprint) => (
                <div key={sprint.id} onClick={() => setSelectedSprint(sprint)} className="cursor-pointer">
                  <SprintCard
                    sprint={sprint}
                    onActivate={handleActivate}
                  />
                </div>
              ))}
              {planningSprints.length === 0 && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-100 p-8 text-gray-400 hover:border-indigo-200 hover:text-indigo-400 transition-all group"
                >
                  <div className="p-3 rounded-full bg-gray-50 group-hover:bg-indigo-50 transition-colors">
                     <Plus className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Create First Sprint</span>
                </button>
              )}
            </div>
          </div>

          {/* Closed Section */}
          <details className="group">
            <summary className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-gray-600 transition-colors list-none">
               <History className="h-4 w-4" />
               Completed Sprints ({closedSprints.length})
               <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
               {closedSprints.map((sprint: Sprint) => (
                 <SprintCard key={sprint.id} sprint={sprint} />
               ))}
            </div>
          </details>
        </div>
      ) : (
        <div className="space-y-10 pb-20">
           <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8">Team Velocity History</h2>
              <VelocityChart data={velocity!} />
           </div>

           <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                 <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Sprint History</h3>
              </div>
              <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-50/50">
                    <tr>
                       <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Sprint</th>
                       <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Dates</th>
                       <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Points</th>
                       <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Done %</th>
                       <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {sprints?.map((s: Sprint) => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-gray-900">{s.name}</p>
                           <p className="text-[10px] text-gray-400 font-medium">{s.goal}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-500">
                           {formatDate(s.startDate)} – {formatDate(s.endDate)}
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-xs font-bold text-indigo-600">{s.completedStoryPoints}</span>
                           <span className="text-xs text-gray-400"> / {s.plannedStoryPoints}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500" style={{ width: `${s.completionPercentage}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-gray-600">{s.completionPercentage}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                             s.status === 'Closed' ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                           )}>
                             {s.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Slide-over for Sprint Planning/Details */}
      {selectedSprint && (
        <div className="fixed inset-0 z-50 overflow-hidden">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedSprint(null)} />
           <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
              <div className="w-screen max-w-5xl bg-gray-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                 <div className="bg-white px-8 py-6 border-b flex items-center justify-between sticky top-0 z-10">
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-2xl font-black text-gray-900">{selectedSprint.name}</h2>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase">{selectedSprint.status}</span>
                       </div>
                       <p className="text-sm text-gray-500 font-medium flex items-center gap-4">
                          <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(selectedSprint.startDate)} – {formatDate(selectedSprint.endDate)}</span>
                          {selectedSprint.goal && <span className="flex items-center gap-1.5 italic"><Activity className="h-4 w-4" /> {selectedSprint.goal}</span>}
                       </p>
                    </div>
                    <button onClick={() => setSelectedSprint(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                       <X className="h-6 w-6" />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    <section className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Sprint Capacity
                       </h3>
                       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <SprintCapacityBar projectId={pid} sprintId={selectedSprint.id} />
                       </div>
                    </section>

                    <section className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-indigo-500" />
                          Sprint Backlog Management
                       </h3>
                       <SprintBacklog
                         projectId={pid}
                         sprintId={selectedSprint.id}
                         isActive={selectedSprint.status === 'Active'}
                       />
                    </section>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Create Sprint Slide-over */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
           <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                 <div className="px-8 py-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900">Create New Sprint</h2>
                    <button onClick={() => setIsCreateOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                       <X className="h-6 w-6" />
                    </button>
                 </div>

                 <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Sprint Name</label>
                       <input
                         {...register('name')}
                         className="w-full rounded-xl border-gray-200 py-2.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                         placeholder="e.g. Sprint 14 (Horizon)"
                       />
                       {errors.name && <p className="mt-1.5 text-[10px] text-red-600 font-bold uppercase">{errors.name.message}</p>}
                    </div>

                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Sprint Goal</label>
                       <textarea
                         {...register('goal')}
                         rows={3}
                         className="w-full rounded-xl border-gray-200 py-2.5 px-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                         placeholder="What are we aiming to achieve?"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Start Date</label>
                          <input
                            {...register('startDate')}
                            type="date"
                            className="w-full rounded-xl border-gray-200 py-2.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                          />
                          {errors.startDate && <p className="mt-1.5 text-[10px] text-red-600 font-bold uppercase">{errors.startDate.message}</p>}
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
                          <input
                            {...register('endDate')}
                            type="date"
                            className="w-full rounded-xl border-gray-200 py-2.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                          />
                          {errors.endDate && <p className="mt-1.5 text-[10px] text-red-600 font-bold uppercase">{errors.endDate.message}</p>}
                       </div>
                    </div>

                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Story Point Capacity</label>
                       <input
                         {...register('storyPointCapacity', { valueAsNumber: true })}
                         type="number"
                         className="w-full rounded-xl border-gray-200 py-2.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                       />
                       {errors.storyPointCapacity && <p className="mt-1.5 text-[10px] text-red-600 font-bold uppercase">{errors.storyPointCapacity.message}</p>}
                    </div>

                    <div className="pt-8 border-t">
                       <button
                         type="submit"
                         disabled={createMutation.isPending}
                         className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                       >
                         {createMutation.isPending ? 'CREATING...' : 'CREATE SPRINT'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Close Sprint Modal */}
      <CloseSprintModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleClose}
        sprintSummary={closingSummary}
        projectId={pid}
      />
    </div>
  );
}
