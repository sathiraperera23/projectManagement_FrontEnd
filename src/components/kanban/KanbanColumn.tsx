'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn as KanbanColumnType } from '@/types/kanban';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';
import { Plus, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

interface Props {
  column: KanbanColumnType;
  isCompact?: boolean;
}

export function KanbanColumn({ column, isCompact = false }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const { setNodeRef } = useDroppable({
    id: column.statusId,
    data: {
      type: 'Column',
      column,
    },
  });

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalTickets = column.tickets?.length || column.groups?.reduce((acc, g) => acc + g.tickets.length, 0) || 0;

  const wipStatus = column.wipLimit
    ? totalTickets > column.wipLimit ? 'error' : totalTickets >= column.wipLimit - 1 ? 'warning' : 'ok'
    : 'ok';

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-all duration-300",
        isCollapsed ? "w-12" : "w-[320px] min-w-[320px]"
      )}
    >
      <div className="flex items-center justify-between px-2 py-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {!isCollapsed && (
            <>
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: column.statusColour }} />
              <h3 className="truncate text-xs font-bold uppercase tracking-wider text-gray-700">
                {column.statusName}
              </h3>
              <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                {totalTickets}
              </span>
            </>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1">
            {column.wipLimit && (
              <span className={cn(
                "text-[10px] font-bold",
                wipStatus === 'error' ? "text-red-600" : wipStatus === 'warning' ? "text-amber-600" : "text-gray-400"
              )}>
                {totalTickets} / {column.wipLimit}
              </span>
            )}
            <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {!isCollapsed && column.isOverWipLimit && (
        <div className="mx-2 mb-2 flex items-center gap-2 rounded bg-red-50 p-2 text-[10px] font-semibold text-red-700 border border-red-100">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          WIP Limit Exceeded
        </div>
      )}

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-4 overflow-y-auto px-2 pb-4",
          isCollapsed ? "hidden" : "block",
          column.isOverWipLimit && "bg-red-50/30"
        )}
      >
        {column.groups ? (
          column.groups.map(group => (
            <div key={group.groupKey} className="space-y-2">
              <button
                onClick={() => toggleGroup(group.groupKey)}
                className="flex w-full items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter hover:text-gray-600"
              >
                {collapsedGroups[group.groupKey] ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {group.groupLabel} ({group.tickets.length})
              </button>

              {!collapsedGroups[group.groupKey] && (
                <SortableContext items={group.tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {group.tickets.map((ticket) => (
                      <KanbanCard key={ticket.id} ticket={ticket} isCompact={isCompact} />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          ))
        ) : (
          <SortableContext items={column.tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {column.tickets.map((ticket) => (
                <KanbanCard key={ticket.id} ticket={ticket} isCompact={isCompact} />
              ))}
              {column.tickets.length === 0 && (
                <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-100 text-xs font-medium text-gray-400 italic">
                  Drop here
                </div>
              )}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
