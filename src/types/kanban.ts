import type { TicketPriority, TicketCategory } from './ticket';

export interface KanbanColumn {
  statusId: number;
  statusName: string;
  statusColour: string;
  wipLimit?: number;
  isOverWipLimit: boolean;
  tickets: KanbanTicket[];
  groups?: KanbanGroup[];
}

export interface KanbanTicket {
  id: number;
  ticketNumber: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  assigneeIds: number[];
  assignees: { id: number; displayName: string; avatarUrl?: string }[];
  storyPoints?: number;
  isBlocked: boolean;
  isOverdue: boolean;
  labels: string[];
  expectedDueDate?: string;
  subProjectName: string;
}

export interface KanbanGroup {
  groupKey: string;
  groupLabel: string;
  tickets: KanbanTicket[];
}

export interface CreateStatusRequest {
  name: string;
  colour: string;
  order: number;
}

export interface UpdateStatusRequest {
  name?: string;
  colour?: string;
  order?: number;
}

export interface WipLimitRequest {
  limits: { statusId: number; limit: number }[];
}
