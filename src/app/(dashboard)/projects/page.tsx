'use client';

import React, { useState } from 'react';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { useAuthStore } from '@/store/authStore';
import {
  Plus,
  Search,
  Calendar,
  Archive,
  LayoutGrid,
  X
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Project } from '@/types/project';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  clientName: z.string().min(1, 'Client name is required'),
  projectCode: z.string().max(5).optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  expectedEndDate: z.string().min(1, 'End date is required'),
  colour: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const user = useAuthStore(state => state.user);
  const canCreate = user?.roles.includes('Admin') || user?.roles.includes('ProjectManager');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      colour: '#6366f1'
    }
  });

  const filteredProjects = projects?.filter((p: Project) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' ||
                          (statusFilter === 'Archived' ? p.isArchived : p.status === statusFilter && !p.isArchived);
    return matchesSearch && matchesStatus;
  });

  const onSubmit = async (data: ProjectFormValues) => {
    await createMutation.mutateAsync(data as unknown as Parameters<typeof createMutation.mutateAsync>[0]);
    setIsCreateOpen(false);
    reset();
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">Manage and track your project portfolio</p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {['All', 'Active', 'OnHold', 'Completed', 'Archived'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                statusFilter === f ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {f === 'OnHold' ? 'On Hold' : f}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-gray-200 pl-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : filteredProjects?.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
           <LayoutGrid className="mx-auto h-12 w-12 text-gray-400" />
           <h3 className="mt-4 text-lg font-semibold text-gray-900">No projects found</h3>
           <p className="mt-2 text-sm text-gray-500 max-w-sm">
             Try adjusting your search or filters, or create a new project to get started.
           </p>
           {canCreate && (
             <button
               onClick={() => setIsCreateOpen(true)}
               className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
             >
               Create Project
             </button>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredProjects?.map((project: Project) => (
             <Link
               key={project.id}
               href={`/projects/${project.id}/summary`}
               className={cn(
                 "group relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200",
                 project.isArchived && "opacity-60 grayscale-[0.5]"
               )}
             >
                <div
                  className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: project.colour || '#6366f1' }}
                />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     {project.avatarUrl ? (
                       <img src={project.avatarUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                     ) : (
                       <span className="text-sm font-bold">{project.projectCode || project.name.slice(0, 3).toUpperCase()}</span>
                     )}
                  </div>
                  <div className="flex items-center gap-2">
                     {project.isArchived && (
                       <span className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 uppercase">
                         <Archive className="h-3 w-3" /> Archived
                       </span>
                     )}
                     <span className={cn(
                       "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                       project.status === 'Active' ? "bg-green-100 text-green-700" :
                       project.status === 'OnHold' ? "bg-amber-100 text-amber-700" :
                       "bg-gray-100 text-gray-700"
                     )}>
                       {project.status}
                     </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 truncate transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{project.clientName}</p>
                </div>

                <div className="mt-auto space-y-4">
                   <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-500">
                         <Calendar className="h-3.5 w-3.5" />
                         <span>Ends {formatDate(project.expectedEndDate)}</span>
                      </div>
                      <div className="font-semibold text-indigo-600">65%</div>
                   </div>
                   <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }} />
                   </div>
                </div>
             </Link>
           ))}
        </div>
      )}

      {/* Create Project Slide-over */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
           <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCreateOpen(false)} />
           <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
              <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
                 <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Create New Project</h2>
                    <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-500">
                       <X className="h-6 w-6" />
                    </button>
                 </div>
                 <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div>
                       <label className="block text-sm font-medium text-gray-700">Project Name</label>
                       <input {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                       {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700">Client Name</label>
                       <input {...register('clientName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                       {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Start Date</label>
                          <input type="date" {...register('startDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Expected End Date</label>
                          <input type="date" {...register('expectedEndDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700">Description</label>
                       <textarea {...register('description')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Project Colour</label>
                       <div className="flex flex-wrap gap-2">
                          {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#4b5563'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setValue('colour', c)}
                              className={cn(
                                "h-8 w-8 rounded-full border-2 transition-all",
                                watch('colour') === c ? "border-gray-900 scale-110" : "border-transparent"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                       </div>
                    </div>
                 </form>
                 <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={createMutation.isPending}
                      className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create Project'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
