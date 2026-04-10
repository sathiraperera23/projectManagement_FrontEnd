export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
}

export interface SprintSummary {
  sprintId: string;
  totalTickets: number;
  completedTickets: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

export interface SprintCapacity {
  userId: string;
  capacityHours: number;
}

export interface VelocityData {
  sprintName: string;
  estimated: number;
  completed: number;
}
