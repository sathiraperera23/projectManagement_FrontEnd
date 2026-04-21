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
    // Optional: add visual cues when dragging over columns
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
        const targetColumn = columns.find(col => {
            if (col.tickets && col.tickets.some(t => t.id === overId)) return true;
            if (col.groups) {
                return col.groups.some(g => g.tickets.some(t => t.id === overId));
            }
            return false;
        });
        newStatusId = targetColumn?.statusId || (overId as number);
    }

    const sourceColumn = columns.find(col => {
        if (col.tickets && col.tickets.some(t => t.id === ticketId)) return true;
        if (col.groups) {
            return col.groups.some(g => g.tickets.some(t => t.id === ticketId));
        }
        return false;
    });

    if (!sourceColumn || sourceColumn.statusId === newStatusId) return;

    // Optimistic update
    const moveTicket = (col: KanbanColumnType, isAdding: boolean) => {
        if (isAdding) {
            const ticket = sourceColumn.tickets?.find(t => t.id === ticketId) ||
                          sourceColumn.groups?.flatMap(g => g.tickets).find(t => t.id === ticketId);
            if (!ticket) return col;

            if (col.tickets) return { ...col, tickets: [...col.tickets, ticket] };
            if (col.groups) {
                // If grouped, we'd need to know which group to add to.
                // For now, simplify and just invalidate query for grouped boards.
                return col;
            }
        } else {
            if (col.tickets) return { ...col, tickets: col.tickets.filter(t => t.id !== ticketId) };
            if (col.groups) {
                return {
                    ...col,
                    groups: col.groups.map(g => ({ ...g, tickets: g.tickets.filter(t => t.id !== ticketId) }))
                };
            }
        }
        return col;
    };

    const newColumns = columns.map(col => {
        if (col.statusId === sourceColumn.statusId) return moveTicket(col, false);
        if (col.statusId === newStatusId) return moveTicket(col, true);
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

  const hasGroups = columns.some(col => !!col.groups);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 p-4 overflow-x-auto min-w-full bg-gray-100/50">
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
