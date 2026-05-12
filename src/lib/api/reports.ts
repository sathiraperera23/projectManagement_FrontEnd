import api from '@/lib/axios';
import { downloadBlob } from '@/lib/utils/download';
import { SetBudgetRequest } from '@/types/reports';

export const reportsApi = {
  // ── RTM Report ────────────────────────────────────────
  getRtm: async (projectId: number, params?: {
    subProjectId?: number;
    productId?: number;
  }) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/rtm`,
      { params }
    );
    return data;
  },
  exportRtm: async (projectId: number, format: 'pdf' | 'xlsx') => {
    const response = await api.get(
      `/api/projects/${projectId}/reports/rtm/export`,
      { params: { format }, responseType: 'blob' }
    );
    downloadBlob(response.data, `rtm-report.${format}`);
  },

  // ── Dependency Matrix ─────────────────────────────────
  getDependencyMatrix: async (projectId: number, params?: {
    subProjectId?: number;
    teamId?: number;
    sprintId?: number;
  }) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/dependency-matrix`,
      { params }
    );
    return data;
  },
  exportDependencyMatrix: async (projectId: number, format: 'pdf' | 'xlsx') => {
    const response = await api.get(
      `/api/projects/${projectId}/reports/dependency-matrix/export`,
      { params: { format }, responseType: 'blob' }
    );
    downloadBlob(response.data, `dependency-matrix.${format}`);
  },

  // ── Costing & P&L ─────────────────────────────────────
  getCosting: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/costing`
    );
    return data;
  },
  exportCosting: async (projectId: number, format: 'pdf' | 'xlsx') => {
    const response = await api.get(
      `/api/projects/${projectId}/reports/costing/export`,
      { params: { format }, responseType: 'blob' }
    );
    downloadBlob(response.data, `costing-report.${format}`);
  },

  // ── Delay Report ──────────────────────────────────────
  getDelays: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/delays`
    );
    return data;
  },
  exportDelays: async (projectId: number, format: 'pdf' | 'xlsx' | 'csv') => {
    const response = await api.get(
      `/api/projects/${projectId}/reports/delays/export`,
      { params: { format }, responseType: 'blob' }
    );
    downloadBlob(response.data, `delay-report.${format}`);
  },

  // ── Sprint Report ─────────────────────────────────────
  getSprintReport: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/sprint`
    );
    return data;
  },

  // ── Bug Report ────────────────────────────────────────
  getBugReport: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/bugs`
    );
    return data;
  },

  // ── Workload Report ───────────────────────────────────
  getWorkload: async (projectId: number, params?: {
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/workload`,
      { params }
    );
    return data;
  },

  // ── Ticket Age Report ─────────────────────────────────
  getTicketAge: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/ticket-age`
    );
    return data;
  },

  // ── Change Request Log ────────────────────────────────
  getChangeRequests: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/reports/change-requests`
    );
    return data;
  },

  // ── Chart data ────────────────────────────────────────
  getStatusDistribution: async (projectId: number, subProjectId?: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/charts/ticket-status-distribution`,
      { params: { subProjectId } }
    );
    return data;
  },
  getCategoryBreakdown: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/charts/ticket-category-breakdown`
    );
    return data;
  },
  getTeamWorkload: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/charts/team-workload`
    );
    return data;
  },
  getMilestoneProgress: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/charts/milestone-progress`
    );
    return data;
  },
  getBugTrend: async (projectId: number, weeks: number = 12) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/charts/bug-trend`,
      { params: { weeks } }
    );
    return data;
  },

  // ── Time logging ──────────────────────────────────────
  getTimeLogs: async (ticketId: number) => {
    const { data } = await api.get(`/api/tickets/${ticketId}/time-logs`);
    return data;
  },

  // ── Budget ────────────────────────────────────────────
  getBudget: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/budget`);
    return data;
  },
  setBudget: async (projectId: number, request: SetBudgetRequest) => {
    const { data } = await api.post(
      `/api/projects/${projectId}/budget`,
      request
    );
    return data;
  },

  // ── Delays dashboard ──────────────────────────────────
  getDelaysDashboard: async (projectId: number) => {
    const { data } = await api.get(`/api/projects/${projectId}/delays`);
    return data;
  },
  getOverdueTickets: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/delays/overdue`
    );
    return data;
  },
  setDelayReason: async (ticketId: number, reason: string) => {
    await api.put(`/api/tickets/${ticketId}/delay-reason`, { reason });
  },
  getEscalationRules: async (projectId: number) => {
    const { data } = await api.get(
      `/api/projects/${projectId}/escalation-rules`
    );
    return data;
  },
};
