'use client';

import React from 'react';
import { useDelaysDashboard } from '@/hooks/useReports';
import { reportsApi } from '@/lib/api/reports';
import {
  AlertCircle,
  ShieldAlert,
  Flag,
  Layers,
  ChevronRight,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Props {
  projectId: number;
}

export function DelaysDashboard({ projectId }: Props) {
  const { data: dashboard, isLoading } = useDelaysDashboard(projectId);

  const setRevisedDate = async (id: number) => {
    const date = window.prompt('Enter revised due date (YYYY-MM-DD):');
    if (date) {
      try {
        await reportsApi.setRevisedDueDate(id, date);
        toast.success('Revised date set');
      } catch {
        toast.error('Update failed');
      }
    }
  };

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">{[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-3xl" />)}</div>;
  if (!dashboard) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Overdue Tickets */}
      <DashboardSection
        title="Overdue Tickets"
        count={dashboard.overdueTickets.length}
        icon={AlertCircle}
        color="text-red-600"
      >
        <div className="divide-y divide-gray-50">
           {dashboard.overdueTickets.map(t => (
             <div key={t.ticketId} className="py-4 flex items-center justify-between group">
                <div className="min-w-0 pr-4">
                   <p className="text-xs font-black text-red-600 uppercase tracking-tighter">#{t.ticketNumber}</p>
                   <p className="text-sm font-bold text-gray-900 truncate">{t.title}</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{t.assignee} • {t.daysDelayed} days overdue</p>
                </div>
                <button onClick={() => setRevisedDate(t.ticketId)} className="shrink-0 p-2 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                   <Calendar className="h-4 w-4" />
                </button>
             </div>
           ))}
        </div>
      </DashboardSection>

      {/* Blocked Tickets */}
      <DashboardSection
        title="Blocked Work"
        count={dashboard.blockedTickets.length}
        icon={ShieldAlert}
        color="text-amber-600"
      >
        <div className="divide-y divide-gray-50">
           {dashboard.blockedTickets.map(t => (
             <div key={t.ticketId} className="py-4 flex items-start justify-between">
                <div className="min-w-0 pr-4">
                   <p className="text-xs font-black text-amber-600 uppercase tracking-tighter">#{t.ticketNumber}</p>
                   <p className="text-sm font-bold text-gray-900 line-clamp-2">{t.title}</p>
                </div>
                <Link href={`/tickets/${t.ticketId}`} className="p-2 text-gray-300 hover:text-indigo-600">
                   <ExternalLink className="h-4 w-4" />
                </Link>
             </div>
           ))}
        </div>
      </DashboardSection>

      {/* Milestones at Risk */}
      <DashboardSection
        title="Milestones at Risk"
        count={dashboard.milestoneAtRisk.length}
        icon={Flag}
        color="text-red-500"
      >
        <div className="divide-y divide-gray-50">
           {dashboard.milestoneAtRisk.map((m, i) => (
             <div key={i} className="py-4 flex items-center justify-between">
                <div>
                   <p className="text-sm font-bold text-gray-900">{m.name}</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Target: {formatDate(m.targetDate)}</p>
                </div>
                <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase">
                   {m.daysOverdue}d Late
                </div>
             </div>
           ))}
        </div>
      </DashboardSection>

      {/* Sub-project Delays */}
      <DashboardSection
        title="Impacted Modules"
        count={dashboard.subProjectDelays.length}
        icon={Layers}
        color="text-indigo-600"
      >
        <div className="divide-y divide-gray-50">
           {dashboard.subProjectDelays.map((sp, i) => (
             <div key={i} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-indigo-50/30 px-2 -mx-2 rounded-xl transition-colors">
                <div>
                   <p className="text-sm font-bold text-gray-900">{sp.subProjectName}</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{sp.delayedTicketCount} tickets affected</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
             </div>
           ))}
        </div>
      </DashboardSection>
    </div>
  );
}

function DashboardSection({ title, count, icon: Icon, color, children }: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
       <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
             <div className={cn("p-2 rounded-xl bg-white shadow-sm", color)}>
                <Icon className="h-5 w-5" />
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-600">{title}</h3>
          </div>
          <span className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-black text-white">
             {count}
          </span>
       </div>
       <div className="flex-1 overflow-y-auto px-6">
          {children}
          {count === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
               <CheckCircle2 className="h-10 w-10 mb-2 text-emerald-500" />
               <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">All Clear</p>
            </div>
          )}
       </div>
    </div>
  );
}
