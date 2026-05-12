'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { bugReportApi } from '@/lib/api/bugReport';
import {
  Search,
  Mail,
  Hash,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  MessageSquare,
  Calendar,
  Activity
} from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import type { TicketTrackingResult, TicketTrackingStatusEntry } from '@/types/bugReport';

export default function BugTrackerPage() {
  const searchParams = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState(searchParams.get('ticketNumber') || '');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<TicketTrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ticketNumber || !email) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await bugReportApi.trackTicket(ticketNumber, email);
      setResult(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No ticket found with that number and email combination. Please check your details and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('ticketNumber')) {
      // Auto-trigger if email is also somehow there, but usually user needs to type email
    }
  }, [searchParams]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Track Your Bug Report</h1>
        <p className="mt-4 text-gray-500 font-medium text-lg max-w-md mx-auto">Enter your ticket number and email address to check the current status of your report.</p>
      </div>

      <form onSubmit={handleTrack} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ticket Number</label>
              <div className="relative">
                 <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input
                   required
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
                   placeholder="e.g. UMS-042"
                   value={ticketNumber}
                   onChange={e => setTicketNumber(e.target.value)}
                 />
              </div>
           </div>
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input
                   required
                   type="email"
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                   placeholder="alex@example.com"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                 />
              </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
        >
           {isLoading ? 'SEARCHING...' : 'TRACK STATUS'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 animate-in shake duration-500">
           <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
           <p className="text-sm font-bold text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           {/* Status Card */}
           <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                 <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{result.title}</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Ticket {result.ticketNumber}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Current Status</p>
                    <StatusBadge status={result.status} />
                 </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-50 bg-gray-50/30">
                 <div className="p-6 flex flex-col items-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Submitted On</p>
                    <p className="text-sm font-bold text-gray-700">{formatDateTime(result.submittedAt)}</p>
                 </div>
                 <div className="p-6 flex flex-col items-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Updated</p>
                    <p className="text-sm font-bold text-gray-700">{formatDateTime(result.lastUpdatedAt)}</p>
                 </div>
              </div>
           </div>

           {/* Message Banner */}
           {result.approvalStatus === 'AwaitingCustomerReply' && (
             <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex items-start gap-6">
                <div className="p-3 bg-white/20 rounded-2xl"><MessageSquare className="h-8 w-8" /></div>
                <div>
                   <h4 className="text-xl font-black">Information Requested</h4>
                   <p className="mt-2 text-indigo-50 font-medium leading-relaxed">Our team has reviewed your report and requires more information to proceed. Please check your email for the specific request and reply directly to that email with the details.</p>
                </div>
             </div>
           )}

           {/* Timeline */}
           <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 border-b border-gray-50 pb-4 flex items-center gap-2">
                 <Activity className="h-4 w-4" />
                 Processing History
              </h4>
              <div className="space-y-10">
                 {result.statusHistory.map((entry, idx) => (
                   <div key={idx} className="relative pl-10 group">
                      {idx !== result.statusHistory.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-[-40px] w-0.5 bg-gray-100" />
                      )}
                      <div className={cn(
                        "absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all",
                        idx === 0 ? "bg-indigo-600 scale-110 ring-4 ring-indigo-50" : "bg-gray-200"
                      )}>
                         {idx === 0 && <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />}
                      </div>
                      <div>
                         <div className="flex items-center justify-between">
                            <h5 className={cn("text-sm font-black uppercase tracking-tight", idx === 0 ? "text-indigo-600" : "text-gray-900")}>
                               {entry.status}
                            </h5>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                               <Clock className="h-3 w-3" />
                               {formatDateTime(entry.occurredAt)}
                            </span>
                         </div>
                         <p className="mt-1 text-sm text-gray-500 font-medium leading-relaxed">{entry.description}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string, color: string }> = {
    'PendingApproval': { label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
    'AwaitingCustomerReply': { label: 'Awaiting Your Reply', color: 'bg-blue-100 text-blue-700' },
    'Approved': { label: 'Accepted — In Progress', color: 'bg-emerald-100 text-emerald-700' },
    'Implementing': { label: 'Being Fixed', color: 'bg-indigo-100 text-indigo-700' },
    'Completed': { label: 'Resolved', color: 'bg-emerald-600 text-white' },
    'Closed': { label: 'Not Actioned', color: 'bg-gray-100 text-gray-600' },
  };

  const c = config[status] || { label: status, color: 'bg-gray-100 text-gray-600' };

  return (
    <span className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest", c.color)}>
       {c.label}
    </span>
  );
}
