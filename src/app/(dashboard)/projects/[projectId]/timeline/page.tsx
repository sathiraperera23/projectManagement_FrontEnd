'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { ticketsApi } from '@/lib/api/tickets';
import { sprintsApi } from '@/lib/api/sprints';
import { GanttToolbar } from '@/components/gantt/GanttToolbar';
import { GanttChart } from '@/components/gantt/GanttChart';
import { GanttLegend } from '@/components/gantt/GanttLegend';
import { GanttBarDetail } from '@/components/gantt/GanttBarDetail';
import type { GanttBar, GanttZoomLevel, GanttViewLevel } from '@/types/gantt';
import { downloadBlob } from '@/lib/utils/download';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Kanban, ListTodo, CalendarDays, Settings, Users } from 'lucide-react';

export default function TimelinePage() {
  const { projectId } = useParams();
  const pid = Number(projectId);
  const queryClient = useQueryClient();

  // State
  const [viewLevel, setViewLevel] = useState<GanttViewLevel['value']>('project');
  const [zoomLevel, setZoomLevel] = useState<GanttZoomLevel>('week');
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const [showDependencies, setShowDependencies] = useState(true);
  const [selectedBar, setSelectedBar] = useState<GanttBar | null>(null);

  // Selection state for product/subproject levels
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedSubProjectId, setSelectedSubProjectId] = useState<number | null>(null);

  // Queries
  const { data: project } = useQuery({
    queryKey: ['projects', pid],
    queryFn: () => projectsApi.getById(pid),
  });

  const { data: products } = useQuery({
    queryKey: ['products', pid],
    queryFn: () => projectsApi.getProducts(pid),
    enabled: viewLevel !== 'project',
  });

  const { data: subProjects } = useQuery({
    queryKey: ['subprojects', pid, selectedProductId],
    queryFn: () => projectsApi.getSubProjects(pid, selectedProductId!),
    enabled: viewLevel === 'subproject' && !!selectedProductId,
  });

  const { data: ganttData, isLoading } = useQuery({
    queryKey: ['gantt', viewLevel, pid, selectedProductId, selectedSubProjectId],
    queryFn: () => {
      if (viewLevel === 'project') return projectsApi.getProjectGantt(pid);
      if (viewLevel === 'product' && selectedProductId) return projectsApi.getProductGantt(pid, selectedProductId);
      if (viewLevel === 'subproject' && selectedSubProjectId) return projectsApi.getSubProjectGantt(selectedSubProjectId);
      return projectsApi.getProjectGantt(pid); // Fallback
    },
    enabled: !!pid,
  });

  // Mutations
  const updateDueDateMutation = useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) =>
      projectsApi.setRevisedDueDate(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt'] });
      toast.success('Due date updated');
    },
    onError: () => toast.error('Failed to update due date'),
  });

  const updateEntityMutation = useMutation({
    mutationFn: async ({ bar, start, end }: { bar: GanttBar; start: Date; end: Date }) => {
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      if (bar.type === 'SubProject') {
        // Find productId from products query if not in bar
        const productId = selectedProductId || 1; // Fallback if unknown
        return projectsApi.updateSubProject(pid, productId, bar.id, {
          name: bar.name,
          startDate: startStr,
          expectedEndDate: endStr
        });
      } else if (bar.type === 'Sprint') {
        return sprintsApi.updateSprint(pid, bar.id, { startDate: startStr, endDate: endStr });
      } else if (bar.type === 'Ticket') {
        return ticketsApi.update(bar.id, { startDate: startStr, expectedDueDate: endStr });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt'] });
      toast.success('Timeline updated');
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt'] }); // Revert UI
      toast.error('Failed to update timeline. You may not have permission.');
    }
  });

  // Placeholder for sprint update since we don't have it in projectsApi yet
  const api_sprints_update = async (id: number, data: any) => {
    // In a real app, this would be in sprintsApi
    toast.loading('Updating sprint...');
  };

  const handleExport = async (format: 'pdf' | 'png') => {
    try {
      const blob = await projectsApi.exportGantt(pid, format);
      downloadBlob(blob, `${project?.name || 'Project'}-Timeline.${format}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  const tabs = [
    { name: 'Summary', href: `/projects/${pid}/summary`, icon: LayoutDashboard },
    { name: 'Board', href: `/projects/${pid}/board`, icon: Kanban },
    { name: 'Backlog', href: `/projects/${pid}/backlog`, icon: ListTodo },
    { name: 'Timeline', href: `/projects/${pid}/timeline`, icon: CalendarDays },
    { name: 'Sprints', href: `/projects/${pid}/sprints`, icon: Users },
    { name: 'Settings', href: `/projects/${pid}/settings`, icon: Settings },
  ];

  const criticalPathCount = ganttData?.filter((b: GanttBar) => b.isCriticalPath).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{project?.name} — Timeline</h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => {
            const isActive = tab.name === 'Timeline';
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <GanttToolbar
          viewLevel={viewLevel}
          setViewLevel={(level) => {
            setViewLevel(level);
            setSelectedProductId(null);
            setSelectedSubProjectId(null);
          }}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          showCriticalPath={showCriticalPath}
          setShowCriticalPath={setShowCriticalPath}
          showBaseline={showBaseline}
          setShowBaseline={setShowBaseline}
          showDependencies={showDependencies}
          setShowDependencies={setShowDependencies}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['gantt'] })}
          onExport={handleExport}
          onToday={() => {}} // Gantt internal today scroll
        />

        {/* Contextual Filters */}
        {(viewLevel === 'product' || viewLevel === 'subproject') && (
          <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">SELECT PRODUCT:</span>
              <select
                className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedProductId || ''}
                onChange={(e) => {
                  setSelectedProductId(Number(e.target.value));
                  setSelectedSubProjectId(null);
                }}
              >
                <option value="">Choose a product...</option>
                {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {viewLevel === 'subproject' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">SELECT SUB-PROJECT:</span>
                <select
                  className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!selectedProductId}
                  value={selectedSubProjectId || ''}
                  onChange={(e) => setSelectedSubProjectId(Number(e.target.value))}
                >
                  <option value="">Choose a sub-project...</option>
                  {subProjects?.map((sp: any) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Critical Path Summary */}
        {showCriticalPath && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <span className="text-xs font-medium text-red-700">
              CRITICAL PATH: {criticalPathCount} items identified. Projected completion: {ganttData ? '30 Nov 2024' : '-'}
            </span>
            <button className="text-[10px] font-bold text-red-600 hover:underline">VIEW REPORT</button>
          </div>
        )}

        <div className="p-4 min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-gray-500 font-medium">Generating Timeline Data...</p>
            </div>
          ) : (
            <GanttChart
              bars={ganttData || []}
              zoomLevel={zoomLevel}
              showBaseline={showBaseline}
              showCriticalPath={showCriticalPath}
              readOnly={project?.status === 'Archived'}
              onBarClick={setSelectedBar}
              onDateChange={(bar, start, end) => updateEntityMutation.mutate({ bar, start, end })}
            />
          )}

          {!isLoading && ganttData && ganttData.length > 0 && <GanttLegend />}
        </div>
      </div>

      <GanttBarDetail
        bar={selectedBar}
        onClose={() => setSelectedBar(null)}
        projectId={pid}
        onUpdateDueDate={async (id, date) => {
          await updateDueDateMutation.mutateAsync({ id, date });
        }}
      />
    </div>
  );
}
