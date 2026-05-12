export interface Project {
  id: number;
  name: string;
  description: string;
  clientName: string;
  projectCode: string;
  startDate: string;
  expectedEndDate: string;
  status: ProjectStatus;
  avatarUrl?: string;
  colour?: string;
  isArchived: boolean;
  intakeEmailAddress?: string;
  createdAt: string;
}

export type ProjectStatus = 'Active' | 'OnHold' | 'Completed';

export interface Product {
  id: number;
  projectId: number;
  versionName: string;
  description: string;
  plannedReleaseDate: string;
  releaseType: ReleaseType;
  status: ProductStatus;
  createdAt: string;
}

export type ReleaseType = 'Major' | 'Minor' | 'Patch' | 'Hotfix';
export type ProductStatus =
  'Planned' | 'InDevelopment' | 'InTesting' | 'Released' | 'Deprecated';

export interface SubProject {
  id: number;
  productId: number;
  name: string;
  description: string;
  status: SubProjectStatus;
  moduleOwnerUserId: number;
  moduleOwnerName: string;
  dependsOnSubProjectId?: number;
  completionPercentage: number;
  baselineStartDate?: string;
  baselineEndDate?: string;
  createdAt: string;
}

export type SubProjectStatus =
  'NotStarted' | 'InProgress' | 'InReview' | 'Completed';

export interface ProjectSummary {
  id: number;
  name: string;
  clientName: string;
  projectManagerName: string;
  startDate: string;
  expectedEndDate: string;
  status: ProjectStatus;
  daysRemaining: number;
  wipStatus: WipStatus;
  progressOverview: StatusCount[];
  milestoneSummary: MilestoneSummary[];
  sprintSummary: SprintSummaryItem;
  teamActivity: TeamActivityItem[];
  recentTickets: RecentTicket[];
  delaySummary: DelaySummary;
  budgetIndicator?: BudgetIndicator;
}

export interface WipStatus {
  count: number;
  limit: number;
  level: 'Green' | 'Amber' | 'Red';
}

export interface StatusCount {
  statusName: string;
  count: number;
  colour: string;
}

export interface MilestoneSummary {
  name: string;
  targetDate: string;
  completionPercentage: number;
  status: 'OnTrack' | 'AtRisk' | 'Overdue';
}

export interface SprintSummaryItem {
  name: string;
  goal?: string;
  daysRemaining: number;
  completionPercentage: number;
}

export interface TeamActivityItem {
  teamName: string;
  updatesLast7Days: number;
}

export interface RecentTicket {
  id: number;
  ticketNumber: string;
  title: string;
  status: string;
  statusColour: string;
  updatedAt: string;
}

export interface DelaySummary {
  overdueCount: number;
  blockedCount: number;
}

export interface BudgetIndicator {
  budgetAmount: number;
  consumedAmount: number;
  consumedPercentage: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  clientName: string;
  projectCode?: string;
  startDate: string;
  expectedEndDate: string;
  colour?: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
  clientName: string;
  startDate: string;
  expectedEndDate: string;
  status: ProjectStatus;
  colour?: string;
}

export interface CreateProductRequest {
  versionName: string;
  description: string;
  plannedReleaseDate: string;
  releaseType: ReleaseType;
}

export interface UpdateProductRequest {
  versionName: string;
  description: string;
  plannedReleaseDate: string;
  releaseType: ReleaseType;
  status: ProductStatus;
}

export interface CreateSubProjectRequest {
  name: string;
  description: string;
  moduleOwnerUserId: number;
  dependsOnSubProjectId?: number;
}

export interface UpdateSubProjectRequest {
  name: string;
  description: string;
  status: SubProjectStatus;
  moduleOwnerUserId: number;
  dependsOnSubProjectId?: number;
}

export interface AssignTeamRequest {
  teamId: number;
  userIds: number[];
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}
