'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  useProjectBacklog,
  useCreateBacklogItem,
  useUpdateBacklogItem,
  useBacklogVersions,
  useBacklogApprovals,
  useRequestApproval
} from '@/hooks/useBacklog';
import { useProjects } from '@/hooks/useProjects';
import {
  ChevronRight,
  Plus,
  Search,
  Filter,
  History,
  CheckCircle2,
  X,
  MoreVertical,
  FileText,
  Clock,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { BacklogItem, BacklogItemVersion, ApprovalRequest } from '@/types/backlog';

export default function ProjectBacklogPage() {
  const { projectId } = useParams();
  const pid = Number(projectId);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: backlog, isLoading } = useProjectBacklog(pid);
  const createMutation = useCreateBacklogItem(pid);

  const tabs = [
    { name: 'Summary', href: `/projects/${pid}/summary` },
    { name: 'Board', href: `/projects/${pid}/board` },
    { name: 'Backlog', href: `/projects/${pid}/backlog`, active: true },
    { name: 'Timeline', href: `/projects/${pid}/timeline` },
    { name: 'Sprints', href: `/projects/${pid}/sprints` },
    { name: 'Settings', href: `/projects/${pid}/settings` },
  ];

  const filteredBacklog = backlog?.filter((item: BacklogItem) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
             <Link href="/projects" className="hover:text-indigo-600">Projects</Link>
             <ChevronRight className="h-3 w-3" />
             <span className="text-gray-900">Backlog</span>
           </nav>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Backlog</h1>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add Item
        </button>
      </div>

      <nav className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-lg transition-all",
              tab.active ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
            {tab.name}
          </Link>
        ))}
      </nav>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search backlog items..."
                className="w-full pl-10 pr-4 py-2 text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <Filter className="h-4 w-4" />
              Filters
           </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
               {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredBacklog.map((item: BacklogItem) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group px-6 py-4 flex items-center justify-between hover:bg-indigo-50/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                     <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-indigo-500 transition-colors">
                        <FileText className="h-5 w-5" />
                     </div>
                     <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{item.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                           <span className={cn(
                             "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                             item.priority === 1 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                           )}>
                             Priority {item.priority}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase">{item.status}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modified</p>
                        <p className="text-xs font-bold text-gray-700">Oct 24, 2023</p>
                     </div>
                     <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                     </button>
                  </div>
                </div>
              ))}
              {filteredBacklog.length === 0 && (
                <div className="p-20 text-center">
                   <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <Search className="h-8 w-8" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900">No items found</h3>
                   <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Item Details Slide-over */}
      {selectedItem && (
        <BacklogItemPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          projectId={pid}
        />
      )}
    </div>
  );
}

function BacklogItemPanel({ item, onClose, projectId }: { item: BacklogItem, onClose: () => void, projectId: number }) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'approvals'>('details');
  const { data: versions } = useBacklogVersions(Number(item.id));
  const { data: approvals } = useBacklogApprovals(Number(item.id));
  const requestApprovalMutation = useRequestApproval(Number(item.id));

  const handleRequestApproval = async () => {
    try {
      await requestApprovalMutation.mutateAsync({ reviewerId: 1 }); // Mock
      toast.success('Approval request sent');
    } catch {
      toast.error('Failed to request approval');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="px-8 py-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <FileText className="h-6 w-6" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">{item.title}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Item ID: #{item.id}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center border-b px-8 bg-gray-50/50">
             {[
               { id: 'details', label: 'Item Details', icon: FileText },
               { id: 'history', label: 'Version History', icon: History },
               { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
             ].map(t => (
               <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
                  activeTab === t.id ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                )}
               >
                 <t.icon className="h-4 w-4" />
                 {t.label}
                 {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'details' && (
              <div className="space-y-10">
                <section>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Description</h3>
                   <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed bg-gray-50 rounded-2xl p-6 border border-gray-100 italic">
                      No description provided for this item yet. Use the refine button below to add details.
                   </div>
                </section>

                <div className="grid grid-cols-2 gap-8">
                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Status</h3>
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-emerald-500" />
                         <span className="text-sm font-bold text-gray-700">{item.status}</span>
                      </div>
                   </section>
                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Created By</h3>
                      <div className="flex items-center gap-2">
                         <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-black text-gray-500">JD</div>
                         <span className="text-sm font-bold text-gray-700">John Doe</span>
                      </div>
                   </section>
                </div>

                <div className="pt-10 border-t border-gray-100 flex flex-col gap-3">
                   <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                      REFINE THIS ITEM
                   </button>
                   <button
                    onClick={handleRequestApproval}
                    className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:border-indigo-100 hover:text-indigo-600 transition-all active:scale-95"
                   >
                      <ShieldCheck className="h-5 w-5" />
                      REQUEST APPROVAL
                   </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                {versions?.map((v: BacklogItemVersion) => (
                  <div key={v.id} className="relative pl-8 pb-8 group">
                     <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-100 group-last:bg-transparent" />
                     <div className="absolute left-[-4px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-200 border-2 border-white ring-2 ring-gray-50 transition-colors group-hover:bg-indigo-500" />

                     <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm group-hover:border-indigo-100 group-hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                           <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-tighter">v{v.versionNumber}</span>
                           <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(v.createdAt)}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-2">{v.changes}</p>
                        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em] hover:underline">Rollback to this version</button>
                     </div>
                  </div>
                ))}
                {(!versions || versions.length === 0) && (
                   <div className="text-center py-12">
                      <History className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No history available</p>
                   </div>
                )}
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="space-y-4">
                {approvals?.map((a: ApprovalRequest) => (
                   <div key={a.id} className={cn(
                     "rounded-2xl border p-6 flex items-center justify-between",
                     a.status === 'Approved' ? "border-emerald-100 bg-emerald-50/30" :
                     a.status === 'Rejected' ? "border-red-100 bg-red-50/30" :
                     "border-indigo-100 bg-indigo-50/30"
                   )}>
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "h-10 w-10 rounded-xl flex items-center justify-center",
                           a.status === 'Approved' ? "bg-emerald-100 text-emerald-600" :
                           a.status === 'Rejected' ? "bg-red-100 text-red-600" :
                           "bg-indigo-100 text-indigo-600"
                         )}>
                            <ShieldCheck className="h-6 w-6" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-900">Review Request</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Assigned to Lead Architect</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className={cn(
                           "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                           a.status === 'Approved' ? "bg-emerald-500 text-white" :
                           a.status === 'Rejected' ? "bg-red-500 text-white" :
                           "bg-indigo-500 text-white"
                         )}>
                            {a.status}
                         </span>
                      </div>
                   </div>
                ))}
                {(!approvals || approvals.length === 0) && (
                  <div className="bg-indigo-50/50 border border-dashed border-indigo-100 rounded-3xl p-12 text-center">
                     <AlertCircle className="h-10 w-10 text-indigo-200 mx-auto mb-4" />
                     <h4 className="text-lg font-bold text-indigo-900 mb-2">No approval requests</h4>
                     <p className="text-sm text-indigo-600/70 max-w-xs mx-auto mb-6">This item has not been submitted for formal architectural or business review yet.</p>
                     <button
                      onClick={handleRequestApproval}
                      className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                     >
                        Request Review
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
