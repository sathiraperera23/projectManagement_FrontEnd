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
