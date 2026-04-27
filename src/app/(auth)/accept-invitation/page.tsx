'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api/users';
import { ShieldCheck, User, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await usersApi.acceptInvitation(token, { displayName, avatarUrl });
      toast.success('Account set up successfully. Please log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error('This invitation has expired or is invalid. Please contact your administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl text-center">
           <ShieldCheck className="h-16 w-16 text-red-400 mx-auto mb-6" />
           <h1 className="text-2xl font-black text-gray-900 mb-2">Invalid Invitation</h1>
           <p className="text-gray-500">No invitation token was provided. Please check your email and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl">
        <div className="text-center mb-10">
           <div className="h-20 w-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
              <User className="h-10 w-10 text-white" />
           </div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Join the Team</h1>
           <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Complete your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Display Name</label>
              <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input
                   required
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                   placeholder="e.g. Alex Thompson"
                   value={displayName}
                   onChange={e => setDisplayName(e.target.value)}
                 />
              </div>
           </div>

           <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Avatar URL (Optional)</label>
              <div className="relative">
                 <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                   placeholder="https://..."
                   value={avatarUrl}
                   onChange={e => setAvatarUrl(e.target.value)}
                 />
              </div>
           </div>

           <button
             type="submit"
             disabled={isSubmitting}
             className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
           >
              {isSubmitting ? 'SETTING UP...' : 'SET UP MY ACCOUNT'}
           </button>
        </form>
      </div>
    </div>
  );
}
