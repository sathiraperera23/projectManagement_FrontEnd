'use client';

import React from 'react';

export function GanttLegend() {
  const items = [
    { label: 'Product', color: 'bg-indigo-500' },
    { label: 'Sub-project', color: 'bg-sky-500' },
    { label: 'Sprint', color: 'bg-emerald-500' },
    { label: 'Milestone', color: 'bg-amber-500' },
    { label: 'Critical path', color: 'bg-red-500' },
    { label: 'Overdue', color: 'bg-orange-500' },
    { label: 'Baseline', color: 'bg-gray-300' },
  ];

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <div className="flex flex-wrap items-center gap-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Legend</span>
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-sm ${item.color}`} />
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
