export type BugSeverity = 'Critical' | 'Major' | 'Minor' | 'Trivial';

export interface BugReportSubmission {
  projectCode: string;
  senderName: string;
  senderEmail: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehaviour: string;
  actualBehaviour: string;
  environment: string;
  severity: BugSeverity;
  attachments?: File[];
}

export interface BugReportSubmissionResponse {
  ticketNumber: string;
  message: string;
  submittedAt: string;
}

export interface TicketTrackingResult {
  ticketNumber: string;
  title: string;
  status: string;
  approvalStatus: string;
  submittedAt: string;
  lastUpdatedAt: string;
  statusHistory: TicketTrackingStatusEntry[];
}

export interface TicketTrackingStatusEntry {
  status: string;
  description: string;
  occurredAt: string;
}

export interface BugApprovalQueueItem {
  ticketId: number;
  ticketNumber: string;
  title: string;
  senderName: string;
  senderEmail: string;
  severity: BugSeverity;
  submittedAt: string;
  approvalStatus: string;
  isApproachingSla: boolean;
  isBreachingSla: boolean;
  slaDeadline: string;
}

export interface CustomerBugSubmission {
  id: number;
  senderEmail: string;
  senderName: string;
  parsedTitle: string;
  parseStatus: 'Parsed' | 'InvalidFormat' | 'Duplicate';
  receivedAt: string;
  createdTicketId?: number;
  createdTicketNumber?: string;
  rawBody?: string;
}

export interface BugSlaConfig {
  slaBusinessDays: number;
  escalateAfterDays: number;
}

export interface UpdateSlaRequest {
  slaBusinessDays: number;
  escalateAfterDays: number;
}

export const SeverityConfig = {
  Critical: {
    label: 'Critical',
    description: 'System is completely unusable or data loss is occurring',
    colour: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
  Major: {
    label: 'Major',
    description: 'Key functionality is broken with no workaround',
    colour: 'bg-orange-100 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
  },
  Minor: {
    label: 'Minor',
    description: 'Feature is impaired but a workaround exists',
    colour: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dot: 'bg-yellow-400',
  },
  Trivial: {
    label: 'Trivial',
    description: 'Minor cosmetic issue with no functional impact',
    colour: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  },
} as const;
