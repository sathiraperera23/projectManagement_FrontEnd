'use client';

import React, { useState } from 'react';
import { useCostingReport, useSetBudget } from '@/hooks/useReports';
import { useAuthStore } from '@/store/authStore';
import { reportsApi } from '@/lib/api/reports';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Download,
  Settings,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { CostingReport as CostingReportType, SubProjectCost, TeamCost, TicketCost } from '@/types/reports';
import toast from 'react-hot-toast';

interface Props {
  projectId: number;
}

export function CostingReport({ projectId }: Props) {
  const [activeTab, setActiveTab] = useState<'subproject' | 'team' | 'ticket'>('subproject');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [contractValue, setContractValue] = useState<number>(0);

  const { data: report, isLoading } = useCostingReport(projectId);
  const setBudgetMutation = useSetBudget(projectId);

  const canViewBudget = useAuthStore(s => s.user?.roles.some(r => ['Administrator', 'Project Manager'].includes(r)));

  const handleSetBudget = async () => {
    try {
      await setBudgetMutation.mutateAsync({ budgetAmount, contractValue });
      setIsBudgetModalOpen(false);
      toast.success('Budget updated');
    } catch {
      toast.error('Failed to update budget');
    }
  };

  if (isLoading) return <div className="p-8 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />)}</div>;
  if (!report) return null;

  return (
    <div className="space-y-8">
      {/* P&L Banner */}
      <div className={cn(
        "rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-indigo-100/20",
        report.isAtLoss ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
      )}>
        <div>
           <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Profit & Loss Status</p>
           <h2 className="text-3xl font-black mt-1">
              {report.isAtLoss ? 'PROJECT AT LOSS' : 'IN PROFIT'}
           </h2>
        </div>
        <div className="text-right">
           <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Net Margin</p>
           <p className="text-4xl font-black mt-1">{report.marginPercentage}%</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <SummaryCard label="Total Cost" value={report.totalCost} icon={DollarSign} color="text-blue-600" isCurrency />
         <SummaryCard label="Contract Value" value={report.contractValue || 0} icon={Target} color="text-gray-600" isCurrency />
         <SummaryCard label="Profit / Loss" value={report.profitLoss} icon={report.isAtLoss ? TrendingDown : TrendingUp} color={report.isAtLoss ? "text-red-600" : "text-emerald-600"} isCurrency />
         <SummaryCard label="Daily Burn Rate" value={report.burnRate} icon={Clock} color="text-amber-600" isCurrency />
      </div>

      {/* Breakdown Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-6">
               <TabButton active={activeTab === 'subproject'} onClick={() => setActiveTab('subproject')}>By Sub-Project</TabButton>
               <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')}>By Team</TabButton>
               <TabButton active={activeTab === 'ticket'} onClick={() => setActiveTab('ticket')}>By Ticket</TabButton>
            </div>
            <div className="flex items-center gap-2">
               {canViewBudget && (
                 <button
                   onClick={() => setIsBudgetModalOpen(true)}
                   className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                 >
                    <Settings className="h-3.5 w-3.5" /> Budget
                 </button>
               )}
               <button
                 onClick={() => reportsApi.exportCosting(projectId, 'xlsx')}
                 className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"
               >
                  <Download className="h-3.5 w-3.5" /> Export
               </button>
            </div>
         </div>

         <div className="p-0">
            {activeTab === 'subproject' && <BreakdownTable headers={['Sub-Project', 'Hours', 'Cost']} rows={report.subProjectBreakdown.map(s => [s.subProjectName, s.hoursLogged, `$${s.totalCost.toLocaleString()}`])} />}
            {activeTab === 'team' && <BreakdownTable headers={['Team Name', 'Hours', 'Cost']} rows={report.teamBreakdown.map(t => [t.teamName, t.hoursLogged, `$${t.totalCost.toLocaleString()}`])} />}
            {activeTab === 'ticket' && <BreakdownTable headers={['Ticket', 'Assignee', 'Hours', 'Cost']} rows={report.ticketBreakdown.map(t => [t.ticketNumber, t.assigneeName, t.hoursLogged, `$${t.cost.toLocaleString()}`])} />}
         </div>
      </div>

      {/* Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-gray-900 mb-6">Set Project Budget</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Internal Budget Amount</label>
                    <input type="number" className="w-full rounded-xl border-gray-200 px-4 py-2.5 font-bold" value={budgetAmount} onChange={e => setBudgetAmount(Number(e.target.value))} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Contract Value (Client)</label>
                    <input type="number" className="w-full rounded-xl border-gray-200 px-4 py-2.5 font-bold" value={contractValue} onChange={e => setContractValue(Number(e.target.value))} />
                 </div>
                 <div className="flex gap-3 pt-6">
                    <button onClick={() => setIsBudgetModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancel</button>
                    <button onClick={handleSetBudget} className="flex-1 px-4 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Save Budget</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color, isCurrency }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className={cn("text-xl font-black", color)}>
             {isCurrency ? `$${value.toLocaleString()}` : value}
          </p>
       </div>
       <div className={cn("p-2 rounded-lg bg-gray-50", color.replace('text', 'text-opacity-20'))}>
          <Icon className="h-5 w-5" />
       </div>
    </div>
  );
}

function TabButton({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
        active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
      )}
    >
       {children}
       {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
    </button>
  );
}

function BreakdownTable({ headers, rows }: any) {
  return (
    <table className="w-full text-left">
       <thead className="bg-gray-50/50">
          <tr>
             {headers.map((h: string) => <th key={h} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>)}
          </tr>
       </thead>
       <tbody className="divide-y divide-gray-50">
          {rows.map((row: any[], i: number) => (
            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
               {row.map((cell, j) => <td key={j} className="px-6 py-4 text-sm font-bold text-gray-700">{cell}</td>)}
            </tr>
          ))}
       </tbody>
    </table>
  );
}
