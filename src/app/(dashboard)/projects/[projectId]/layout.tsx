'use client';

import React from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, Archive } from 'lucide-react';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = Number(params.projectId);
  const { data: project, isLoading } = useProject(projectId);

  const tabs = [
    { name: 'Summary', href: `/projects/${projectId}/summary` },
    { name: 'Board', href: `/projects/${projectId}/board` },
    { name: 'Backlog', href: `/projects/${projectId}/backlog` },
    { name: 'Timeline', href: `/projects/${projectId}/timeline` },
    { name: 'Sprints', href: `/projects/${projectId}/sprints` },
    { name: 'Settings', href: `/projects/${projectId}/settings` },
  ];

  if (isLoading) return <div className="p-8 animate-pulse">Loading project...</div>;
  if (!project) return <div className="p-8 text-center">Project not found</div>;

  return (
    <div className="flex h-full flex-col">
      {project.isArchived && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 py-2 text-sm font-bold text-amber-800 border-b border-amber-100">
           <Archive className="h-4 w-4" />
           This project is archived — read only
        </div>
      )}

      <div className="bg-white border-b border-gray-200 px-6 pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
           <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
             <Link href="/projects" className="hover:text-indigo-600">Projects</Link>
             <ChevronRight className="h-4 w-4" />
             <span className="text-gray-900 font-bold">{project.name}</span>
           </nav>

           <div className="flex items-center gap-3">
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase",
                project.status === 'Active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              )}>
                {project.status}
              </span>
           </div>
        </div>

        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "pb-3 text-sm font-bold uppercase tracking-wider transition-colors",
                pathname.startsWith(tab.href) ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
         {children}
      </div>
    </div>
  );
}
