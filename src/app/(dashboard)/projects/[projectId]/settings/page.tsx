'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { ProductList } from '@/components/projects/ProductList';
import {
  Settings,
  Users,
  ListTodo,
  Shield,
  Bell,
  FileText,
  Save,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: project } = useProject(projectId);

  const [activeSection, setActiveSection] = useState('general');

  const menuItems = [
    { id: 'general', name: 'General Settings', icon: Settings },
    { id: 'products', name: 'Products & Modules', icon: ListTodo },
    { id: 'teams', name: 'Team Management', icon: Users },
    { id: 'statuses', name: 'Status Workflow', icon: ListTodo },
    { id: 'notifications', name: 'Notification Rules', icon: Bell },
    { id: 'access', name: 'Access Rules', icon: Shield },
    { id: 'template', name: 'Bug Template', icon: FileText },
  ];

  const handleArchive = async () => {
    if (confirm('Are you sure you want to archive this project? It will become read-only.')) {
      // Archive logic would go here
      toast.success('Project archived');
    }
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
         <div className="p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Project Settings</h2>
         </div>
         <nav className="px-3 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSection === item.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </button>
            ))}
         </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-10">
         <div className="max-w-4xl mx-auto">
            {activeSection === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                    <div>
                       <h3 className="text-xl font-bold text-gray-900">General Settings</h3>
                       <p className="text-sm text-gray-500">Update project basic information and visibility</p>
                    </div>
                    <button className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-500">
                       <Save className="h-4 w-4" /> Save Changes
                    </button>
                 </div>

                 <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                    <div className="sm:col-span-2">
                       <label className="block text-sm font-bold text-gray-700">Project Name</label>
                       <input type="text" defaultValue={project?.name} className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700">Client Name</label>
                       <input type="text" defaultValue={project?.clientName} className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700">Project Status</label>
                       <select className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                          <option>Active</option>
                          <option>OnHold</option>
                          <option>Completed</option>
                       </select>
                    </div>
                    <div className="sm:col-span-2">
                       <label className="block text-sm font-bold text-gray-700">Description</label>
                       <textarea rows={4} defaultValue={project?.description} className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                 </div>

                 <div className="pt-10 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">Danger Zone</h4>
                    <div className="rounded-xl border border-red-100 bg-red-50 p-6 flex items-center justify-between">
                       <div className="max-w-md">
                          <p className="text-sm font-bold text-gray-900">Archive this project</p>
                          <p className="text-xs text-gray-500 mt-1">Archiving will make the project read-only and hide it from active project lists. This action can be undone.</p>
                       </div>
                       <button
                         onClick={handleArchive}
                         className="flex items-center gap-2 rounded-md bg-white border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
                       >
                          <Archive className="h-4 w-4" /> Archive Project
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {activeSection === 'products' && (
               <div className="animate-in fade-in slide-in-from-bottom-2">
                  <div className="mb-8">
                     <h3 className="text-xl font-bold text-gray-900">Products & Modules</h3>
                     <p className="text-sm text-gray-500">Manage software versions and their sub-components</p>
                  </div>
                  <ProductList projectId={projectId} />
               </div>
            )}

            {activeSection !== 'general' && activeSection !== 'products' && (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{menuItems.find(m => m.id === activeSection)?.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 italic">Settings section coming soon...</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
