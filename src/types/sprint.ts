export interface Sprint {
  id: number;
  name: string;
  goal?: string;
  projectId: number;
  productId?: number;
  subProjectId?: number;
  startDate: string;
  endDate: string;
  storyPointCapacity: number;
  plannedStoryPoints: number;
  completedStoryPoints: number;
  status: SprintStatus;
  daysRemaining: number;
  completionPercentage: number;
  isOverCapacity: boolean;
  createdAt: string;
  closedAt?: string;
  createdBy: {
    id: number;
    displayName: string;
  };
}

export type SprintStatus = 'Planning' | 'Active' | 'Closed';

export interface SprintSummary {
  id: number;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  plannedStoryPoints: number;
  completedStoryPoints: number;
  completionRate: number;
  totalTickets: number;
  completedTickets: number;
  carriedOverTickets: number;
  status: SprintStatus;
  closedAt?: string;
}

export interface SprintCapacity {
  sprintId: number;
  totalCapacity: number;
  plannedStoryPoints: number;
  remainingCapacity: number;
  isOverCapacity: boolean;
  memberCapacities: MemberCapacity[];
}

export interface MemberCapacity {
  userId: number;
  displayName: string;
  avatarUrl?: string;
  availableStoryPoints: number;
  availabilityPercentage: number;
  assignedStoryPoints: number;
}

export interface SprintVelocity {
  dataPoints: VelocityDataPoint[];
  averageVelocity: number;
  projectedCompletionDate: string;
}

export interface VelocityDataPoint {
  sprintId: number;
  sprintName: string;
  plannedPoints: number;
  completedPoints: number;
}

export interface BurndownDataPoint {
  date: string;
  idealRemainingPoints: number;
  actualRemainingPoints: number;
  scopeChangeOnDate?: number;
}

export interface ScopeChange {
  id: number;
  ticketId: number;
  ticketNumber: string;
  ticketTitle: string;
  changeType: 'Added' | 'Removed';
  reason?: string;
  changedBy: {
    id: number;
    displayName: string;
  };
  changedAt: string;
}

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  projectId: number;
  productId?: number;
  subProjectId?: number;
  startDate: string;
  endDate: string;
  storyPointCapacity: number;
}

export interface UpdateSprintRequest {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  storyPointCapacity: number;
}

export interface CloseSprintRequest {
  disposition: SprintClosureDisposition;
  nextSprintId?: number;
}

export type SprintClosureDisposition =
  | 'MoveToBacklog'
  | 'MoveToNextSprint'
  | 'LeaveInPlace';

export interface SetMemberCapacityRequest {
  userId: number;
  availableStoryPoints: number;
  availabilityPercentage: number;
}
