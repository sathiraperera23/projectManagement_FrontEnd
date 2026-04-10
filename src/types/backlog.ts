export interface BacklogItem {
  id: string;
  projectId: string;
  title: string;
  priority: number;
  status: string;
}

export interface BacklogItemVersion {
  id: string;
  backlogItemId: string;
  versionNumber: number;
  changes: string;
  createdAt: string;
}

export interface BacklogAttachment {
  id: string;
  backlogItemId: string;
  fileName: string;
  url: string;
}

export interface ApprovalRequest {
  id: string;
  backlogItemId: string;
  requesterId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
