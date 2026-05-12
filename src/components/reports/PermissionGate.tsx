'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { ShieldAlert } from 'lucide-react';

interface Props {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback }: Props) {
  const roles = useAuthStore((s) => s.user?.roles ?? []);

  const hasPermission =
    roles.includes('Administrator') ||
    roles.includes('Project Manager') ||
    roles.includes(permission);

  if (!hasPermission) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-gray-400 p-8 text-center">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
           <ShieldAlert className="h-10 w-10 text-red-400" />
        </div>
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-2">Access Restricted</h3>
        <p className="max-w-xs text-sm font-medium">You do not have the required permissions ({permission}) to view this secure data.</p>
      </div>
    );
  }

  return <>{children}</>;
}
