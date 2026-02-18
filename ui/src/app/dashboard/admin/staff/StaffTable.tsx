"use client";

import { useState } from "react";
import {
    Mail,
    IdCard,
    FileCheck,
    Users,
    Trash2,
    ArrowUpCircle,
    ArrowDownCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { secureUpdateStaff, secureDeleteStaff } from "./actions";
import { SecurityModal } from "./SecurityModal";

interface StaffMember {
    id: string;
    full_name: string;
    email: string;
    role: string;
    employee_id: string;
    processed_applications: number;
    updated_at: string;
}

export function StaffTable({ initialStaff }: { initialStaff: any[] }) {
    const [staff, setStaff] = useState(initialStaff);
    const [securityConfig, setSecurityConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmText: string;
        variant: "default" | "destructive";
        onConfirm: (pass: string) => Promise<{ success: boolean; error?: string }>;
    }>({
        isOpen: false,
        title: "",
        description: "",
        confirmText: "",
        variant: "default",
        onConfirm: async () => ({ success: false })
    });

    const triggerUpdateRole = (member: StaffMember) => {
        const isCurrentlyAdmin = member.role === 'admin';
        const targetRole = isCurrentlyAdmin ? 'employee' : 'admin';

        setSecurityConfig({
            isOpen: true,
            title: isCurrentlyAdmin ? "Demote to Employee" : "Promote to Admin",
            description: `You are about to change ${member.full_name}'s role to ${targetRole}. Please confirm your identity.`,
            confirmText: `Confirm ${targetRole}`,
            variant: "default",
            onConfirm: async (password: string) => {
                const result = await secureUpdateStaff(password, member.id, targetRole);
                if (result.success) {
                    setStaff(prev => prev.map(s => s.id === member.id ? { ...s, role: targetRole } : s));
                }
                return result;
            }
        });
    };

    const triggerDelete = (member: StaffMember) => {
        setSecurityConfig({
            isOpen: true,
            title: "Delete Employee",
            description: `Permanently remove ${member.full_name} from the system. This action cannot be undone.`,
            confirmText: "Delete Permanently",
            variant: "destructive",
            onConfirm: async (password: string) => {
                const result = await secureDeleteStaff(password, member.id);
                if (result.success) {
                    setStaff(prev => prev.filter(s => s.id !== member.id));
                }
                return result;
            }
        });
    };

    if (staff.length === 0) {
        return (
            <div className="p-20 text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-zinc-300" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase">No Staff Found</h3>
                <p className="text-zinc-500 font-medium max-w-xs mx-auto mt-2">Start by onboarding your first employee to manage applications.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <SecurityModal
                {...securityConfig}
                onClose={() => setSecurityConfig(prev => ({ ...prev, isOpen: false }))}
            />

            <table className="w-full text-left border-collapse table-fixed">
                <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/30">
                        <th className="w-[40%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Employee</th>
                        <th className="w-[20%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">ID / Role</th>
                        <th className="w-[20%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Performance</th>
                        <th className="w-[20%] pr-12 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {staff.map((member) => (
                        <tr key={member.id} className="group hover:bg-zinc-50/50 transition-colors">
                            <td className="px-8 py-6 truncate">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-zinc-200/50 transition-transform group-hover:scale-105">
                                        {member.full_name?.substring(0, 1) || 'S'}
                                    </div>
                                    <div className="truncate">
                                        <p className="font-black text-zinc-900 uppercase tracking-tight leading-tight truncate">{member.full_name || 'Unnamed Staff'}</p>
                                        <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            <span className="text-[11px] font-bold tracking-tight truncate">{member.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-6 truncate">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <IdCard className="h-3.5 w-3.5 text-zinc-400" />
                                        <span className="text-xs font-black text-zinc-600 tracking-tight">{member.employee_id || 'NOT-ASSIGNED'}</span>
                                    </div>
                                    <Badge className={member.role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-100 px-2 py-0 text-[10px] font-black uppercase tracking-wider" : "bg-blue-50 text-blue-700 border-blue-100 px-2 py-0 text-[10px] font-black uppercase tracking-wider"}>
                                        {member.role}
                                    </Badge>
                                </div>
                            </td>
                            <td className="px-6 py-6 truncate">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                        <FileCheck className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-zinc-900 tabular-nums leading-none tracking-tight">{member.processed_applications}</p>
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Processed</p>
                                    </div>
                                </div>
                            </td>
                            <td className="pr-12 py-6 text-right">
                                <div className="flex justify-end items-center gap-3">
                                    <button
                                        onClick={() => triggerUpdateRole(member)}
                                        title={member.role === 'admin' ? 'Demote to Employee' : 'Promote to Admin'}
                                        className="h-10 w-10 rounded-xl bg-zinc-50 hover:bg-zinc-900 hover:text-white flex items-center justify-center text-zinc-400 transition-all shadow-sm active:scale-90"
                                    >
                                        {member.role === 'admin' ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                                    </button>
                                    <button
                                        onClick={() => triggerDelete(member)}
                                        title="Delete Employee"
                                        className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white flex items-center justify-center text-red-500 transition-all shadow-sm active:scale-90"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
