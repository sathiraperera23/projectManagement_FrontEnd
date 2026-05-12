'use client';

import React, { useState } from 'react';
import {
  useRoles,
  useAllPermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions
} from '@/hooks/useAdmin';
import {
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Settings,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { PermissionGroups, type Role, type Permission } from '@/types/user';

export default function AdminRolesPage() {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(Object.keys(PermissionGroups));

  const { data: roles, isLoading: loadingRoles } = useRoles();
  const { data: permissions } = useAllPermissions();

  const selectedRole = roles?.find((r: Role) => r.id === selectedRoleId);

  const updatePermissionsMutation = useUpdateRolePermissions(selectedRoleId!);
  const deleteMutation = useDeleteRole();

  const [checkedPermissions, setCheckedPermissions] = useState<number[]>([]);

  React.useEffect(() => {
    if (selectedRole) {
      setCheckedPermissions(selectedRole.permissions.map(p => p.id));
    }
  }, [selectedRole]);

  const togglePermission = (id: number) => {
    setCheckedPermissions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSavePermissions = async () => {
    try {
      await updatePermissionsMutation.mutateAsync(checkedPermissions);
      toast.success('Permissions updated successfully');
    } catch {
      toast.error('Failed to update permissions');
    }
  };

  return (
    <div className="flex h-full gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Roles List (30%) */}
      <div className="w-80 shrink-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-black text-gray-900">Roles</h2>
           <button
             onClick={() => setIsCreateOpen(true)}
             className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
           >
              <Plus className="h-4 w-4" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
           {roles?.map((role: Role) => (
             <div
               key={role.id}
               onClick={() => setSelectedRoleId(role.id)}
               className={cn(
                 "p-4 rounded-2xl border cursor-pointer transition-all group",
                 selectedRoleId === role.id
                  ? "bg-white border-indigo-500 shadow-lg ring-1 ring-indigo-500"
                  : "bg-white border-gray-100 hover:border-indigo-200"
               )}
             >
                <div className="flex items-start justify-between mb-2">
                   <h3 className="font-black text-gray-900 leading-tight">{role.name}</h3>
                   <div className="flex gap-1">
                      {role.isSystem && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase">System</span>}
                      {role.isDefault && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase">Default</span>}
                   </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{role.description}</p>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{role.permissions.length} Permissions</span>
                   {!role.isSystem && (
                     <button
                       onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(role.id); }}
                       className="p-1.5 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                     >
                        <Trash2 className="h-3.5 w-3.5" />
                     </button>
                   )}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Permission Builder (70%) */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {selectedRole ? (
          <>
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
               <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedRole.name}</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">{selectedRole.description}</p>
               </div>
               <button
                 onClick={handleSavePermissions}
                 disabled={updatePermissionsMutation.isPending}
                 className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-black transition-all disabled:opacity-50"
               >
                  <ShieldCheck className="h-4 w-4" />
                  {updatePermissionsMutation.isPending ? 'SAVING...' : 'SAVE PERMISSIONS'}
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               {Object.entries(PermissionGroups).map(([group, permNames]) => (
                 <section key={group} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                       <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{group} Management</h3>
                       <button className="text-[10px] font-bold text-indigo-600 hover:underline">SELECT ALL</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {permNames.map(pName => {
                         const perm = permissions?.find((p: Permission) => p.name === pName);
                         if (!perm) return null;
                         return (
                           <label
                             key={perm.id}
                             className={cn(
                               "flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer group",
                               checkedPermissions.includes(perm.id) ? "bg-indigo-50/30 border-indigo-100" : "bg-white border-gray-50 hover:border-gray-200"
                             )}
                           >
                              <div className={cn(
                                "mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-all",
                                checkedPermissions.includes(perm.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
                              )}>
                                 {checkedPermissions.includes(perm.id) && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checkedPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                              />
                              <div>
                                 <p className="text-sm font-bold text-gray-900">{perm.displayName}</p>
                                 <p className="text-[10px] font-mono text-gray-400 mt-0.5">{perm.name}</p>
                              </div>
                           </label>
                         );
                       })}
                    </div>
                 </section>
               ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
             <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-10 w-10 text-indigo-400" />
             </div>
             <h3 className="text-xl font-black text-gray-900 mb-2">No Role Selected</h3>
             <p className="text-gray-500 max-w-xs">Select a security role from the left panel to configure its access permissions and properties.</p>
          </div>
        )}
      </div>
    </div>
  );
}
