'use client';

import React, { useState } from 'react';
import {
  useUsers,
  useInvitations,
  useInviteUser,
  useDeactivateUser,
  useReactivateUser,
  useRevokeInvitation
} from '@/hooks/useAdmin';
import {
  Plus,
  Search,
  Mail,
  MoreVertical,
  ShieldCheck,
  UserX,
  UserCheck,
  Clock,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { User, UserInvitation } from '@/types/user';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: invitations, isLoading: loadingInvites } = useInvitations();

  const inviteMutation = useInviteUser();
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const revokeMutation = useRevokeInvitation();

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    try {
      await inviteMutation.mutateAsync({ email });
      setIsInviteModalOpen(false);
      toast.success(`Invitation sent to ${email}`);
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  const filteredUsers = users?.filter((u: User) =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">User Management</h1>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
           <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", activeTab === 'all' ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600")}
              >
                All Users ({users?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={cn("px-6 py-2 text-xs font-black uppercase rounded-lg transition-all", activeTab === 'pending' ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-600")}
              >
                Pending Invites ({invitations?.length || 0})
              </button>
           </div>
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name or email..."
                className="w-full pl-10 pr-4 py-2 text-xs border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1">
          {activeTab === 'all' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Provider</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Last Login</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-100">
                             {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : user.displayName.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900">{user.displayName}</p>
                             <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase">
                          {user.provider}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                         "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase",
                         user.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
                       )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", user.isActive ? "bg-emerald-500" : "bg-gray-400")} />
                          {user.isActive ? 'Active' : 'Deactivated'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                       {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                             <ExternalLink className="h-4 w-4" />
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={() => deactivateMutation.mutate(user.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                               <UserX className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivateMutation.mutate(user.id)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            >
                               <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Invited Email</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Invited By</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Expires</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invitations?.map((invite: UserInvitation) => (
                  <tr key={invite.id} className="hover:bg-gray-50/30">
                    <td className="px-6 py-4 flex items-center gap-3">
                       <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Mail className="h-4 w-4" /></div>
                       <span className="text-sm font-bold text-gray-900">{invite.email}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{invite.invitedByName}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDateTime(invite.expiresAt)}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button
                         onClick={() => revokeMutation.mutate(invite.id)}
                         className="px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                          Revoke
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-gray-900">Invite New User</h3>
                 <button onClick={() => setIsInviteModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleInvite} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input name="email" type="email" required className="w-full rounded-xl border-gray-200 px-4 py-3 text-sm font-bold" placeholder="user@organization.com" />
                 </div>
                 <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                    SEND INVITATION
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* User Detail Slide-over */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
           <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                 <div className="p-8 border-b flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900">User Details</h2>
                    <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="h-6 w-6" /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    <div className="flex flex-col items-center text-center">
                       <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-3xl font-black text-indigo-600 border-4 border-white shadow-xl mb-4">
                          {selectedUser.avatarUrl ? <img src={selectedUser.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : selectedUser.displayName.charAt(0)}
                       </div>
                       <h3 className="text-2xl font-black text-gray-900">{selectedUser.displayName}</h3>
                       <p className="text-gray-400 font-bold">{selectedUser.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                          <p className="text-sm font-bold text-gray-700">{formatDate(selectedUser.createdAt)}</p>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Provider</p>
                          <p className="text-sm font-bold text-gray-700">{selectedUser.provider}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-2">Financial Rates</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Hourly Rate ($)</label>
                             <input type="number" className="w-full rounded-xl border-gray-200 py-2 font-bold" defaultValue={selectedUser.hourlyRate || 0} />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Daily Rate ($)</label>
                             <input type="number" className="w-full rounded-xl border-gray-200 py-2 font-bold" defaultValue={selectedUser.dailyRate || 0} />
                          </div>
                       </div>
                    </div>

                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">
                       UPDATE USER PROFILE
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
