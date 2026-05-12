'use client';

import React from 'react';
import Link from 'next/link';
import { Bug } from 'lucide-react';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Portal Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/bug-report" className="flex items-center gap-2 group">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
               <Bug className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-gray-900 tracking-tight uppercase text-sm">Bug Submission Portal</span>
          </Link>

          <Link
            href="/login"
            className="text-xs font-bold text-gray-500 hover:text-indigo-600 uppercase tracking-widest transition-colors"
          >
            Internal Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[760px] w-full mx-auto px-4 py-12">
        {children}
      </main>

      {/* Portal Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
             Powered by {process.env.NEXT_PUBLIC_APP_NAME || 'Task Management System'}
           </p>
           <div className="mt-4 flex justify-center gap-6">
              <Link href="/bug-report/track" className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Track Submission</Link>
              <Link href="/login" className="text-[10px] font-bold text-gray-400 hover:underline uppercase tracking-widest">Support Login</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
