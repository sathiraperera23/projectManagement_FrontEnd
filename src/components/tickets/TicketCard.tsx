'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket as TicketType } from '@/types/ticket';
import { TicketStatusBadge } from './TicketStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { useTicketStore } from '@/store/ticketStore';
import { cn, formatDate } from '@/lib/utils';
import {
  Calendar,
  AlertCircle,
  Bug,
  FileText,
  PlusSquare,
  Zap,
  RefreshCw,
  UserSquare2,
  ClipboardCheck
} from 'lucide-react';

const categoryIcons = {
  Task: FileText,
  Bug: Bug,
  Feature: PlusSquare,
  Improvement: Zap,
  ChangeRequest: RefreshCw,
  UserStory: UserSquare2,
  TestCase: ClipboardCheck,
};

interface Props {
  ticket: TicketType;
}

export function TicketCard({ ticket }: Props) {
  const { selectedTicketIds, toggleTicketSelection } = useTicketStore();
  const isSelected = selectedTicketIds.includes(ticket.id);

  const CategoryIcon = categoryIcons[ticket.category] || FileText;

  const isOverdue = ticket.isOverdue;
  const dueDate = ticket.expectedDueDate ? new Date(ticket.expectedDueDate) : null;
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  const isDueSoon = dueDate && dueDate > today && dueDate <= threeDaysFromNow;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md",
        isSelected ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleTicketSelection(ticket.id)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <span className="text-xs font-medium text-gray-500">{ticket.ticketNumber}</span>
        </div>
        <CategoryIcon className="h-4 w-4 text-gray-400" />
      </div>

      <Link href={`/tickets/${ticket.id}`} className="block">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600">
          {ticket.title}
        </h3>
      </Link>

      <div className="flex flex-wrap gap-2">
        <PriorityBadge priority={ticket.priority} />
        <TicketStatusBadge status={ticket.status.name} colour={ticket.status.colour} />
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden">
          {ticket.assignees.slice(0, 3).map((assignee) => (
            <div
              key={assignee.id}
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
              title={assignee.displayName}
            >
              {assignee.avatarUrl ? (
                <img src={assignee.avatarUrl} alt={assignee.displayName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-600">
                  {assignee.displayName.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {ticket.assignees.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-500 ring-2 ring-white">
              +{ticket.assignees.length - 3}
            </div>
          )}
        </div>

        {ticket.expectedDueDate && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isOverdue ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-gray-500"
          )}>
            <Calendar className="h-3 w-3" />
            <span>{formatDate(ticket.expectedDueDate)}</span>
          </div>
        )}
      </div>

      {isOverdue && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 shadow-sm ring-1 ring-red-200">
          <AlertCircle className="h-3 w-3" />
          OVERDUE
        </div>
      )}
    </div>
  );
}
