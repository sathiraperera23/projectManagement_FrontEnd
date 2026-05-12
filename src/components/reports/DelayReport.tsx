'use client';

import React, { useState } from 'react';
import { useDelayReport } from '@/hooks/useReports';
import { reportsApi } from '@/lib/api/reports';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Download,
  Search,
  Filter,
  User,
  Calendar,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { DelayReportRow } from '@/types/reports';
import toast from 'react-hot-toast';

interface Props {
  projectId: number;
}

export function DelayReport({ projectId }: Props) {
  const [filterType, setFilterType] = useState('All');
  const { data: report, isLoading } = useDelayReport(projectId);

  const exportReport = (format: 'pdf' | 'xlsx' | 'csv') => {
    reportsApi.exportDelays(projectId, format);
  };

  const setReason = async (id: number) => {
    const reason = window.prompt('Enter reason for delay:');
    if (reason) {
      try {
        await reportsApi.setDelayReason(id, reason);
        toast.success('Reason updated');
      } catch {
        toast.error('Update failed');
      }
    }
  };

  if (isLoading) return <div className="p-8 space-y-4">{[1, 2].map(i => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-2xl" />)}</div>;

  const overdueCount = report?.filter((r: DelayReportRow) => r.delayType === 'Overdue').length || 0;
  const avgDelay = report && report.length > 0 ? (report.reduce((acc: number, r: DelayReportRow) => acc + r.daysDelayed, 0) / report.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Overdue Tickets</p>
               <p className="text-3xl font-black text-red-600">{overdueCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-red-600"><AlertCircle className="h-6 w-6" /></div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Delay (Days)</p>
               <p className="text-3xl font-black text-gray-900">{avgDelay}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-gray-400"><Clock className="h-6 w-6" /></div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">On-Time Rate</p>
               <p className="text-3xl font-black text-emerald-600">84%</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
               <Filter className="h-3.5 w-3.5 text-gray-400" />
               <select className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0" value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="All">All Delays</option>
                  <option value="Overdue">Overdue</option>
                  <option value="SprintOverrun">Sprint Overrun</option>
                  <option value="Blocked">Blocked</option>
               </select>
            </div>
         </div>
         <div className="flex items-center gap-2">
            {['PDF', 'XLSX', 'CSV'].map(fmt => (
              <button key={fmt} onClick={() => exportReport(fmt.toLowerCase() as any)} className="px-4 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-50">
                 {fmt}
              </button>
            ))}
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
         <table className="w-full text-left">
            <thead className="bg-gray-50/50">
               <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ticket</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Due Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Delay</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Reason</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {report?.map((row: DelayReportRow) => (
                 <tr key={row.ticketId} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                       <Link href={`/tickets/${row.ticketId}`} className="flex flex-col">
                          <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">#{row.ticketNumber}</span>
                          <span className="text-sm font-bold text-gray-900 mt-0.5">{row.title}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">{row.subProject} • {row.assignee}</span>
                       </Link>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-500 line-through decoration-red-400/50">{formatDate(row.originalDueDate)}</span>
                          {row.revisedDueDate && <span className="text-xs font-bold text-amber-600 mt-0.5">{formatDate(row.revisedDueDate)}</span>}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-red-600">+{row.daysDelayed}d</span>
                          <div className="h-1 w-8 bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-red-500" style={{ width: `${Math.min(100, row.daysDelayed * 5)}%` }} />
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[9px] font-black uppercase tracking-widest">
                          {row.delayType}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs text-gray-500 max-w-xs truncate italic">
                          {row.reason || 'No reason provided'}
                       </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => setReason(row.ticketId)} className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                          <ExternalLink className="h-4 w-4" />
                       </button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
