# AGENTS.md

## Stack
- Framework: Next.js 14 (App Router, TypeScript)
- Styling: Tailwind CSS
- State: Zustand (auth + UI), React Query (server state)
- Forms: React Hook Form + Zod
- Rich text: TipTap
- Drag and drop: @dnd-kit
- Charts: Recharts
- Gantt: frappe-gantt
- Real time: SignalR (@microsoft/signalr)
- HTTP: Axios with JWT interceptor in src/lib/axios.ts

## Backend
- API base URL: NEXT_PUBLIC_API_BASE_URL in .env.local
- All API functions in src/lib/api/
- Auth: Keycloak SSO — tokens in Zustand authStore
- JWT attached to every request via Axios interceptor
- 401 triggers token refresh then logout

## Conventions
- App Router only — never Pages Router
- Route groups: (auth) for public, (dashboard) for protected
- No any types — strict TypeScript throughout
- Use cn() from src/lib/utils.ts for conditional classes
- Never fetch directly in components — use hooks from src/hooks/
- All API calls through Axios instance in src/lib/axios.ts
- Never hardcode API URLs
- Component files use PascalCase
- Hook files use camelCase prefixed with use

## Project Structure
- src/app/        → pages and layouts
- src/components/ → reusable UI components
- src/lib/        → axios, signalr, api functions, utils
- src/store/      → Zustand stores
- src/hooks/      → custom React hooks
- src/types/      → TypeScript interfaces

## Backend API Reference
- Auth:          POST /api/auth/login, /api/auth/refresh, /api/auth/logout
- Projects:      /api/projects
- Tickets:       /api/tickets
- Sprints:       /api/projects/{id}/sprints
- Backlog:       /api/backlog, /api/projects/{id}/backlog
- Notifications: /api/notifications
- Reports:       /api/projects/{id}/reports
- Users:         /api/users
- Roles:         /api/roles

## Ticket Detail Page
- Location: src/app/(dashboard)/tickets/[ticketId]/page.tsx
- Two column layout: main content 65%, sidebar 35%
- Comments use TipTap editor with @mention support
- Status change requires reason when moving to Paused or Cancelled
- Bug-specific fields shown only when category === Bug
- Approval buttons shown only when approvalStatus === PendingApproval
  and user has APPROVE_TICKETS permission

## Kanban Board
- Location: src/app/(dashboard)/projects/[projectId]/board/page.tsx
- Drag and drop: @dnd-kit/core and @dnd-kit/sortable
- Optimistic updates on drag end — revert on API failure
- WIP limits fetched from GET /api/projects/{projectId}/wip-limits
- Status management via GET/POST/PUT/DELETE /api/projects/{projectId}/statuses
- Toast notifications via react-hot-toast
- DragOverlay shows ghost card while dragging

## Project Pages
- Projects list: src/app/(dashboard)/projects/page.tsx
- Project layout with tabs: src/app/(dashboard)/projects/[projectId]/layout.tsx
- Project summary: src/app/(dashboard)/projects/[projectId]/summary/page.tsx
- Project settings: src/app/(dashboard)/projects/[projectId]/settings/page.tsx

## API Route Reference
- Products nested under: /api/projects/{projectId}/products
- Sub-projects nested under: /api/projects/{projectId}/products/{productId}/subprojects
- Sub-project progress: GET .../subprojects/{id}/progress
- Project summary: GET /api/projects/{projectId}/summary
- WIP limits: PUT /api/projects/{projectId}/wip-limits
- Bug report template: GET/PUT /api/projects/{projectId}/bug-report-template

## Gantt and Timeline
- Page location: src/app/(dashboard)/projects/[projectId]/timeline/page.tsx
- Gantt library: frappe-gantt (dynamically imported in src/components/gantt/GanttChart.tsx to prevent SSR crash)
- Three view levels: project, product, sub-project
- API endpoints:
  - Project level: GET /api/projects/{projectId}/gantt
  - Product level: GET /api/products/{productId}/gantt
  - Sub-project level: GET /api/subprojects/{subProjectId}/gantt
- Drag to reschedule: calls PUT on the relevant entity endpoint (SubProject, Sprint, or Ticket)
- Export: GET /api/projects/{projectId}/gantt/export?format=pdf|png
- Download utility: src/lib/utils/download.ts

## Sprint Planning
- Page: src/app/(dashboard)/projects/[projectId]/sprints/page.tsx
- API file: src/lib/api/sprints.ts
- Hooks: src/hooks/useSprints.ts

## Sprint API Routes
- GET  /api/projects/{projectId}/sprints
- POST /api/projects/{projectId}/sprints
- GET  /api/projects/{projectId}/sprints/active
- GET  /api/projects/{projectId}/sprints/{id}
- PUT  /api/projects/{projectId}/sprints/{id}
- DELETE /api/projects/{projectId}/sprints/{id}
- POST /api/projects/{projectId}/sprints/{id}/activate
- POST /api/projects/{projectId}/sprints/{id}/close
- GET  /api/projects/{projectId}/sprints/{id}/tickets
- POST /api/projects/{projectId}/sprints/{id}/tickets/{ticketId}
- DELETE /api/projects/{projectId}/sprints/{id}/tickets/{ticketId}
- GET  /api/projects/{projectId}/sprints/{id}/capacity
- PUT  /api/projects/{projectId}/sprints/{id}/capacity
- GET  /api/projects/{projectId}/sprints/{id}/summary
- GET  /api/projects/{projectId}/sprints/history
- GET  /api/projects/{projectId}/sprints/{id}/scope-changes
- GET  /api/projects/{projectId}/sprints/velocity
- GET  /api/sprints/{sprintId}/burndown

