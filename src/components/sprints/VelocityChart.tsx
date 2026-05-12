'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { SprintVelocity } from '@/types/sprint';

interface Props {
  data: SprintVelocity;
}

export function VelocityChart({ data }: Props) {
  if (!data || !data.dataPoints || data.dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
        No velocity data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.dataPoints} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="sprintName"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af', offset: 10 }}
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number, name: string) => [
                value,
                name === 'plannedPoints' ? 'Planned' : 'Completed'
              ]}
            />
            <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
            <Bar dataKey="plannedPoints" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Planned" barSize={32} />
            <Bar dataKey="completedPoints" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completed" barSize={32} />

            <ReferenceLine
              y={data.averageVelocity}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{ position: 'right', value: `Avg: ${data.averageVelocity}`, fill: '#10b981', fontSize: 10, fontWeight: 'bold' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-lg border border-emerald-100">
         <div>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Average Velocity</p>
            <p className="text-2xl font-black text-emerald-700">{data.averageVelocity} pts</p>
         </div>
         <div className="text-right">
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Projected Completion</p>
            <p className="text-sm font-bold text-emerald-700">{new Date(data.projectedCompletionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
         </div>
      </div>
    </div>
  );
}
