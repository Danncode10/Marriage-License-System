import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Users,
    ShieldCheck,
    Activity,
    FileText,
    Clock,
    ArrowUpRight,
    Search,
    Bell,
    CheckCircle2,
    AlertCircle,
    LayoutDashboard,
    ArrowRight
} from "lucide-react";
import { getAdminMetrics } from "./metrics";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const metrics = await getAdminMetrics();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-100/50">
                <div>
                    <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-[0.8] mb-4">
                        Control <span className="text-zinc-400">Center</span>
                    </h1>
                    <p className="text-zinc-500 font-medium flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        System-wide overview for <span className="text-zinc-900 font-bold">{user.email}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-zinc-400 relative">
                        <Bell className="h-5 w-5" />
                        <div className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                    </div>
                    <Link href="/dashboard/admin/staff">
                        <button className="h-12 px-6 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
                            Configure System
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Residents", value: metrics.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50/50" },
                    { label: "Staff Officers", value: metrics.totalStaff, icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50/50" },
                    { label: "Pending Apps", value: metrics.applicationStats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50/50" },
                    { label: "Completed", value: metrics.applicationStats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50/50" }
                ].map((stat, i) => (
                    <div key={i} className="group bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 hover:scale-[1.02] transition-all duration-500">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`h-14 w-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:rotate-6`}>
                                <stat.icon className={`h-7 w-7 ${stat.color}`} />
                            </div>
                            <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Application Funnel */}
                <div className="lg:col-span-2 bg-zinc-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-150 duration-1000" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Application Pipeline</h2>
                                <p className="text-zinc-400 text-sm font-medium">Visualizing workflow health and bottlenecks</p>
                            </div>
                            <Badge className="bg-white/10 text-white border-white/20 px-3 py-1 font-black uppercase text-[10px]">Active Session</Badge>
                        </div>

                        <div className="space-y-8">
                            {[
                                { status: "Pending Verification", count: metrics.applicationStats.pending, color: "bg-amber-400", total: metrics.applicationStats.total },
                                { status: "Under Review", count: metrics.applicationStats.processing, color: "bg-blue-400", total: metrics.applicationStats.total },
                                { status: "Approved & Issued", count: metrics.applicationStats.completed, color: "bg-emerald-400", total: metrics.applicationStats.total }
                            ].map((row, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">{row.status}</p>
                                        <p className="text-xl font-black tracking-tighter tabular-nums">{row.count}</p>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${row.color} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${row.total > 0 ? (row.count / row.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex gap-4">
                            <button className="flex-1 h-14 bg-white text-zinc-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-100 transition-colors shadow-xl">
                                Detailed Analysis
                            </button>
                            <button className="flex-1 h-14 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-700 transition-colors">
                                Export KPI Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Logs */}
                <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900">Live Logs</h2>
                        <div className="h-8 w-8 rounded-xl bg-zinc-50 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-zinc-400" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {metrics.recentActivity.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-zinc-400 text-xs font-bold uppercase">No recent activity</p>
                            </div>
                        ) : (
                            metrics.recentActivity.map((log) => (
                                <div key={log.id} className="flex gap-4 group">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{log.action}</p>
                                        <p className="text-[10px] font-medium text-zinc-500 leading-tight">
                                            Handled by <span className="text-zinc-900 font-bold">{log.user_name}</span>
                                        </p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link href="/dashboard/admin/audit">
                        <button className="w-full h-14 mt-10 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:border-zinc-900 hover:text-zinc-900 transition-all">
                            View Security Audit
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
