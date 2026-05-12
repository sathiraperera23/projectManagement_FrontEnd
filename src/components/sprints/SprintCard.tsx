'use client';

import React from 'react';
import type { Sprint } from '@/types/sprint';
import { cn, formatDate } from '@/lib/utils';
import {
  Calendar,
  Flag,
  Play,
  CheckCircle2,
  Settings,
  Trash2,
  ChevronRight,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface Props {
  sprint: Sprint;
  onActivate?: (id: number) => void;
  onEdit?: (sprint: Sprint) => void;
  onDelete?: (id: number) => void;
  onClose?: (id: number) => void;
  onViewSummary?: (id: number) => void;
}

export function SprintCard({ sprint, onActivate, onEdit, onDelete, onClose, onViewSummary }: Props) {
  const isPlanning = sprint.status === 'Planning';
  const isActive = sprint.status === 'Active';
  const isClosed = sprint.status === 'Closed';

  const percentage = sprint.completionPercentage;
  const data = [{ name: 'Progress', value: percentage, fill: '#3b82f6' }];

  return (
    <div className={cn(
      "relative flex flex-col gap-4 rounded-xl border bg-white p-6 transition-all hover:shadow-md",
      isActive ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <h3 className="text-lg font-bold text-gray-900">{sprint.name}</h3>
             <span className={cn(
               "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
               isPlanning ? "bg-gray-100 text-gray-600" :
               isActive ? "bg-indigo-100 text-indigo-700" :
               "bg-emerald-100 text-emerald-700"
             )}>
               {sprint.status}
             </span>
          </div>
          {sprint.goal && <p className="text-sm text-gray-500 line-clamp-1">{sprint.goal}</p>}
        </div>

        <div className="flex items-center gap-2">
           {isPlanning && (
             <>
               <button
                 onClick={() => onActivate?.(sprint.id)}
                 className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
               >
                 <Play className="h-3 w-3 fill-current" /> Activate
               </button>
               <button onClick={() => onEdit?.(sprint)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                 <Settings className="h-4 w-4" />
               </button>
               <button onClick={() => onDelete?.(sprint.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                 <Trash2 className="h-4 w-4" />
               </button>
             </>
           )}
           {isActive && (
             <button
               onClick={() => onClose?.(sprint.id)}
               className="flex items-center gap-1 rounded-md border border-indigo-600 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
             >
               Close Sprint
             </button>
           )}
           {isClosed && (
             <button
               onClick={() => onViewSummary?.(sprint.id)}
               className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
             >
               <LayoutDashboard className="h-3 w-3" /> Summary
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
         {/* Stats */}
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Dates</p>
                  <p className="text-xs font-bold text-gray-700">{formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                  <Flag className="h-4 w-4" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Points</p>
                  <p className="text-xs font-bold text-gray-700">
                    <span className="text-indigo-600">{sprint.plannedStoryPoints}</span> / {sprint.storyPointCapacity}
                  </p>
               </div>
            </div>
         </div>

         {/* Middle Section */}
         <div className="flex flex-col justify-center">
            {isActive ? (
              <div className="space-y-2">
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-500 uppercase tracking-tighter flex items-center gap-1">
                      <Clock className={cn("h-3 w-3", sprint.daysRemaining <= 3 ? "text-red-500" : "text-gray-400")} />
                      Time Remaining
                    </span>
                    <span className={cn(sprint.daysRemaining <= 3 ? "text-red-600" : "text-gray-900")}>
                      {sprint.daysRemaining} days
                    </span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full", sprint.daysRemaining <= 3 ? "bg-red-500" : "bg-indigo-500")}
                      style={{ width: `${Math.max(0, 100 - (sprint.daysRemaining * 10))}%` }}
                    />
                 </div>
              </div>
            ) : isPlanning ? (
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                 <p className="text-sm font-medium text-gray-600">Waiting for activation...</p>
              </div>
            ) : (
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Closed On</p>
                 <p className="text-sm font-bold text-gray-900">{sprint.closedAt ? formatDate(sprint.closedAt) : '–'}</p>
              </div>
            )}
         </div>

         {/* Completion Circle */}
         <div className="flex items-center justify-center">
            <div className="relative h-20 w-20">
               <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="80%"
                    outerRadius="100%"
                    data={data}
                    startAngle={90}
                    endAngle={450}
                  >
                    <RadialBar
                      background
                      dataKey="value"
                      cornerRadius={10}
                    />
                  </RadialBarChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-gray-900">{percentage}%</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase">Done</span>
               </div>
            </div>
         </div>
      </div>

      {sprint.isOverCapacity && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-[10px] font-bold text-red-700 border border-red-100">
           Over capacity by {sprint.plannedStoryPoints - sprint.storyPointCapacity} points
        </div>
      )}

      <div className="absolute right-4 bottom-4">
         <ChevronRight className="h-5 w-5 text-gray-300" />
      </div>
    </div>
  );
}
