'use client';

import React from 'react';
import {
  Calendar,
  ZoomIn,
  ZoomOut,
  Download,
  RefreshCcw,
  Filter,
  Layers,
  Activity,
  GitBranch,
  Eye
} from 'lucide-react';
import type { GanttZoomLevel, GanttViewLevel } from '@/types/gantt';
import { cn } from '@/lib/utils';

interface Props {
  viewLevel: GanttViewLevel['value'];
  setViewLevel: (level: GanttViewLevel['value']) => void;
  zoomLevel: GanttZoomLevel;
  setZoomLevel: (level: GanttZoomLevel) => void;
  showCriticalPath: boolean;
  setShowCriticalPath: (show: boolean) => void;
  showBaseline: boolean;
  setShowBaseline: (show: boolean) => void;
  showDependencies: boolean;
  setShowDependencies: (show: boolean) => void;
  onRefresh: () => void;
  onExport: (format: 'pdf' | 'png') => void;
  onToday: () => void;
}

export function GanttToolbar({
  viewLevel,
  setViewLevel,
  zoomLevel,
  setZoomLevel,
  showCriticalPath,
  setShowCriticalPath,
  showBaseline,
  setShowBaseline,
  showDependencies,
  setShowDependencies,
  onRefresh,
  onExport,
  onToday,
}: Props) {
  const zoomLevels: GanttZoomLevel[] = ['day', 'week', 'month', 'quarter'];
  const viewLevels: { label: string; value: GanttViewLevel['value'] }[] = [
    { label: 'Project', value: 'project' },
    { label: 'Product', value: 'product' },
    { label: 'Sub-project', value: 'subproject' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        {/* View Level Switcher */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
          {viewLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setViewLevel(level.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded",
                viewLevel === level.value
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {level.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md">
          {zoomLevels.map((level) => (
            <button
              key={level}
              onClick={() => setZoomLevel(level)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded capitalize",
                zoomLevel === level
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCriticalPath(!showCriticalPath)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              showCriticalPath
                ? "bg-red-50 text-red-700 border border-red-200"
                : "text-gray-600 border border-transparent hover:bg-gray-50"
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            Critical Path
          </button>
          <button
            onClick={() => setShowBaseline(!showBaseline)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              showBaseline
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 border border-transparent hover:bg-gray-50"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Baseline
          </button>
          <button
            onClick={() => setShowDependencies(!showDependencies)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              showDependencies
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-600 border border-transparent hover:bg-gray-50"
            )}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Dependencies
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
          >
            <Calendar className="h-3.5 w-3.5" />
            Today
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>

          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
              <button
                onClick={() => onExport('pdf')}
                className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                Export as PDF
              </button>
              <button
                onClick={() => onExport('png')}
                className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                Export as PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
