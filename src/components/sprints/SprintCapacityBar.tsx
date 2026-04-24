'use client';

import React, { useState } from 'react';
import { useSprintCapacity, useSetMemberCapacity } from '@/hooks/useSprints';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Edit2, Check, X, AlertTriangle, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  projectId: number;
  sprintId: number;
}

export function SprintCapacityBar({ projectId, sprintId }: Props) {
  const { data: capacity, isLoading } = useSprintCapacity(projectId, sprintId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editPoints, setEditPoints] = useState<number>(0);
  const [editPercentage, setEditPercentage] = useState<number>(0);

  const setCapacityMutation = useSetMemberCapacity(projectId, sprintId);

  if (isLoading || !capacity) return <div className="h-2 w-full bg-gray-100 animate-pulse rounded-full" />;

  const percentage = Math.min((capacity.plannedStoryPoints / capacity.totalCapacity) * 100, 100);
  const isOver = capacity.isOverCapacity;

  const barColor = isOver ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500';

  const handleEdit = (userId: number, points: number, pct: number) => {
    setEditingUserId(userId);
    setEditPoints(points);
    setEditPercentage(pct);
  };

  const handleSave = async (userId: number) => {
    try {
      await setCapacityMutation.mutateAsync({
        userId,
        availableStoryPoints: editPoints,
        availabilityPercentage: editPercentage
      });
      setEditingUserId(null);
      toast.success('Member capacity updated');
    } catch {
      toast.error('Failed to update capacity');
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>{capacity.plannedStoryPoints} points planned</span>
          <span>{capacity.totalCapacity} points capacity</span>
        </div>
        <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {isOver && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-xs font-bold">
          <AlertTriangle className="h-4 w-4" />
          Warning: Sprint is over capacity by {capacity.plannedStoryPoints - capacity.totalCapacity} points
        </div>
      )}

      {/* Collapsible Member Breakdown */}
      <div className="border border-gray-100 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>Member Availability Breakdown</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <div className="divide-y divide-gray-50">
            {capacity.memberCapacities.map((member) => (
              <div key={member.userId} className="px-4 py-3 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.displayName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      member.displayName.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{member.displayName}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                      Assigned: <span className="text-indigo-600 font-bold">{member.assignedStoryPoints} pts</span>
                    </p>
                  </div>
                </div>

                {editingUserId === member.userId ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Points:</span>
                      <input
                        type="number"
                        className="w-12 text-xs border rounded px-1 py-0.5"
                        value={editPoints}
                        onChange={(e) => setEditPoints(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">%:</span>
                      <input
                        type="number"
                        className="w-12 text-xs border rounded px-1 py-0.5"
                        value={editPercentage}
                        onChange={(e) => setEditPercentage(Number(e.target.value))}
                      />
                    </div>
                    <button onClick={() => handleSave(member.userId)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingUserId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-700">{member.availableStoryPoints} pts</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{member.availabilityPercentage}% Available</p>
                    </div>
                    <button
                      onClick={() => handleEdit(member.userId, member.availableStoryPoints, member.availabilityPercentage)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
