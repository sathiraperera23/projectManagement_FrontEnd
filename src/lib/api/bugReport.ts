import api from '@/lib/axios';
import {
  BugReportSubmission,
  UpdateSlaRequest
} from '@/types/bugReport';

export const bugReportApi = {
  // ── Public endpoints — no JWT required ────────────────

  // Submit a bug report via the web form
  submitBugReport: async (request: BugReportSubmission) => {
    const formData = new FormData();
    formData.append('projectCode', request.projectCode);
    formData.append('senderName', request.senderName);
    formData.append('senderEmail', request.senderEmail);
    formData.append('title', request.title);
    formData.append('description', request.description);
    formData.append('stepsToReproduce', request.stepsToReproduce);
    formData.append('expectedBehaviour', request.expectedBehaviour);
    formData.append('actualBehaviour', request.actualBehaviour);
    formData.append('environment', request.environment);
    formData.append('severity', request.severity);

    if (request.attachments) {
      request.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const { data } = await api.post(
      '/api/bug-report/submit',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  // Track a submitted ticket by ticket number and email
  trackTicket: async (ticketNumber: string, email: string) => {
    const { data } = await api.get('/api/bug-report/track', {
      params: { ticketNumber, email }
    });
    return data;
  },

  // Get the bug report template for a project by project code
  getTemplate: async (projectCode: string) => {
    const { data } = await api.get(
      `/api/bug-report/template`,
      { params: { projectCode } }
    );
    return data;
  },

  // ── PM endpoints — JWT required ───────────────────────

  // PM approval queue
  getApprovalQueue: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/bug-approval-queue`
    );
    return data;
  },

  // Get all bug submissions including invalid and duplicates
  getSubmissions: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/bug-submissions`
    );
    return data;
  },

  // PM approve bug
  approve: async (ticketId: number) => {
    await api.post(`/api/tickets/${ticketId}/approve`);
  },

  // PM reject bug with mandatory reason
  reject: async (ticketId: number, reason: string) => {
    await api.post(`/api/tickets/${ticketId}/reject`, { reason });
  },

  // PM request more info from customer
  requestMoreInfo: async (ticketId: number, message: string) => {
    await api.post(
      `/api/tickets/${ticketId}/request-more-info`,
      { message }
    );
  },

  // SLA configuration
  getSla: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/bug-sla`);
    return data;
  },
  updateSla: async (projectId: number, request: UpdateSlaRequest) => {
    const { data } = await api.put(
      `/api/projects/${projectId}/bug-sla`,
      request
    );
    return data;
  },

  // Download bug report template file
  downloadTemplate: async (projectId: number) => {
    const response = await api.get(
      `/api/projects/${projectId}/bug-report-template`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};
