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
import type { TicketComment, TicketAssignee, TicketPriority } from '@/types/ticket';
import {
  ChevronRight,
  Calendar,
  User,
  AlertCircle,
  MoreHorizontal,
  ArrowLeft,
  Eye,
  Link2,
  Check,
  X as CloseIcon
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

  // Inline edit states
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [tempPoints, setTempPoints] = useState<number | string>('');
  const [isEditingPriority, setIsEditingPriority] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTempTitle(ticket.title);
      setTempPoints(ticket.storyPoints || '');
    }
  }, [ticket]);

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

  const handleSaveTitle = async () => {
    if (tempTitle.trim() && tempTitle !== ticket?.title) {
      await updateMutation.mutateAsync({ title: tempTitle });
    }
    setIsEditingTitle(false);
  };

  const handleSavePoints = async () => {
    const points = typeof tempPoints === 'string' ? parseInt(tempPoints) : tempPoints;
    if (!isNaN(points as number) && points !== ticket?.storyPoints) {
      await updateMutation.mutateAsync({ storyPoints: points as number });
    }
    setIsEditingPoints(false);
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    await updateMutation.mutateAsync({ priority });
    setIsEditingPriority(false);
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
        <button onClick={() => router.push('/my-tickets')} className="mt-6 flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <span className="hover:text-indigo-600 cursor-pointer">{ticket.projectName}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{ticket.ticketNumber}</span>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsStatusModalOpen(true)} className="rounded-md bg-white border border-gray-200 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50">
            Change Status
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row gap-8 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-4 space-y-8">
          <div className="space-y-4">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="text-3xl font-bold text-gray-900 leading-tight border-b-2 border-indigo-500 focus:outline-none w-full"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                />
                <button onClick={handleSaveTitle} className="p-1 text-green-600"><Check className="h-6 w-6" /></button>
                <button onClick={() => { setIsEditingTitle(false); setTempTitle(ticket.title); }} className="p-1 text-red-600"><CloseIcon className="h-6 w-6" /></button>
              </div>
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-3xl font-bold text-gray-900 leading-tight cursor-pointer hover:bg-gray-50 rounded px-1 -ml-1 transition-colors"
              >
                {ticket.title}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="cursor-pointer" onClick={() => setIsStatusModalOpen(true)}>
                <TicketStatusBadge status={ticket.status.name} colour={ticket.status.colour} />
              </div>
              <div className="relative group">
                 <div className="cursor-pointer" onClick={() => setIsEditingPriority(!isEditingPriority)}>
                   <PriorityBadge priority={ticket.priority} />
                 </div>
                 {isEditingPriority && (
                   <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 w-32">
                     {(['Critical', 'High', 'Medium', 'Low'] as TicketPriority[]).map(p => (
                       <button
                         key={p}
                         onClick={() => handlePriorityChange(p)}
                         className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                 )}
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {ticket.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Description</h2>
            <div className={cn(
              "rounded-lg border bg-white p-4 transition-all",
              isEditingDescription ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200"
            )}>
              {isEditingDescription ? (
                <div className="space-y-4">
                  <EditorContent editor={editor} className="prose prose-sm max-w-none min-h-[150px] focus:outline-none" />
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button onClick={() => setIsEditingDescription(false)} className="text-sm font-medium text-gray-500 px-3 py-1.5 hover:bg-gray-50 rounded">Cancel</button>
                    <button onClick={handleSaveDescription} className="bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded hover:bg-indigo-700">Save</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className="prose prose-sm max-w-none text-gray-700 cursor-pointer min-h-[50px]"
                  dangerouslySetInnerHTML={{ __html: ticket.description || '<p class="text-gray-400 italic">No description provided. Click to add one.</p>' }}
                />
              )}
            </div>
          </div>

          {/* Comments/Activity Tabs */}
          <div className="space-y-6">
            <div className="flex items-center border-b border-gray-200 gap-8">
              <button onClick={() => setActiveTab('comments')} className={cn("pb-4 text-sm font-bold uppercase tracking-wider transition-colors", activeTab === 'comments' ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700")}>Comments ({comments?.length || 0})</button>
              <button onClick={() => setActiveTab('activity')} className={cn("pb-4 text-sm font-bold uppercase tracking-wider transition-colors", activeTab === 'activity' ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700")}>Activity</button>
            </div>
            {activeTab === 'comments' ? (
              <div className="space-y-6">
                <div className="divide-y divide-gray-100">
                  {comments?.map((comment: TicketComment) => <CommentItem key={comment.id} comment={comment} ticketId={ticketId} />)}
                </div>
                <CommentInput ticketId={ticketId} />
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic py-4 text-center">Activity log coming soon...</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 space-y-6 lg:border-l lg:border-gray-200 lg:pl-8 overflow-y-auto">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Properties</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Story Points</span>
                {isEditingPoints ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      className="w-16 text-sm font-bold border-b border-indigo-500 focus:outline-none"
                      value={tempPoints}
                      onChange={(e) => setTempPoints(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSavePoints()}
                    />
                    <button onClick={handleSavePoints} className="text-green-600"><Check className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <span onClick={() => setIsEditingPoints(true)} className="text-sm font-bold text-gray-900 cursor-pointer hover:text-indigo-600">{ticket.storyPoints || '–'}</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Due Date</span>
                <span className={cn("text-sm font-medium", ticket.isOverdue ? "text-red-600" : "text-gray-900")}>
                   {ticket.expectedDueDate ? formatDate(ticket.expectedDueDate) : 'None'}
                </span>
              </div>
            </div>
          </div>

          <TimeLogPanel ticketId={ticketId} storyPoints={ticket.storyPoints} />
          <AttachmentList ticketId={ticketId} />
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
