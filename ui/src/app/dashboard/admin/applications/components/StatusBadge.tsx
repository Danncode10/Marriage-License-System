"use client";

import { Clock, CheckCircle2, XCircle } from "lucide-react";

export const STATUS_CONFIG: Record<string, { color: string; icon: any; bg: string; border: string; dot: string }> = {
    pending: { color: "text-amber-700", icon: Clock, bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400" },
    approved: { color: "text-emerald-700", icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-400" },
    completed: { color: "text-blue-700", icon: CheckCircle2, bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-400" },
    rejected: { color: "text-red-700", icon: XCircle, bg: "bg-red-50", border: "border-red-200", dot: "bg-red-400" },
    deleted: { color: "text-zinc-500", icon: Clock, bg: "bg-zinc-50", border: "border-zinc-200", dot: "bg-zinc-300" },
};

export const getStatusConfig = (status?: string) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.pending;
};

interface StatusBadgeProps {
    status?: string;
    className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const config = getStatusConfig(status);
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${config.bg} ${config.border} ${className}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{status || 'pending'}</span>
        </div>
    );
}
