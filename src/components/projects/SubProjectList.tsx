'use client';

import React from 'react';
import { useSubProjects } from '@/hooks/useProjects';
import { SubProject } from '@/types/project';
import { cn } from '@/lib/utils';
import {
  Link2,
  Plus,
  MoreVertical,
} from 'lucide-react';

interface Props {
  projectId: number;
  productId: number;
}

export function SubProjectList({ projectId, productId }: Props) {
  const { data: subProjects, isLoading } = useSubProjects(projectId, productId);

  if (isLoading) return <div className="p-6 space-y-3">
     {[1, 2].map(i => <div key={i} className="h-10 animate-pulse bg-gray-100 rounded" />)}
  </div>;

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-4">
         <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Sub-projects / Modules</h5>
         <button className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
            <Plus className="h-3 w-3" /> Add Module
         </button>
      </div>

      <div className="space-y-2">
        {subProjects?.map((sp: SubProject) => (
          <div key={sp.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm group">
            <div className="flex items-center gap-4 flex-1">
               <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">{sp.name}</span>
                  {sp.dependsOnSubProjectId && (
                    <Link2 className="h-3 w-3 text-indigo-400" />
                  )}
               </div>

               <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                    sp.status === 'Completed' ? "bg-green-50 text-green-600" :
                    sp.status === 'InProgress' ? "bg-blue-50 text-blue-600" :
                    "bg-gray-50 text-gray-500"
                  )}>
                    {sp.status}
                  </span>
               </div>

               <div className="hidden md:flex items-center gap-2 max-w-[150px] flex-1">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500" style={{ width: `${sp.completionPercentage}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 w-8">{sp.completionPercentage}%</span>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white shadow-sm">
                     {sp.moduleOwnerName.charAt(0)}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 hidden lg:inline">{sp.moduleOwnerName}</span>
               </div>

               <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
               </button>
            </div>
          </div>
        ))}

        {subProjects?.length === 0 && (
           <p className="text-center py-4 text-[10px] text-gray-400 italic font-medium">No sub-projects defined for this version</p>
        )}
      </div>
    </div>
  );
}
