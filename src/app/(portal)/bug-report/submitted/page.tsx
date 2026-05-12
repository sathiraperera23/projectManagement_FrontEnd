'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, RefreshCw, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BugSubmittedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticketNumber = searchParams.get('ticketNumber');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!ticketNumber) {
      router.replace('/bug-report');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push(`/bug-report/track?ticketNumber=${ticketNumber}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ticketNumber, router]);

  if (!ticketNumber) return null;

  return (
    <div className="flex flex-col items-center text-center py-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-50">
         <CheckCircle2 className="h-12 w-12 text-emerald-600" />
      </div>

      <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bug Report Submitted</h1>
      <p className="mt-4 text-gray-500 font-medium text-lg max-w-md">Thank you for your report. We have received it and will review it shortly.</p>

      <div className="mt-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-2xl w-full max-w-sm">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Your Ticket Number</p>
         <div className="text-4xl font-black text-indigo-600 tracking-tighter mb-4">{ticketNumber}</div>
         <p className="text-xs text-gray-500 font-medium leading-relaxed">Please save this ticket number. You can use it to track the status of your report at any time.</p>
      </div>

      <div className="mt-12 flex flex-col gap-4 w-full max-w-sm">
         <Link
          href={`/bug-report/track?ticketNumber=${ticketNumber}`}
          className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
         >
            TRACK MY TICKET
            <ArrowRight className="h-4 w-4" />
         </Link>
         <Link
          href="/bug-report"
          className="flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all"
         >
            <RefreshCw className="h-4 w-4" />
            SUBMIT ANOTHER REPORT
         </Link>
      </div>

      <div className="mt-12 flex items-center gap-2 text-gray-400">
         <Clock className="h-4 w-4" />
         <p className="text-xs font-bold uppercase tracking-widest">Auto-redirecting to tracker in {countdown}s</p>
      </div>
    </div>
  );
}
