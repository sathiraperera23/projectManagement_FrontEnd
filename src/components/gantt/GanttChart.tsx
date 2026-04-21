'use client';
import { useEffect, useRef } from 'react';
import type { GanttBar, GanttZoomLevel } from '@/types/gantt';

interface Props {
  bars: GanttBar[];
  zoomLevel: GanttZoomLevel;
  onBarClick?: (bar: GanttBar) => void;
  onDateChange?: (bar: GanttBar, start: Date, end: Date) => void;
  showBaseline?: boolean;
  showCriticalPath?: boolean;
  readOnly?: boolean;
}

export function GanttChart({
  bars,
  zoomLevel,
  onBarClick,
  onDateChange,
  showBaseline = false,
  showCriticalPath = false,
  readOnly = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || bars.length === 0) return;

    // Dynamically import frappe-gantt to avoid SSR issues
    import('frappe-gantt').then((FrappeGantt) => {
      const Gantt = FrappeGantt.default;

      // Map GanttBar to frappe-gantt task format
      const tasks = bars.map((bar) => ({
        id: String(bar.id),
        name: bar.name,
        start: bar.startDate,
        end: bar.endDate,
        progress: bar.completionPercentage,
        dependencies: bar.dependsOnIds.map(String).join(', '),
        custom_class: [
          bar.isCriticalPath && showCriticalPath ? 'critical-path' : '',
          bar.isOverdue ? 'overdue-bar' : '',
          bar.type.toLowerCase(),
        ].filter(Boolean).join(' '),
      }));

      // Clear previous instance
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      ganttRef.current = new Gantt(containerRef.current, tasks, {
        view_mode: zoomLevel === 'day' ? 'Day'
          : zoomLevel === 'week' ? 'Week'
          : zoomLevel === 'month' ? 'Month'
          : zoomLevel === 'quarter' ? 'Quarter Day' : 'Day',
        date_format: 'YYYY-MM-DD',
        readonly: readOnly,
        on_click: (task: any) => {
          const bar = bars.find((b) => String(b.id) === task.id);
          if (bar && onBarClick) onBarClick(bar);
        },
        on_date_change: (task: any, start: Date, end: Date) => {
          const bar = bars.find((b) => String(b.id) === task.id);
          if (bar && onDateChange && !readOnly) onDateChange(bar, start, end);
        },
        on_progress_change: () => {},
        popup_trigger: 'click',
      });
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [bars, zoomLevel, showCriticalPath, showBaseline, readOnly, onBarClick, onDateChange]);

  if (bars.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No timeline data available
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="gantt-container w-full overflow-x-auto"
      style={{ minHeight: '400px' }}
    />
  );
}
