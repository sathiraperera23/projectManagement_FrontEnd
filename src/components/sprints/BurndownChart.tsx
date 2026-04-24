'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { BurndownDataPoint } from '@/types/sprint';
import { cn } from '@/lib/utils';

interface Props {
  data: BurndownDataPoint[];
  sprintName: string;
}

export function BurndownChart({ data, sprintName }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
        No burndown data available for this sprint
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short'
              })}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af', offset: 10 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-GB', {
                weekday: 'short', day: '2-digit', month: 'short'
              })}
            />
            <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
            <Line
              type="monotone"
              dataKey="idealRemainingPoints"
              stroke="#9ca3af"
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Ideal"
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="actualRemainingPoints"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Actual"
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
            <ReferenceLine
              x={new Date().toISOString().split('T')[0]}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ position: 'top', value: 'Today', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scope Change Markers */}
      <div className="flex flex-wrap gap-4 px-4">
        {data.filter(d => d.scopeChangeOnDate).map((point, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">
              {new Date(point.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
            <div className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold",
              point.scopeChangeOnDate! > 0 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            )}>
              {point.scopeChangeOnDate! > 0 ? '+' : ''}{point.scopeChangeOnDate} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
