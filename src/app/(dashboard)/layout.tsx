'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  BarChart2,
  Bell,
  Settings,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Ticket
} from 'lucide-react';

const navigation = [
  { name: 'My Tickets', href: '/my-tickets', icon: Ticket },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

const adminNavigation = [
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Roles', href: '/admin/roles', icon: ShieldCheck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  const isAdmin = user?.roles.includes('Admin');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-900">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold text-white">TMS</span>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  pathname === item.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center rounded-md px-2 py-2 text-base font-medium'
                )}
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <>
                <div className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Admin
                </div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'group flex items-center rounded-md px-2 py-2 text-base font-medium'
                    )}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
          <div className="flex h-16 items-center bg-gray-900 px-4">
            <span className="text-xl font-bold text-white">TMS</span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <div className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Admin
                  </div>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          <button
            className="text-gray-500 focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-end">
            <div className="flex items-center gap-4">
              <button className="relative p-1 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden text-right lg:block">
                  <p className="text-sm font-medium text-gray-700">{user?.displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                    {user?.displayName?.charAt(0)}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
