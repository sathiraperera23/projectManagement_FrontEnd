export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  projectId: number;
  projectName: string;
  productId: number;
  productName: string;
  subProjectId: number;
  subProjectName: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignees: TicketAssignee[];
  teamId: number;
  teamName: string;
  reporterId: number;
  reporterName: string;
  startDate?: string;
  expectedDueDate?: string;
  actualEndDate?: string;
  storyPoints?: number;
  sprintId?: number;
  milestoneId?: number;
  labels: string[];
  isBlocked: boolean;
  isOverdue: boolean;
  timeLogged: number;
  severity?: string;
  stepsToReproduce?: string;
  expectedBehaviour?: string;
  actualBehaviour?: string;
  environment?: string;
  approvalStatus?: string;
  pauseReason?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketStatus {
  id: number;
  name: string;
  colour: string;
  order: number;
  isTerminal: boolean;
}

export interface TicketAssignee {
  id: number;
  displayName: string;
  avatarUrl?: string;
}

export type TicketCategory =
  'Task' | 'Bug' | 'Feature' | 'Improvement' |
  'ChangeRequest' | 'UserStory' | 'TestCase';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface TicketFilters {
  projectId?: number;
  productId?: number;
  subProjectId?: number;
  statusId?: number;
  priority?: string;
  category?: string;
  assigneeId?: number;
  teamId?: number;
  sprintId?: number;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface BulkStatusRequest {
  ticketIds: number[];
  statusId: number;
  reason?: string;
}

export interface BulkAssignRequest {
  ticketIds: number[];
  assigneeId: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  projectId: number;
  productId: number;
  subProjectId: number;
  priority: TicketPriority;
  assigneeIds: number[];
  startDate?: string;
  expectedDueDate?: string;
  storyPoints?: number;
  labels?: string[];
  severity?: string;
  stepsToReproduce?: string;
  expectedBehaviour?: string;
  actualBehaviour?: string;
  environment?: string;
}
