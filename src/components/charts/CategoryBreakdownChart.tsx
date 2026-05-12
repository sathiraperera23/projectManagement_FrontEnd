'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import type { CategoryBreakdownItem } from '@/types/reports';

interface Props {
  data: CategoryBreakdownItem[];
}

const COLORS = {
  'Task': '#6366f1',
  'Bug': '#ef4444',
  'Feature': '#10b981',
  'Improvement': '#3b82f6',
  'ChangeRequest': '#f59e0b',
  'UserStory': '#8b5cf6',
  'TestCase': '#ec4899',
};

export function CategoryBreakdownChart({ data }: Props) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="category"
            type="category"
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS] || '#9ca3af'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
