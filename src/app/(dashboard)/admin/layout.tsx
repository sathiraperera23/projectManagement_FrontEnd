'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Shield, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const roles = useAuthStore((s) => s.user?.roles ?? []);

  const hasAccess = roles.some(r => ['Administrator', 'Project Manager', 'MANAGE_USERS', 'MANAGE_ROLES'].includes(r));

  useEffect(() => {
    if (!hasAccess) {
      toast.error('You do not have access to the admin panel');
      router.replace('/my-tickets');
    }
  }, [hasAccess, router]);

  if (!hasAccess) return null;

  const navItems = [
    { id: 'users', label: 'Users & Invitations', href: '/admin/users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
    { id: 'settings', label: 'Global Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
         <span>Administration</span>
         <ChevronRight className="h-3 w-3" />
         <span className="text-gray-900">{navItems.find(n => pathname.startsWith(n.href))?.label || 'Overview'}</span>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Admin Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-1">
           {navItems.map((item) => {
             const isActive = pathname.startsWith(item.href);
             return (
               <Link
                 key={item.id}
                 href={item.href}
                 className={cn(
                   "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                   isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                 )}
               >
                 <item.icon className="h-4 w-4 shrink-0" />
                 <span>{item.label}</span>
               </Link>
             );
           })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-4 pb-20">
           {children}
        </div>
      </div>
    </div>
  );
}
