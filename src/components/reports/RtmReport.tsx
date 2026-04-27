'use client';

import React, { useState } from 'react';
import { useRtmReport } from '@/hooks/useReports';
import { useProjects } from '@/hooks/useProjects';
import { reportsApi } from '@/lib/api/reports';
import {
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Filter,
  Package,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { RtmRow, LinkedTicketSummary } from '@/types/reports';

interface Props {
  projectId: number;
}

export function RtmReport({ projectId }: Props) {
  const [subProjectId, setSubProjectId] = useState<number | undefined>();
  const [productId, setProductId] = useState<number | undefined>();

  const { data: report, isLoading } = useRtmReport(projectId, { subProjectId, productId });
  const { data: products } = useProjects(); // Simplified

  const exportReport = (format: 'pdf' | 'xlsx') => {
    reportsApi.exportRtm(projectId, format);
  };

  if (isLoading) return <div className="p-8 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />)}</div>;

  const totalRequirements = report?.length || 0;
  const gapCount = report?.filter((r: RtmRow) => r.hasCoverageGap).length || 0;
  const coveredCount = totalRequirements - gapCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-1 mr-4">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Requirements</p>
              <p className="text-xl font-black text-gray-900">{totalRequirements}</p>
           </div>
           <div className="h-8 w-px bg-gray-100" />
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Covered</p>
              <p className="text-xl font-black text-emerald-600">{coveredCount}</p>
           </div>
           <div className="h-8 w-px bg-gray-100" />
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gaps Found</p>
              <p className={cn("text-xl font-black", gapCount > 0 ? "text-amber-600" : "text-gray-900")}>{gapCount}</p>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <button
            onClick={() => exportReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
           >
              <Download className="h-3.5 w-3.5" /> PDF
           </button>
           <button
            onClick={() => exportReport('xlsx')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
           >
              <Download className="h-3.5 w-3.5" /> Excel
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Requirement</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Linked Tickets</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Test Coverage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {report?.map((row: RtmRow) => (
              <tr key={row.requirementId} className={cn("transition-colors", row.hasCoverageGap ? "bg-amber-50/30" : "hover:bg-gray-50/30")}>
                <td className="px-6 py-4">
                   <div className="flex items-start gap-3">
                      {row.hasCoverageGap && <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-tighter">{row.requirementId}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{row.requirementDescription}</p>
                        <div className="flex items-center gap-4 mt-2">
                           {row.useCaseNumber && <span className="text-[10px] font-bold text-gray-400 uppercase">UC: {row.useCaseNumber}</span>}
                           {row.userStory && <span className="text-[10px] font-bold text-gray-400 uppercase">Story: {row.userStory}</span>}
                        </div>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-wrap gap-1.5">
                      {row.linkedTickets.map((t: LinkedTicketSummary) => (
                        <Link
                          key={t.ticketNumber}
                          href={`/tickets/${t.ticketNumber}`}
                          className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-100 rounded text-[10px] font-bold text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors shadow-sm"
                        >
                           <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.statusColour }} />
                           {t.ticketNumber}
                        </Link>
                      ))}
                      {row.linkedTickets.length === 0 && <span className="text-xs text-amber-600 font-bold italic">No tickets linked</span>}
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="text-xs font-bold text-gray-700">{row.ticketStatus || '–'}</span>
                </td>
                <td className="px-6 py-4">
                   <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-900">{row.testCaseNumber || '–'}</p>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", row.testStatus === 'Passed' ? "text-emerald-600" : "text-gray-400")}>
                        {row.testStatus || 'Not Tested'}
                      </p>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
