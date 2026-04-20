'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanTicket } from '@/types/kanban';
import { cn, formatDate } from '@/lib/utils';
import {
  Bug,
  FileText,
  PlusSquare,
  Zap,
  RefreshCw,
  UserSquare2,
  ClipboardCheck,
  Lock,
  Clock,
  GripVertical
} from 'lucide-react';
import Link from 'next/link';

const categoryIcons = {
  Task: FileText,
  Bug: Bug,
  Feature: PlusSquare,
  Improvement: Zap,
  ChangeRequest: RefreshCw,
  UserStory: UserSquare2,
  TestCase: ClipboardCheck,
};

const priorityColors = {
  Critical: 'border-l-red-600',
  High: 'border-l-orange-500',
  Medium: 'border-l-yellow-400',
  Low: 'border-l-gray-300',
};

interface Props {
  ticket: KanbanTicket;
  isCompact?: boolean;
}

export function KanbanCard({ ticket, isCompact = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: {
      type: 'Ticket',
      ticket,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const CategoryIcon = categoryIcons[ticket.category] || FileText;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-32 w-full rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md",
        priorityColors[ticket.priority],
        "border-l-4"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-gray-500">{ticket.ticketNumber}</span>
            {ticket.isBlocked && <Lock className="h-3 w-3 text-red-500" />}
            {ticket.isOverdue && <Clock className="h-3 w-3 text-red-500" />}
          </div>
          <Link href={`/tickets/${ticket.id}`} className="block">
             <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600">
               {ticket.title}
             </h4>
          </Link>
        </div>

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {!isCompact && (
        <div className="flex flex-wrap gap-1">
          {ticket.labels.slice(0, 2).map(label => (
            <span key={label} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">
              {label}
            </span>
          ))}
          {ticket.labels.length > 2 && (
            <span className="text-[9px] font-bold text-gray-400">+{ticket.labels.length - 2}</span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <CategoryIcon className="h-3 w-3 text-gray-400" />
           {ticket.expectedDueDate && (
             <span className={cn(
               "text-[10px] font-medium",
               ticket.isOverdue ? "text-red-600" : "text-gray-500"
             )}>
               {formatDate(ticket.expectedDueDate)}
             </span>
           )}
        </div>

        <div className="flex items-center gap-2">
           {ticket.storyPoints && (
             <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600">
               {ticket.storyPoints}
             </span>
           )}
           <div className="flex -space-x-1.5 overflow-hidden">
             {ticket.assignees.slice(0, 2).map(a => (
                <div key={a.id} className="h-5 w-5 rounded-full border border-white bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600" title={a.displayName}>
                   {a.displayName.charAt(0)}
                </div>
             ))}
             {ticket.assignees.length > 2 && (
                <div className="h-5 w-5 rounded-full border border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                   +{ticket.assignees.length - 2}
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
