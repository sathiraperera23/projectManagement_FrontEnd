'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn as KanbanColumnType, KanbanTicket } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { ticketsApi } from '@/lib/api/tickets';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface Props {
  projectId: number;
  initialColumns: KanbanColumnType[];
  isCompact?: boolean;
}

export function KanbanBoard({ projectId, initialColumns, isCompact = false }: Props) {
  const [columns, setColumns] = useState<KanbanColumnType[]>(initialColumns);
  const [activeTicket, setActiveTicket] = useState<KanbanTicket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = active.data.current?.ticket;
    if (ticket) {
      setActiveTicket(ticket);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATicket = active.data.current?.type === 'Ticket';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (isActiveATicket && isOverAColumn) {
       // logic for moving into empty column if needed
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);
    if (!over) return;

    const ticketId = active.id as number;
    const overId = over.id;

    // Determine target statusId
    let newStatusId: number;
    if (over.data.current?.type === 'Column') {
        newStatusId = overId as number;
    } else {
        const targetColumn = columns.find(col => col.tickets.some(t => t.id === overId));
        newStatusId = targetColumn?.statusId || (overId as number);
    }

    const sourceColumn = columns.find(col => col.tickets.some(t => t.id === ticketId));
    if (!sourceColumn || sourceColumn.statusId === newStatusId) return;

    // Optimistic update
    const ticket = sourceColumn.tickets.find(t => t.id === ticketId)!;
    const newColumns = columns.map(col => {
        if (col.statusId === sourceColumn.statusId) {
            return { ...col, tickets: col.tickets.filter(t => t.id !== ticketId) };
        }
        if (col.statusId === newStatusId) {
            return { ...col, tickets: [...col.tickets, ticket] };
        }
        return col;
    });

    setColumns(newColumns);

    try {
      await ticketsApi.updateStatus(ticketId, newStatusId);
      toast.success('Ticket status updated');
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] });
    } catch {
      setColumns(columns); // Revert
      toast.error('Failed to update ticket status');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-2 overflow-x-auto p-4">
        {columns.map((column) => (
          <KanbanColumn key={column.statusId} column={column} isCompact={isCompact} />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeTicket ? (
          <KanbanCard ticket={activeTicket} isCompact={isCompact} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
