'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useProjectSummary } from '@/hooks/useProjects';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  CheckCircle2,
  Download,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { projectsApi } from '@/lib/api/projects';
import type { StatusCount, TeamActivityItem, RecentTicket, MilestoneSummary } from '@/types/project';

export default function ProjectSummaryPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: summary, isLoading } = useProjectSummary(projectId);

  if (isLoading) return <div className="p-8">Loading summary...</div>;
  if (!summary) return <div className="p-8">Summary not available</div>;

  const progressData = summary.progressOverview.map((p: StatusCount) => ({
    name: p.statusName,
    value: p.count,
    color: p.colour
  }));

  const teamData = summary.teamActivity.map((t: TeamActivityItem) => ({
    name: t.teamName,
    updates: t.updatesLast7Days
  }));

  const handleExport = async () => {
    try {
      const blob = await projectsApi.exportSummary(projectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Project_Summary_${projectId}.pdf`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 p-6 gap-6">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-bold text-gray-900">Project Summary</h2>
         <button
           onClick={handleExport}
           className="flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
         >
           <Download className="h-4 w-4" />
           Export PDF
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* WIP Status */}
         <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">WIP Status</h3>
               <div className={cn(
                 "h-2.5 w-2.5 rounded-full",
                 summary.wipStatus.level === 'Green' ? "bg-green-500" : summary.wipStatus.level === 'Amber' ? "bg-amber-500" : "bg-red-500"
               )} />
            </div>
            <div className="flex items-baseline gap-1">
               <span className="text-3xl font-bold text-gray-900">{summary.wipStatus.count}</span>
               <span className="text-sm text-gray-500">of {summary.wipStatus.limit} limit</span>
            </div>
         </div>

         {/* Delays */}
         <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delay Summary</h3>
            <div className="flex gap-6">
               <div>
                  <p className="text-2xl font-bold text-red-600">{summary.delaySummary.overdueCount}</p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase">Overdue</p>
               </div>
               <div>
                  <p className="text-2xl font-bold text-amber-600">{summary.delaySummary.blockedCount}</p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase">Blocked</p>
               </div>
            </div>
         </div>

         {/* Days Remaining */}
         <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time Remaining</h3>
            <div className="flex items-baseline gap-1">
               <span className={cn("text-3xl font-bold", summary.daysRemaining < 0 ? "text-red-600" : "text-gray-900")}>
                  {Math.abs(summary.daysRemaining)}
               </span>
               <span className="text-sm text-gray-500">{summary.daysRemaining < 0 ? 'days overdue' : 'days left'}</span>
            </div>
         </div>

         {/* Team Load */}
         <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Sprint</h3>
            <p className="text-sm font-bold text-gray-900 truncate">{summary.sprintSummary.name}</p>
            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500" style={{ width: `${summary.sprintSummary.completionPercentage}%` }} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Progress Overview Chart */}
         <div className="lg:col-span-1 rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Progress Overview</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={progressData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {progressData.map((entry: { color: string }, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="bottom" />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Team Activity Chart */}
         <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Team Activity (Last 7 Days)</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                     <Tooltip cursor={{ fill: '#f3f4f6' }} />
                     <Bar dataKey="updates" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Recent Tickets */}
         <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-sm font-bold text-gray-900">Recent Tickets</h3>
               <button className="text-xs font-bold text-indigo-600">View All</button>
            </div>
            <div className="divide-y divide-gray-50">
               {summary.recentTickets.map((ticket: RecentTicket) => (
                 <div key={ticket.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-bold text-gray-400 w-16">{ticket.ticketNumber}</span>
                       <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{ticket.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span
                         className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase"
                         style={{ backgroundColor: ticket.statusColour }}
                       >
                         {ticket.status}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Milestones */}
         <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
               <h3 className="text-sm font-bold text-gray-900">Upcoming Milestones</h3>
            </div>
            <div className="p-6 space-y-6">
               {summary.milestoneSummary.map((m: MilestoneSummary) => (
                 <div key={m.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className={cn(
                            "h-4 w-4",
                            m.status === 'OnTrack' ? "text-green-500" : m.status === 'AtRisk' ? "text-amber-500" : "text-red-500"
                          )} />
                          <span className="text-sm font-bold text-gray-700">{m.name}</span>
                       </div>
                       <span className="text-xs text-gray-500">{formatDate(m.targetDate)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              m.status === 'OnTrack' ? "bg-green-500" : m.status === 'AtRisk' ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${m.completionPercentage}%` }}
                          />
                       </div>
                       <span className="text-[10px] font-bold text-gray-600">{m.completionPercentage}%</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
