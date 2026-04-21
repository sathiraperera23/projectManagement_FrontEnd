'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  ExternalLink,
  AlertCircle,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  Flag,
  Ticket as TicketIcon
} from 'lucide-react';
import type { GanttBar } from '@/types/gantt';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  bar: GanttBar | null;
  onClose: () => void;
  projectId: number;
  onUpdateDueDate?: (ticketId: number, date: string) => Promise<void>;
}

export function GanttBarDetail({ bar, onClose, projectId, onUpdateDueDate }: Props) {
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');

  if (!bar) return null;

  const handleUpdateDate = async () => {
    if (bar.type === 'Ticket' && newDueDate) {
      setIsUpdatingDate(true);
      try {
        await onUpdateDueDate?.(bar.id, newDueDate);
        setIsUpdatingDate(false);
      } catch (err) {
        setIsUpdatingDate(false);
      }
    }
  };

  const renderContent = () => {
    switch (bar.type) {
      case 'Product':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Product Version</h4>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{bar.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-xs text-gray-500 mb-1">Planned Release</span>
                <span className="text-sm font-semibold">{formatDate(bar.endDate)}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-xs text-gray-500 mb-1">Completion</span>
                <span className="text-sm font-semibold">{bar.completionPercentage}%</span>
              </div>
            </div>

            <Link
              href={`/projects/${projectId}/backlog?productId=${bar.id}`}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              View Product Backlog
            </Link>
          </div>
        );

      case 'SubProject':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-4 w-4 text-sky-500" />
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sub-project / Module</h4>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{bar.name}</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-bold text-indigo-600">{bar.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${bar.completionPercentage}%` }}
                  />
                </div>
              </div>

              {bar.dependsOnIds.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800 mb-2 font-medium text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Dependencies
                  </div>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {bar.dependsOnIds.map(id => (
                      <li key={id} className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Dependency ID: {id}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link
              href={`/projects/${projectId}/board?subProjectId=${bar.id}`}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Open Kanban Board
            </Link>
          </div>
        );

      case 'Sprint':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-emerald-500" />
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sprint Details</h4>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{bar.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Calendar className="h-3 w-3" />
                  Timeframe
                </div>
                <span className="text-xs font-semibold">
                  {formatDate(bar.startDate)} - {formatDate(bar.endDate)}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Clock className="h-3 w-3" />
                  Progress
                </div>
                <span className="text-sm font-semibold">{bar.completionPercentage}%</span>
              </div>
            </div>

            <Link
              href={`/projects/${projectId}/sprints?id=${bar.id}`}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Go to Sprint Planning
            </Link>
          </div>
        );

      case 'Milestone':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flag className="h-4 w-4 text-amber-500" />
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Milestone</h4>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{bar.name}</h3>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs text-amber-800 font-medium mb-1 uppercase tracking-tighter">Target Date</span>
                  <span className="text-lg font-bold text-amber-900">{formatDate(bar.endDate)}</span>
                </div>
                {bar.isOverdue && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                    OVERDUE
                  </span>
                )}
              </div>
            </div>
          </div>
        );

      case 'Ticket':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TicketIcon className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ticket Task</h4>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{bar.name}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Assignee</span>
                  <span className="text-sm font-medium">Unassigned</span>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Reschedule Due Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                    <button
                      onClick={handleUpdateDate}
                      disabled={isUpdatingDate || !newDueDate}
                      className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isUpdatingDate ? '...' : 'SET'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href={`/tickets/${bar.id}`}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-900 text-white rounded-md hover:bg-black transition-colors text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              View Full Ticket Details
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-[60] transform transition-transform duration-300">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Timeline Detail</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
