export interface RtmRow {
  requirementId: string;
  requirementDescription: string;
  useCaseNumber?: string;
  userStory?: string;
  linkedTickets: LinkedTicketSummary[];
  ticketStatus?: string;
  testCaseNumber?: string;
  testStatus?: string;
  hasCoverageGap: boolean;
}

export interface LinkedTicketSummary {
  ticketNumber: string;
  title: string;
  status: string;
  statusColour: string;
}

export interface DependencyMatrixItem {
  ticketId: number;
  ticketNumber: string;
  title: string;
  subProject: string;
  blockedBy: string[];
  blocks: string[];
  isCurrentlyBlocked: boolean;
}

export interface CostingReport {
  projectId: number;
  projectName: string;
  contractValue?: number;
  budgetAmount?: number;
  totalCost: number;
  profitLoss: number;
  marginPercentage: number;
  burnRate: number;
  costForecast: number;
  isAtLoss: boolean;
  subProjectBreakdown: SubProjectCost[];
  teamBreakdown: TeamCost[];
  ticketBreakdown: TicketCost[];
}

export interface SubProjectCost {
  subProjectName: string;
  totalCost: number;
  hoursLogged: number;
}

export interface TeamCost {
  teamName: string;
  totalCost: number;
  hoursLogged: number;
}

export interface TicketCost {
  ticketNumber: string;
  title: string;
  assigneeName: string;
  hoursLogged: number;
  hourlyRate: number;
  cost: number;
}

export interface DelayReportRow {
  ticketId: number;
  ticketNumber: string;
  title: string;
  subProject: string;
  assignee: string;
  originalDueDate: string;
  revisedDueDate?: string;
  daysDelayed: number;
  delayType: string;
  reason?: string;
}

export interface BugReportData {
  openCount: number;
  closedCount: number;
  averageResolutionDays: number;
  bySeverity: { severity: string; count: number }[];
  trend: { weekStartDate: string; openedCount: number; closedCount: number }[];
}

export interface WorkloadReportRow {
  userId: number;
  displayName: string;
  teamName: string;
  hoursLogged: number;
  storyPoints: number;
  ticketCount: number;
}

export interface TicketAgeRow {
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  createdAt: string;
  ageDays: number;
}

export interface StatusDistributionItem {
  statusName: string;
  count: number;
  colour: string;
}

export interface CategoryBreakdownItem {
  category: string;
  count: number;
  percentage: number;
}

export interface TeamWorkloadItem {
  userId: number;
  displayName: string;
  assignedPoints: number;
  completedPoints: number;
}

export interface MilestoneProgressItem {
  name: string;
  targetDate: string;
  completionPercentage: number;
  status: 'OnTrack' | 'AtRisk' | 'Overdue';
}

export interface BugTrendDataPoint {
  weekStartDate: string;
  openedCount: number;
  closedCount: number;
}

export interface SetBudgetRequest {
  budgetAmount: number;
  contractValue?: number;
  subProjectId?: number;
  productId?: number;
}

export interface DelaysDashboard {
  overdueTickets: DelayReportRow[];
  blockedTickets: DelayReportRow[];
  milestoneAtRisk: { name: string; targetDate: string; daysOverdue: number }[];
  subProjectDelays: { subProjectName: string; delayedTicketCount: number }[];
}
