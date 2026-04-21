export interface GanttBar {
  id: number;
  name: string;
  type: GanttBarType;
  startDate: string;
  endDate: string;
  completionPercentage: number;
  dependsOnIds: number[];
  isCriticalPath: boolean;
  isOverdue: boolean;
  color: string;
  baselineStartDate?: string;
  baselineEndDate?: string;
  parentId?: number;
  children?: GanttBar[];
}

export type GanttBarType =
  | 'Product'
  | 'SubProject'
  | 'Sprint'
  | 'Milestone'
  | 'Ticket';

export interface GanttViewLevel {
  label: string;
  value: 'project' | 'product' | 'subproject';
}

export type GanttZoomLevel = 'day' | 'week' | 'month' | 'quarter';
