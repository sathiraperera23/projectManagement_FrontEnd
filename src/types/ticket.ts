export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assigneeId?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = 'Todo' | 'InProgress' | 'Done' | 'Blocked';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketCategory = 'Bug' | 'Feature' | 'Task' | 'Improvement';

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  url: string;
  uploadedAt: string;
}

export interface TicketAssignee {
  id: string;
  displayName: string;
  avatarUrl?: string;
}
