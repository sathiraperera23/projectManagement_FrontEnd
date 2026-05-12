'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Bell,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Copy,
  Bug
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);

  const navItems = [
    { name: 'My Tickets', href: '/my-tickets', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  const isAdmin = user?.roles.some(r => ['Administrator', 'Project Manager'].includes(r));

  const copyPortalLink = () => {
    const url = `${window.location.origin}/bug-report`;
    navigator.clipboard.writeText(url);
    toast.success('Portal link copied');
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 h-16 flex items-center justify-between">
         {!isCollapsed && <span className="text-xl font-black tracking-tighter text-indigo-600">TMS PRO</span>}
         <button onClick={onToggle} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
         </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all",
                isActive
                 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                 : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin/users"
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all mt-8",
              pathname.startsWith('/admin')
               ? "bg-gray-900 text-white"
               : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Administration</span>}
          </Link>
        )}
      </nav>

      {/* Share Portal Link */}
      <div className="p-4 border-t border-gray-50">
         <div className={cn(
           "bg-indigo-50/50 rounded-2xl p-4 flex flex-col gap-3",
           isCollapsed && "items-center"
         )}>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                 <Bug className="h-4 w-4 text-indigo-600" />
                 <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Share Portal</span>
              </div>
            )}
            <button
              onClick={copyPortalLink}
              className={cn(
                "flex items-center justify-center gap-2 bg-white border border-indigo-100 rounded-xl py-2 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm",
                isCollapsed ? "px-2" : "px-4 w-full"
              )}
            >
               <Copy className="h-4 w-4" />
               {!isCollapsed && <span className="text-xs font-bold uppercase tracking-tighter">Copy Link</span>}
            </button>
         </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600">
                 {user?.displayName.charAt(0)}
              </div>
              <div className="min-w-0">
                 <p className="text-xs font-bold text-gray-900 truncate">{user?.displayName}</p>
                 <p className="text-[10px] text-gray-400 font-bold truncate">{user?.email}</p>
              </div>
           </div>
        </div>
      )}
    </aside>
  );
}