## Sprint business rules
- Only one active sprint per project at a time
- Capacity is a warning not a hard block
- Close sprint requires disposition for incomplete tickets (MoveToBacklog, MoveToNextSprint, LeaveInPlace)
- Removing ticket from active sprint requires a reason

## Project Backlog
- Page: src/app/(dashboard)/projects/[projectId]/backlog/page.tsx
- API file: src/lib/api/backlog.ts
- Hooks: src/hooks/useBacklog.ts

## Backlog API Routes
- GET  /api/projects/{projectId}/backlog
- POST /api/projects/{projectId}/backlog
- GET  /api/backlog/{id}
- PUT  /api/backlog/{id}
- DELETE /api/backlog/{id}
- GET  /api/backlog/{id}/versions
- POST /api/backlog/{id}/rollback/{versionId}
- GET  /api/backlog/{id}/approvals
- POST /api/backlog/{id}/approvals
- POST /api/backlog/{id}/approvals/{approvalId}/approve
- POST /api/backlog/{id}/approvals/{approvalId}/reject
- POST /api/backlog/{id}/attachments
- DELETE /api/backlog/{id}/attachments/{attachmentId}

## Backlog Business Rules
- Items support versioning and rollback.
- Items can be sent for architectural or business approval.
- Approvals can be approved or rejected with a reason/comment.
- Attachments are managed per backlog item.

## Reports and Charts
- Page: src/app/(dashboard)/reports/page.tsx
- API: src/lib/api/reports.ts
- Hooks: src/hooks/useReports.ts
- All reports require a `projectId` selected from the global project selector.
- Charts use Recharts and are located in src/components/charts/
- Complex reports (RTM, Costing, Delays) are in src/components/reports/

## Report API Routes
- GET /api/projects/{projectId}/reports/rtm
- GET /api/projects/{projectId}/reports/rtm/export
- GET /api/projects/{projectId}/reports/dependency-matrix
- GET /api/projects/{projectId}/reports/dependency-matrix/export
- GET /api/projects/{projectId}/reports/costing
- GET /api/projects/{projectId}/reports/costing/export
- GET /api/projects/{projectId}/reports/delays
- GET /api/projects/{projectId}/reports/delays/export
- GET /api/projects/{projectId}/reports/sprint
- GET /api/projects/{projectId}/reports/bugs
- GET /api/projects/{projectId}/reports/workload
- GET /api/projects/{projectId}/reports/ticket-age
- GET /api/projects/{projectId}/reports/change-requests
- GET /api/projects/{projectId}/charts/ticket-status-distribution
- GET /api/projects/{projectId}/charts/ticket-category-breakdown
- GET /api/projects/{projectId}/charts/team-workload
- GET /api/projects/{projectId}/charts/milestone-progress
- GET /api/projects/{projectId}/charts/bug-trend
- GET /api/projects/{projectId}/delays
- GET /api/projects/{projectId}/delays/overdue
- PUT /api/tickets/{ticketId}/delay-reason
- PUT /api/tickets/{ticketId}/revised-due-date
- GET /api/projects/{projectId}/budget
- POST /api/projects/{projectId}/budget
- GET /api/projects/{projectId}/escalation-rules

## Permission gates
- Costing & P&L: `VIEW_COSTING_DATA` permission required
- Budget setting: `VIEW_BUDGET_DATA` permission required
- Use `PermissionGate` component for conditional rendering.

## Admin Panel
- Layout: src/app/(dashboard)/admin/layout.tsx
- Users: src/app/(dashboard)/admin/users/page.tsx
- Roles: src/app/(dashboard)/admin/roles/page.tsx
- Settings: src/app/(dashboard)/admin/settings/page.tsx
- Accept invitation: src/app/(auth)/accept-invitation/page.tsx (Public)
- API: src/lib/api/users.ts (usersApi and rolesApi)
- Hooks: src/hooks/useAdmin.ts

## Admin API Routes
- GET  /api/users
- GET  /api/users/{id}
- PUT  /api/users/{id}/deactivate
- PUT  /api/users/{id}/reactivate
- PUT  /api/users/me/profile
- POST /api/users/invite
- GET  /api/users/invitations
- DELETE /api/users/invitations/{id}
- POST /api/users/accept-invitation
- POST /api/projects/{projectId}/user-roles
- DELETE /api/projects/{projectId}/user-roles/{userId}
- GET  /api/projects/{projectId}/user-roles/{userId}/permissions
- GET  /api/roles
- GET  /api/roles/{id}
- POST /api/roles
- PUT  /api/roles/{id}
- DELETE /api/roles/{id}
- PUT  /api/roles/{id}/permissions
- GET  /api/roles/permissions
- GET  /api/projects/{projectId}/access-rules
- POST /api/projects/{projectId}/access-rules
- PUT  /api/projects/{projectId}/access-rules/{id}
- DELETE /api/projects/{projectId}/access-rules/{id}
- GET  /api/projects/{projectId}/escalation-rules
- PUT  /api/projects/{projectId}/escalation-rules
- PUT  /api/projects/{projectId}/wip-limits

## Admin Business Rules
- All 31 permissions defined in src/types/user.ts PermissionGroups
- System roles (isSystem: true) cannot be deleted
- Admin layout restricts access based on permissions
- Accept invitation page added to middleware publicRoutes
