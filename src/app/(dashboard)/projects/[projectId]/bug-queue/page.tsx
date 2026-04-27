'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useBugApprovalQueue,
  useBugSubmissions,
  useApproveBug,
  useRejectBug,
  useRequestMoreInfo,
  useBugSla,
  useUpdateBugSla
} from '@/hooks/useAdmin';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  ShieldCheck,
  Settings,
  X
} from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { BugApprovalQueueItem, CustomerBugSubmission } from '@/types/bugReport';

export default function BugQueuePage() {
  const { projectId } = useParams();
  const pid = Number(projectId);

  const [activeTab, setActiveTab] = useState<'pending' | 'awaiting' | 'all'>('pending');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);

  const { data: queue, isLoading: loadingQueue } = useBugApprovalQueue(pid);
  const { data: submissions, isLoading: loadingSubmissions } = useBugSubmissions(pid);
  const { data: sla } = useBugSla(pid);

  const approveMutation = useApproveBug(pid);
  const rejectMutation = useRejectBug(pid);
  const infoMutation = useRequestMoreInfo(pid);
  const updateSlaMutation = useUpdateBugSla(pid);

  const handleReject = async (id: number) => {
    const reason = window.prompt('Please provide a reason for rejection (required):');
    if (!reason) return;
    try {
      await rejectMutation.mutateAsync({ ticketId: id, reason });
      toast.success('Bug rejected and customer notified');
    } catch {
      toast.error('Failed to reject bug');
    }
  };

  const handleMoreInfo = async (id: number) => {
    const message = window.prompt('Message to customer:');
    if (!message) return;
    try {
      await infoMutation.mutateAsync({ ticketId: id, message });
      toast.success('Information request sent to customer');
    } catch {
      toast.error('Failed to send request');
    }
  };

  const pendingItems = queue?.filter((i: BugApprovalQueueItem) => i.approvalStatus === 'PendingApproval') || [];
  const awaitingItems = queue?.filter((i: BugApprovalQueueItem) => i.approvalStatus === 'AwaitingCustomerReply') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Bug Approval Queue</h1>
        <button
          onClick={() => setIsSlaModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
        >
          <Settings className="h-4 w-4" />
          SLA CONFIG
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
           <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setActiveTab('pending')}
                className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", activeTab === 'pending' ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600")}
              >
                Pending ({pendingItems.length})
              </button>
              <button
                onClick={() => setActiveTab('awaiting')}
                className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", activeTab === 'awaiting' ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600")}
              >
                Awaiting Info ({awaitingItems.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", activeTab === 'all' ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600")}
              >
                All Submissions
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab !== 'all' ? (
            <div className="divide-y divide-gray-50">
               {(activeTab === 'pending' ? pendingItems : awaitingItems).map((item: BugApprovalQueueItem) => (
                 <div key={item.ticketId} className="group">
                    <div
                      onClick={() => setExpandedId(expandedId === item.ticketId ? null : item.ticketId)}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                       <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs",
                            item.severity === 'Critical' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                          )}>
                             {item.severity.charAt(0)}
                          </div>
                          <div className="min-w-0">
                             <p className="text-xs font-black text-indigo-600 uppercase tracking-tighter">#{item.ticketNumber}</p>
                             <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{item.senderName} • {item.senderEmail}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right min-w-[120px]">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SLA Deadline</p>
                             <div className={cn(
                               "flex items-center justify-end gap-1.5 text-xs font-bold mt-0.5",
                               item.isBreachingSla ? "text-red-600" : item.isApproachingSla ? "text-amber-600" : "text-emerald-600"
                             )}>
                                {item.isBreachingSla && <AlertCircle className="h-3.5 w-3.5" />}
                                {formatDateTime(item.slaDeadline)}
                             </div>
                          </div>
                          {expandedId === item.ticketId ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                       </div>
                    </div>

                    {expandedId === item.ticketId && (
                      <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-2">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-6">
                               <section>
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                                  <p className="text-sm text-gray-700 leading-relaxed font-medium">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bug description would go here.</p>
                               </section>
                               <section>
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Steps to Reproduce</h4>
                                  <div className="text-sm text-gray-700 space-y-1 font-medium">
                                     <p>1. Open the application</p>
                                     <p>2. Click on settings</p>
                                     <p>3. Observe crash</p>
                                  </div>
                               </section>
                            </div>
                            <div className="space-y-6">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-white rounded-xl border border-gray-100">
                                     <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Environment</p>
                                     <p className="text-xs font-bold text-gray-700">Chrome, Windows 11</p>
                                  </div>
                                  <div className="p-3 bg-white rounded-xl border border-gray-100">
                                     <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Submitted</p>
                                     <p className="text-xs font-bold text-gray-700">{formatDateTime(item.submittedAt)}</p>
                                  </div>
                               </div>
                               <section>
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Attachments</h4>
                                  <div className="flex gap-2">
                                     <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50"><Download className="h-3 w-3" /> screenshot_1.png</button>
                                  </div>
                               </section>
                            </div>
                         </div>

                         <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                            <button
                              onClick={() => approveMutation.mutate(item.ticketId)}
                              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                            >
                               <CheckCircle2 className="h-4 w-4" /> APPROVE BUG
                            </button>
                            <button
                              onClick={() => handleReject(item.ticketId)}
                              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
                            >
                               <XCircle className="h-4 w-4" /> REJECT
                            </button>
                            <button
                              onClick={() => handleMoreInfo(item.ticketId)}
                              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                            >
                               <MessageSquare className="h-4 w-4" /> REQUEST INFO
                            </button>
                         </div>
                      </div>
                    )}
                 </div>
               ))}
               {(activeTab === 'pending' ? pendingItems : awaitingItems).length === 0 && (
                 <div className="py-20 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No items in this queue</p>
                 </div>
               )}
            </div>
          ) : (
            <table className="w-full text-left">
               <thead className="bg-gray-50/50">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Submission</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Received</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Result</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {submissions?.map((s: CustomerBugSubmission) => (
                    <tr key={s.id} className="hover:bg-gray-50/30">
                       <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{s.parsedTitle || 'No Title'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{s.senderEmail}</p>
                       </td>
                       <td className="px-6 py-4 text-xs font-bold text-gray-500">{formatDateTime(s.receivedAt)}</td>
                       <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
                            s.parseStatus === 'Parsed' ? "bg-emerald-50 text-emerald-600" :
                            s.parseStatus === 'Duplicate' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                          )}>
                             {s.parseStatus}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          {s.createdTicketNumber ? (
                            <span className="text-xs font-black text-indigo-600 uppercase">#{s.createdTicketNumber}</span>
                          ) : <span className="text-xs font-bold text-gray-300 italic">No Ticket</span>}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SLA Modal */}
      {isSlaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bug SLA Configuration</h3>
                 <button onClick={() => setIsSlaModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">SLA Target (Business Days)</label>
                    <input type="number" className="w-full rounded-xl border-gray-200 px-4 py-3 font-bold" defaultValue={sla?.slaBusinessDays || 3} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Escalate After (Days)</label>
                    <input type="number" className="w-full rounded-xl border-gray-200 px-4 py-3 font-bold" defaultValue={sla?.escalateAfterDays || 1} />
                 </div>
                 <button onClick={() => setIsSlaModalOpen(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">
                    SAVE SLA RULES
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
