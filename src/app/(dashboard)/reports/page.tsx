'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import {
  useStatusDistribution,
  useCategoryBreakdown,
  useTeamWorkloadChart,
  useMilestoneProgress,
  useBugTrend
} from '@/hooks/useReports';
import { StatusDistributionChart } from '@/components/charts/StatusDistributionChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { TeamWorkloadChart } from '@/components/charts/TeamWorkloadChart';
import { MilestoneProgressChart } from '@/components/charts/MilestoneProgressChart';
import { BugTrendChart } from '@/components/charts/BugTrendChart';
import { RtmReport } from '@/components/reports/RtmReport';
import { CostingReport } from '@/components/reports/CostingReport';
import { DelayReport } from '@/components/reports/DelayReport';
import { DelaysDashboard } from '@/components/reports/DelaysDashboard';
import { PermissionGate } from '@/components/reports/PermissionGate';
import {
  BarChart3,
  PieChart,
  FileText,
  Layers,
  DollarSign,
  Clock,
  Zap,
  Bug,
  UserCircle,
  History,
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportTab =
  | 'charts'
  | 'rtm'
  | 'dependencies'
  | 'costing'
  | 'delays'
  | 'sprint'
  | 'bugs'
  | 'workload'
  | 'age'
  | 'changes';

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ReportTab>((searchParams.get('tab') as ReportTab) || 'charts');
  const [projectId, setProjectId] = useState<number | null>(searchParams.get('projectId') ? Number(searchParams.get('projectId')) : null);

  const { data: projects } = useProjects();

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    if (projectId) params.set('projectId', projectId.toString());
    router.replace(`/reports?${params.toString()}`);
  }, [activeTab, projectId, router, searchParams]);

  const navItems = [
    { id: 'charts', label: 'Dashboard Overview', icon: PieChart },
    { id: 'rtm', label: 'Requirements (RTM)', icon: FileText },
    { id: 'dependencies', label: 'Dependency Matrix', icon: ArrowRightLeft },
    { id: 'costing', label: 'Costing & P&L', icon: DollarSign },
    { id: 'delays', label: 'Delays & Risks', icon: Clock },
    { id: 'sprint', label: 'Sprint Report', icon: Zap },
    { id: 'bugs', label: 'Bug Analysis', icon: Bug },
    { id: 'workload', label: 'Team Workload', icon: UserCircle },
    { id: 'age', label: 'Ticket Aging', icon: History },
    { id: 'changes', label: 'Change Requests', icon: Layers },
  ];

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header with Project Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Intelligence Reports</h1>

        <div className="relative flex items-center gap-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Project:</span>
          <div className="relative group">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all cursor-pointer min-w-[240px]"
              value={projectId || ''}
              onChange={(e) => setProjectId(Number(e.target.value))}
            >
              <option value="">Choose a project...</option>
              {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
          </div>
        </div>
      </div>

      {!projectId ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm p-20 text-center">
           <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="h-12 w-12 text-indigo-400" />
           </div>
           <h2 className="text-2xl font-black text-gray-900 mb-2">Project Selection Required</h2>
           <p className="text-gray-500 max-w-sm">Please select a project from the dropdown above to view its analytics and performance reports.</p>
        </div>
      ) : (
        <div className="flex-1 flex gap-8 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-72 shrink-0 overflow-y-auto space-y-1 pr-2">
             {navItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id as ReportTab)}
                 className={cn(
                   "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
                   activeTab === item.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                 )}
               >
                 <item.icon className="h-4 w-4 shrink-0" />
                 <span className="truncate">{item.label}</span>
               </button>
             ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto pr-4 pb-20 space-y-8">
             {activeTab === 'charts' && <ChartsOverview projectId={projectId} />}
             {activeTab === 'rtm' && <RtmReport projectId={projectId} />}
             {activeTab === 'costing' && (
               <PermissionGate permission="VIEW_COSTING_DATA">
                  <CostingReport projectId={projectId} />
               </PermissionGate>
             )}
             {activeTab === 'delays' && <DelaysSection projectId={projectId} />}

             {/* Placeholder for other sections */}
             {!['charts', 'rtm', 'costing', 'delays'].includes(activeTab) && (
               <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-widest">{activeTab.replace('-', ' ')}</h3>
                  <p className="text-gray-400 font-bold">REPORT MODULE LOADING...</p>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartsOverview({ projectId }: { projectId: number }) {
  const { data: statusDist } = useStatusDistribution(projectId);
  const { data: catBreakdown } = useCategoryBreakdown(projectId);
  const { data: workload } = useTeamWorkloadChart(projectId);
  const { data: milestoneProgress } = useMilestoneProgress(projectId);
  const { data: bugTrend } = useBugTrend(projectId);

  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Status Distribution" description="Total ticket count by status">
             <StatusDistributionChart data={statusDist || []} />
          </ChartCard>
          <ChartCard title="Category Breakdown" description="Composition of work items">
             <CategoryBreakdownChart data={catBreakdown || []} />
          </ChartCard>
          <ChartCard title="Team Resource Allocation" description="Assigned vs completed points">
             <TeamWorkloadChart data={workload || []} />
          </ChartCard>
          <ChartCard title="Strategic Milestones" description="Progress towards key deliverables">
             <MilestoneProgressChart data={milestoneProgress || []} />
          </ChartCard>
       </div>
       <ChartCard title="Bug Velocity Trend" description="Comparison of opened vs closed bugs weekly" fullWidth>
          <BugTrendChart data={bugTrend || []} />
       </ChartCard>
    </div>
  );
}

function DelaysSection({ projectId }: { projectId: number }) {
  const [view, setView] = useState<'dashboard' | 'report'>('dashboard');

  return (
    <div className="space-y-6">
       <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setView('dashboard')}
            className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", view === 'dashboard' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
          >
             Risk Dashboard
          </button>
          <button
            onClick={() => setView('report')}
            className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", view === 'report' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
          >
             Detailed Report
          </button>
       </div>
       {view === 'dashboard' ? <DelaysDashboard projectId={projectId} /> : <DelayReport projectId={projectId} />}
    </div>
  );
}

function ChartCard({ title, description, children, fullWidth }: any) {
  return (
    <div className={cn("bg-white rounded-3xl border border-gray-100 p-8 shadow-sm", fullWidth && "col-span-full")}>
       <div className="mb-8">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</h3>
          <p className="text-xs font-bold text-gray-400 mt-1">{description}</p>
       </div>
       {children}
    </div>
  );
}
