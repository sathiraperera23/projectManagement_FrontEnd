'use client';

import React from 'react';
import { useTicketStore } from '@/store/ticketStore';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { Search, Filter } from 'lucide-react';

export function TicketFilterSidebar() {
  const { filters, setFilter, clearFilters } = useTicketStore();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  });

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  const quickFilters = [
    { label: 'My Open Tickets', onClick: () => { clearFilters(); setFilter('statusId', 1); } }, // Assuming 1 is Open
    { label: 'Due This Week', onClick: () => { /* logic */ } },
    { label: 'Overdue', onClick: () => { /* logic */ } },
    { label: 'Paused', onClick: () => { setFilter('statusId', 4); } }, // Assuming 4 is Paused
    { label: 'Recently Updated', onClick: () => { /* logic */ } },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={clearFilters}
          className="text-xs text-gray-500 hover:text-indigo-600"
        >
          Clear all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Title or ticket #"
              value={filters.search || ''}
              onChange={(e) => setFilter('search', e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Project */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Project</label>
          <select
            value={filters.projectId || ''}
            onChange={(e) => setFilter('projectId', e.target.value ? Number(e.target.value) : undefined)}
            className="block w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Projects</option>
            {projects?.map((p: { id: number; name: string }) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Priority</label>
          <div className="space-y-1">
            {['Critical', 'High', 'Medium', 'Low'].map((p) => (
              <label key={p} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.priority === p}
                  onChange={() => setFilter('priority', filters.priority === p ? undefined : p)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-sm text-gray-600">{p}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Category</label>
          <div className="space-y-1">
            {['Task', 'Bug', 'Feature', 'Improvement', 'ChangeRequest', 'UserStory', 'TestCase'].map((c) => (
              <label key={c} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.category === c}
                  onChange={() => setFilter('category', filters.category === c ? undefined : c)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-sm text-gray-600">{c}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((q) => (
              <button
                key={q.label}
                onClick={q.onClick}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
