'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useSprintTickets, useAddTicketToSprint, useRemoveTicketFromSprint } from '@/hooks/useSprints';
import { useTickets } from '@/hooks/useTickets';
import { cn } from '@/lib/utils';
import {
  GripVertical,
  Trash2,
  Filter,
  Search,
  AlertCircle,
  Hash,
  ChevronRight
} from 'lucide-react';
import { PriorityBadge } from '../tickets/PriorityBadge';
import type { Ticket } from '@/types/ticket';
import toast from 'react-hot-toast';

interface Props {
  projectId: number;
  sprintId: number;
  isActive?: boolean;
}

export function SprintBacklog({ projectId, sprintId, isActive = false }: Props) {
  const [filter, setFilter] = useState('');
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const { data: backlogTickets, isLoading: loadingBacklog } = useTickets({
    projectId,
    sprintId: 'null' as any
  });
  const { data: sprintTickets, isLoading: loadingSprint } = useSprintTickets(projectId, sprintId);

  const addMutation = useAddTicketToSprint(projectId, sprintId);
  const removeMutation = useRemoveTicketFromSprint(projectId, sprintId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = active.data.current?.ticket;
    if (ticket) setActiveTicket(ticket);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);
    if (!over) return;

    const ticketId = active.id as number;
    const target = over.id as string;

    if (target === 'sprint-panel' && active.data.current?.source === 'backlog') {
      try {
        await addMutation.mutateAsync(ticketId);
        toast.success('Ticket added to sprint');
      } catch {
        toast.error('Failed to add ticket');
      }
    } else if (target === 'backlog-panel' && active.data.current?.source === 'sprint') {
      handleRemove(ticketId);
    }
  };

  const handleRemove = async (ticketId: number) => {
    let reason = '';
    if (isActive) {
      reason = window.prompt('Please provide a reason for removing this ticket from an active sprint:') || '';
      if (!reason) return;
    }
    try {
      await removeMutation.mutateAsync({ ticketId, reason });
      toast.success('Ticket removed from sprint');
    } catch {
      toast.error('Failed to remove ticket');
    }
  };

  const filteredBacklog = backlogTickets?.filter((t: Ticket) =>
    t.title.toLowerCase().includes(filter.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        {/* Left: Product Backlog */}
        <DroppablePanel id="backlog-panel" title="Product Backlog" count={filteredBacklog.length}>
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search backlog..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loadingBacklog ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg" />)
            ) : filteredBacklog.map((ticket: Ticket) => (
              <DraggableTicket key={ticket.id} ticket={ticket} source="backlog" />
            ))}
          </div>
        </DroppablePanel>

        {/* Right: Sprint Tickets */}
        <DroppablePanel id="sprint-panel" title="Sprint Tickets" count={sprintTickets?.length || 0} highlight>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loadingSprint ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg" />)
            ) : sprintTickets?.map((ticket: Ticket) => (
              <DraggableTicket key={ticket.id} ticket={ticket} source="sprint" onRemove={() => handleRemove(ticket.id)} />
            ))}
            {sprintTickets?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                 <div className="p-4 rounded-full bg-gray-50 mb-3 text-gray-300">
                    <ChevronRight className="h-8 w-8 rotate-90" />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-wider">Drag tickets here</p>
              </div>
            )}
          </div>
        </DroppablePanel>
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="w-[300px] rounded-xl border border-indigo-200 bg-white p-3 shadow-2xl opacity-90 ring-2 ring-indigo-500">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">#{activeTicket.ticketNumber}</span>
                <PriorityBadge priority={activeTicket.priority} />
             </div>
             <p className="text-xs font-bold text-gray-900 line-clamp-1">{activeTicket.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DroppablePanel({ id, title, count, children, highlight }: { id: string, title: string, count: number, children: React.ReactNode, highlight?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl border-2 transition-all overflow-hidden",
        isOver ? "border-indigo-500 bg-indigo-50/20 scale-[1.01]" : highlight ? "border-indigo-100 bg-white" : "border-gray-100 bg-white"
      )}
    >
      <div className={cn("px-4 py-3 border-b flex items-center justify-between", highlight ? "border-indigo-50 bg-indigo-50/50" : "border-gray-50 bg-gray-50/30")}>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">{title}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-black text-gray-600">{count}</span>
      </div>
      {children}
    </div>
  );
}

function DraggableTicket({ ticket, source, onRemove }: { ticket: Ticket, source: 'backlog' | 'sprint', onRemove?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    data: { ticket, source }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md",
        isDragging && "opacity-0"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
           <div {...listeners} {...attributes} className="p-1 -ml-1 text-gray-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-3.5 w-3.5" />
           </div>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">#{ticket.ticketNumber}</span>
        </div>
        <div className="flex items-center gap-1.5">
           <PriorityBadge priority={ticket.priority} />
           {onRemove && (
             <button
               onClick={(e) => { e.stopPropagation(); onRemove(); }}
               className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
             >
               <Trash2 className="h-3.5 w-3.5" />
             </button>
           )}
        </div>
      </div>

      <p className="text-xs font-bold text-gray-700 leading-snug line-clamp-2">{ticket.title}</p>

      <div className="flex items-center justify-between mt-1">
         <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-gray-400">{ticket.subProjectName}</span>
         </div>
         <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded text-[10px] font-black text-gray-500">
            {ticket.storyPoints || 0}
         </div>
      </div>
    </div>
  );
}
