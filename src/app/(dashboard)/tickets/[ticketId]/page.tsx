'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTicket, useUpdateTicket, useTicketComments } from '@/hooks/useTickets';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import { CommentItem } from '@/components/tickets/CommentItem';
import { CommentInput } from '@/components/tickets/CommentInput';
import { AttachmentList } from '@/components/tickets/AttachmentList';
import { TimeLogPanel } from '@/components/tickets/TimeLogPanel';
import { StatusChangeModal } from '@/components/tickets/StatusChangeModal';
import type { TicketComment, TicketAssignee } from '@/types/ticket';
import {
  ChevronRight,
  Calendar,
  User,
  AlertCircle,
  MoreHorizontal,
  ArrowLeft,
  Eye,
  Link2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Number(params.ticketId);

  const { data: ticket, isLoading, isError } = useTicket(ticketId);
  const { data: comments } = useTicketComments(ticketId);
  const updateMutation = useUpdateTicket(ticketId);

  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 's') {
        e.preventDefault();
        setIsStatusModalOpen(true);
      } else if (e.key === 'e') {
        e.preventDefault();
        setIsEditingDescription(true);
      } else if (e.key === 'c') {
        e.preventDefault();
        setActiveTab('comments');
        // Small delay to allow tab switch if needed
        setTimeout(() => {
           document.querySelector('.tiptap')?.scrollIntoView({ behavior: 'smooth' });
           (document.querySelector('.tiptap') as HTMLElement)?.focus();
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: ticket?.description || '',
    immediatelyRender: false,
  });

  useEffect(() => {
    if (ticket?.description && editor && !isEditingDescription) {
      editor.commands.setContent(ticket.description);
    }
  }, [ticket?.description, editor, isEditingDescription]);

  const handleSaveDescription = async () => {
    if (editor) {
      await updateMutation.mutateAsync({ description: editor.getHTML() });
      setIsEditingDescription(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Ticket not found</h2>
        <p className="text-gray-500 mt-2">The ticket you are looking for does not exist or you don&apos;t have access.</p>
        <button
          onClick={() => router.push('/my-tickets')}
          className="mt-6 flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <span className="hover:text-indigo-600 cursor-pointer">{ticket.projectName}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-indigo-600 cursor-pointer">{ticket.productName}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{ticket.ticketNumber}</span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            Change Status
          </button>
          <button className="flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm">
            Reassign
          </button>
          <button className="rounded-md border border-gray-200 p-2 text-gray-400 hover:bg-gray-50">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Main Content (65%) */}
        <div className="flex-1 overflow-y-auto pr-4 space-y-8">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {ticket.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <TicketStatusBadge status={ticket.status.name} colour={ticket.status.colour} />
              <PriorityBadge priority={ticket.priority} />
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {ticket.category}
              </span>
              {ticket.isOverdue && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 uppercase tracking-tight">
                  <AlertCircle className="h-3 w-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Description</h2>
              {!isEditingDescription && (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Edit
                </button>
              )}
            </div>

            <div className={cn(
              "rounded-lg border bg-white p-4 transition-all",
              isEditingDescription ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200"
            )}>
              {isEditingDescription ? (
                <div className="space-y-4">
                  <EditorContent editor={editor} className="prose prose-sm max-w-none min-h-[150px]" />
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setIsEditingDescription(false)}
                      className="text-sm font-medium text-gray-500 px-3 py-1.5 hover:bg-gray-50 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDescription}
                      className="bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded hover:bg-indigo-700 shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: ticket.description }} />
              )}
            </div>
          </div>

          {/* Bug Details */}
          {ticket.category === 'Bug' && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-red-200 pb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h2 className="text-sm font-bold text-red-800 uppercase tracking-wider">Bug Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-red-700 uppercase mb-2">Steps to Reproduce</h3>
                    <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                       {ticket.stepsToReproduce || <span className="italic text-gray-400">Not provided</span>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-red-700 uppercase mb-2">Environment</h3>
                    <span className="inline-block rounded bg-white px-2 py-1 text-sm font-medium text-gray-700 border border-red-200">
                      {ticket.environment || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-red-700 uppercase mb-2">Expected Behaviour</h3>
                    <div className="text-sm text-gray-700">
                      {ticket.expectedBehaviour || <span className="italic text-gray-400">Not provided</span>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-red-700 uppercase mb-2">Actual Behaviour</h3>
                    <div className="text-sm text-gray-700">
                      {ticket.actualBehaviour || <span className="italic text-gray-400">Not provided</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Section */}
          <div className="space-y-6">
            <div className="flex items-center border-b border-gray-200 gap-8">
              <button
                onClick={() => setActiveTab('comments')}
                className={cn(
                  "pb-4 text-sm font-bold uppercase tracking-wider transition-colors",
                  activeTab === 'comments' ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Comments ({comments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  "pb-4 text-sm font-bold uppercase tracking-wider transition-colors",
                  activeTab === 'activity' ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Activity
              </button>
            </div>

            {activeTab === 'comments' ? (
              <div className="space-y-6">
                <div className="divide-y divide-gray-100">
                  {comments?.map((comment: TicketComment) => (
                    <CommentItem key={comment.id} comment={comment} ticketId={ticketId} />
                  ))}
                  {(!comments || comments.length === 0) && (
                    <p className="py-8 text-center text-sm text-gray-500 italic">No comments yet</p>
                  )}
                </div>
                <div className="pt-4">
                  <CommentInput ticketId={ticketId} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status History Placeholder */}
                <div className="space-y-8 py-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-4">
                       <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                          <div className="h-full w-0.5 bg-gray-200 absolute top-8" />
                          <div className="z-10 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white" />
                       </div>
                       <div className="pb-4">
                          <p className="text-sm text-gray-900">
                             <span className="font-semibold">System</span> changed status from <span className="font-medium text-gray-500">Todo</span> to <span className="font-medium text-indigo-600">In Progress</span>
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">Oct 24, 2023 at 10:15 AM</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (35%) */}
        <div className="w-full lg:w-96 overflow-y-auto space-y-6 lg:border-l lg:border-gray-200 lg:pl-8">
          {/* Details Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Properties</h2>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                  <User className="h-3 w-3" /> Assignee
                </label>
                <div className="flex -space-x-1 overflow-hidden">
                  {ticket.assignees.map((a: TicketAssignee) => (
                    <div key={a.id} className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600" title={a.displayName}>
                      {a.displayName.charAt(0)}
                    </div>
                  ))}
                  {ticket.assignees.length === 0 && <span className="text-sm text-gray-400 italic">Unassigned</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                   Reporter
                </label>
                <div className="flex items-center gap-2">
                   <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                      {ticket.reporterName.charAt(0)}
                   </div>
                   <span className="text-sm text-gray-900 font-medium truncate">{ticket.reporterName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Due Date
                </label>
                <p className={cn("text-sm font-medium", ticket.isOverdue ? "text-red-600" : "text-gray-900")}>
                   {ticket.expectedDueDate ? formatDate(ticket.expectedDueDate) : <span className="text-gray-400">None</span>}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                   Story Points
                </label>
                <p className="text-sm font-bold text-gray-900">
                   {ticket.storyPoints || '–'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-50">
               <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-500 uppercase">Tags</span>
                  <button className="text-indigo-600 font-bold hover:underline">Add</button>
               </div>
               <div className="flex flex-wrap gap-1.5">
                  {ticket.labels.map((label: string) => (
                    <span key={label} className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      {label}
                    </span>
                  ))}
                  {ticket.labels.length === 0 && <p className="text-[10px] text-gray-400 italic">No labels</p>}
               </div>
            </div>
          </div>

          {/* Time Tracking Panel */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <TimeLogPanel ticketId={ticketId} storyPoints={ticket.storyPoints} />
          </div>

          {/* Watchers Panel */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Watchers (3)</h3>
              </div>
              <button className="text-xs font-bold text-indigo-600">Watch</button>
            </div>
            <div className="flex flex-wrap gap-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-8 w-8 rounded-full bg-gray-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-600">
                    JD
                 </div>
               ))}
            </div>
          </div>

          {/* Attachments Panel */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
             <AttachmentList ticketId={ticketId} />
          </div>

          {/* Linked Tickets */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Linked Tickets</h3>
              </div>
              <button className="text-xs font-bold text-indigo-600"><Plus className="h-3 w-3" /></button>
            </div>
            <p className="text-center text-[10px] text-gray-400 italic py-2">No linked tickets</p>
          </div>
        </div>
      </div>

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        ticketId={ticketId}
        projectId={ticket.projectId}
        currentStatusId={ticket.status.id}
      />
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}
