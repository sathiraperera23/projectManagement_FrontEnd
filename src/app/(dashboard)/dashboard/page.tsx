'use client';

import React from 'react';
import { useAuth, usePermissions } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useMyTickets } from '@/hooks/useTickets';
import { LayoutDashboard, Briefcase, Ticket, Activity, Clock, Target, AlertCircle } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAdmin, isProjectManager } = useAuth();
  const { canViewReports } = usePermissions();
  const { data: projects } = useProjects();
  const { data: ticketsData } = useMyTickets();

  const isManagement = isAdmin || isProjectManager;
  const tickets = ticketsData?.items || [];

  if (isManagement) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
          <p className="text-gray-500 font-medium">System-wide performance and activity summary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard label="Active Projects" value={projects?.length || 0} icon={Briefcase} color="text-indigo-600" />
           <StatCard label="Team Activity" value="24" icon={Activity} color="text-emerald-600" description="Updates today" />
           <StatCard label="WIP Status" value="12/15" icon={Target} color="text-amber-600" description="System limit" />
           <StatCard label="Active Delays" value="3" icon={AlertCircle} color="text-red-600" description="High risk items" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Project Portfolio</h3>
              <div className="space-y-4">
                 {projects?.slice(0, 5).map((p: any) => (
                   <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                         <p className="font-bold text-gray-900">{p.name}</p>
                         <p className="text-[10px] text-gray-400 font-black uppercase">{p.clientName}</p>
                      </div>
                      <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase text-gray-600">{p.status}</span>
                   </div>
                 ))}
              </div>
              <Link href="/projects" className="block text-center mt-6 text-sm font-black text-indigo-600 hover:underline">VIEW ALL PROJECTS</Link>
           </div>

           <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Financial Pulse</h3>
              <div className="h-64 flex flex-col items-center justify-center text-center">
                 <div className="h-32 w-32 rounded-full border-8 border-emerald-500 border-t-transparent flex items-center justify-center">
                    <span className="text-2xl font-black text-gray-900">82%</span>
                 </div>
                 <p className="mt-4 text-sm font-bold text-gray-500">Overall Portfolio Margin</p>
                 <Link href="/reports?tab=costing" className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase">View Costing</Link>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back, {user?.displayName.split(' ')[0]}</h1>
        <p className="text-gray-500 font-medium">Here is what's on your plate for today</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
               <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-indigo-600" />
                  Your Assigned Tickets
               </h3>
               <div className="divide-y divide-gray-50">
                  {tickets.length === 0 ? (
                    <p className="py-8 text-center text-gray-400 font-bold">No tickets assigned to you</p>
                  ) : (
                    tickets.slice(0, 5).map((t: any) => (
                      <div key={t.id} className="py-4 flex items-center justify-between group">
                         <div>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-tighter">#{t.ticketNumber}</p>
                            <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{t.title}</p>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase">{formatDate(t.expectedDueDate)}</span>
                         </div>
                      </div>
                    ))
                  )}
               </div>
               <Link href="/my-tickets" className="block text-center mt-6 text-sm font-black text-indigo-600 hover:underline">VIEW FULL LIST</Link>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
               <h3 className="text-lg font-black mb-4 uppercase tracking-wider">Daily Update</h3>
               <p className="text-indigo-100 text-sm font-medium mb-6">Don't forget to log your progress for today's tasks.</p>
               <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase hover:bg-indigo-50 transition-all">Submit Update</button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
               <h3 className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest">Your Projects</h3>
               <div className="space-y-3">
                  {projects?.slice(0, 3).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3">
                       <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.colour }} />
                       <span className="text-sm font-bold text-gray-700">{p.name}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, description }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
       <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2.5 rounded-2xl bg-gray-50", color)}>
             <Icon className="h-6 w-6" />
          </div>
       </div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
       <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
          {description && <span className="text-[10px] font-bold text-gray-500 uppercase">{description}</span>}
       </div>
    </div>
  );
}
