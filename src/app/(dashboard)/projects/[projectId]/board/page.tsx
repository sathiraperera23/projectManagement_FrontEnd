'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useKanbanBoard } from '@/hooks/useKanban';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ManageStatusesModal } from '@/components/kanban/ManageStatusesModal';
import {
  ChevronRight,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Layout,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  const [groupBy, setGroupBy] = useState<string>('none');
  const [isCompact, setIsCompact] = useState(false);
  const [subProjectId, setSubProjectId] = useState<number | undefined>();
  const [isManageStatusesOpen, setIsManageStatusesOpen] = useState(false);

  const { data: boardData, isLoading, refetch } = useKanbanBoard(projectId, {
    groupBy: groupBy === 'none' ? undefined : groupBy,
    subProjectId
  });

  const tabs = [
    { name: 'Summary', href: `/projects/${projectId}/summary` },
    { name: 'Board', href: `/projects/${projectId}/board`, active: true },
    { name: 'Backlog', href: `/projects/${projectId}/backlog` },
    { name: 'Timeline', href: `/projects/${projectId}/timeline` },
    { name: 'Sprints', href: `/projects/${projectId}/sprints` },
    { name: 'Settings', href: `/projects/${projectId}/settings` },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full animate-pulse gap-4 p-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-full w-[280px] min-w-[280px] flex-col gap-4 rounded-lg bg-gray-50 p-4">
             <div className="h-6 w-32 rounded bg-gray-200" />
             <div className="h-32 w-full rounded bg-gray-100" />
             <div className="h-32 w-full rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
           <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
             <Link href="/projects" className="hover:text-indigo-600">Projects</Link>
             <ChevronRight className="h-4 w-4" />
             <span className="text-gray-900 font-bold">Project Name</span>
             <ChevronRight className="h-4 w-4" />
             <span className="text-gray-900 font-bold">Board</span>
           </nav>

           <div className="flex items-center gap-3">
             <button
               onClick={() => refetch()}
               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
             >
               <RefreshCw className="h-5 w-5" />
             </button>
             <button
               onClick={() => setIsCompact(!isCompact)}
               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
               title={isCompact ? "Comfortable view" : "Compact view"}
             >
               {isCompact ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
             </button>
             <button
               onClick={() => setIsManageStatusesOpen(true)}
               className="flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
             >
               <Settings className="h-4 w-4" />
               Manage Statuses
             </button>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "pb-3 text-sm font-bold uppercase tracking-wider transition-colors",
                tab.active ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center gap-6 overflow-x-auto">
         <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={subProjectId || ''}
              onChange={(e) => setSubProjectId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent border-none text-sm font-medium text-gray-600 focus:ring-0"
            >
              <option value="">All Sub-projects</option>
            </select>
         </div>

         <div className="h-4 w-px bg-gray-300" />

         <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-600 focus:ring-0"
            >
              <option value="none">None</option>
              <option value="assignee">Assignee</option>
              <option value="priority">Priority</option>
              <option value="subproject">Sub-project</option>
            </select>
         </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden bg-gray-100/50">
         {boardData && (
           <KanbanBoard
             projectId={projectId}
             initialColumns={boardData.columns || boardData}
             isCompact={isCompact}
           />
         )}
      </div>

      <ManageStatusesModal
        isOpen={isManageStatusesOpen}
        onClose={() => setIsManageStatusesOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}
