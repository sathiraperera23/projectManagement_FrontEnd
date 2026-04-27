'use client';

import React, { useState } from 'react';
import {
  useProjects,
} from '@/hooks/useProjects';
import {
  User,
  Settings as SettingsIcon,
  Lock,
  Bell,
  Database,
  ShieldAlert,
  ChevronRight,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'org' | 'access' | 'escalation' | 'wip'>('profile');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const { data: projects } = useProjects();

  const navItems = [
    { id: 'profile', label: 'My Admin Profile', icon: User },
    { id: 'org', label: 'Organization', icon: SettingsIcon },
    { id: 'access', label: 'Access Rules', icon: Lock },
    { id: 'escalation', label: 'Escalation Logic', icon: ShieldAlert },
    { id: 'wip', label: 'WIP Limits', icon: Database },
  ];

  return (
    <div className="flex h-full gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Settings Navigation */}
      <div className="w-64 shrink-0 flex flex-col gap-1">
         {navItems.map((item) => (
           <button
             key={item.id}
             onClick={() => setActiveTab(item.id as any)}
             className={cn(
               "flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left",
               activeTab === item.id
                ? "bg-white border-indigo-500 shadow-md text-indigo-600 ring-1 ring-indigo-500"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
             )}
           >
             <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
             </div>
             {activeTab === item.id && <ChevronRight className="h-4 w-4" />}
           </button>
         ))}
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
           <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{activeTab.replace('-', ' ')} Settings</h2>
           <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
              <Save className="h-4 w-4" />
              SAVE CHANGES
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
           {activeTab === 'profile' && (
             <div className="max-w-xl space-y-8">
                <div className="flex items-center gap-6">
                   <div className="h-20 w-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-2xl font-black text-indigo-600 border border-indigo-100 shadow-inner">A</div>
                   <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Upload New Photo</button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Public Display Name</label>
                      <input type="text" className="w-full rounded-xl border-gray-200 px-4 py-3 font-bold" defaultValue="Admin User" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email (Read Only)</label>
                      <input type="email" readOnly className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 font-bold text-gray-400" defaultValue="admin@system.com" />
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'access' && (
             <div className="space-y-8">
                <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                   <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Target Project:</span>
                   <select
                    className="bg-white border-gray-200 rounded-xl px-4 py-2 text-sm font-bold shadow-sm"
                    value={selectedProjectId || ''}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                   >
                      <option value="">Select a project...</option>
                      {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>

                {selectedProjectId ? (
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Access Rules</h3>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100"><Plus className="h-3 w-3" /> ADD RULE</button>
                     </div>
                     <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400">
                              <tr>
                                 <th className="px-6 py-3">Component</th>
                                 <th className="px-6 py-3">Condition</th>
                                 <th className="px-6 py-3">Access</th>
                                 <th className="px-6 py-3"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              <tr className="text-sm font-bold text-gray-700">
                                 <td className="px-6 py-4">Financial Reports</td>
                                 <td className="px-6 py-4">Role: Project Manager</td>
                                 <td className="px-6 py-4"><span className="text-emerald-600">Full Access</span></td>
                                 <td className="px-6 py-4 text-right"><button className="text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-400">
                     <Lock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                     <p className="font-bold">Select a project to manage specific access rules.</p>
                  </div>
                )}
             </div>
           )}

           {!['profile', 'access'].includes(activeTab) && (
             <div className="py-20 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Configuration module for {activeTab} coming soon...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
