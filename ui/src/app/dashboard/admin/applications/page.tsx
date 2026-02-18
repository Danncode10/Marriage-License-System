import { getAllApplications } from "./actions";
import {
    FileText,
    Search,
    Filter,
    ArrowUpDown,
    ChevronRight,
    Calendar,
    User,
    Clock,
    CheckCircle2,
    XCircle,
    Activity as ActivityIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Simple Activity mock for status distribution visualization
const StatusPulse = ({ className }: { className?: string }) => (
    <div className={className}>
        <div className="h-full w-full bg-current rounded-full animate-pulse opacity-20" />
    </div>
);

const STATUS_CONFIG: Record<string, { color: string, icon: any, bg: string }> = {
    pending: { color: "text-amber-600", icon: Clock, bg: "bg-amber-50" },
    processing: { color: "text-blue-600", icon: ActivityIcon, bg: "bg-blue-50" },
    completed: { color: "text-emerald-600", icon: CheckCircle2, bg: "bg-emerald-50" },
    finished: { color: "text-emerald-600", icon: CheckCircle2, bg: "bg-emerald-50" },
    rejected: { color: "text-red-600", icon: XCircle, bg: "bg-red-50" }
};

export default async function GlobalApplicationsPage() {
    const apps = await getAllApplications();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Global Oversight</h1>
                    <p className="text-zinc-500 font-medium mt-2">Monitoring all marriage license applications across the municipality.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Code or Citizen..."
                            className="h-12 w-[300px] bg-white border border-zinc-100 rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                        />
                    </div>
                </div>
            </div>

            {/* Application Master Table */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
                <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Master Directory</h2>
                    </div>
                    <div className="flex gap-2">
                        <button className="h-10 px-4 rounded-xl bg-white border border-zinc-100 text-zinc-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm">
                            <Filter className="h-3.5 w-3.5" />
                            Filter
                        </button>
                        <button className="h-10 px-4 rounded-xl bg-white border border-zinc-100 text-zinc-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            Sort
                        </button>
                    </div>
                </div>

                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse table-auto min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/10">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Application Info</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Citizen Pairing</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Submitted By</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {apps.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                            <Search className="h-10 w-10 text-zinc-200" />
                                        </div>
                                        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">No records found matching criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                apps.map((app) => {
                                    const config = STATUS_CONFIG[app.status?.toLowerCase()] || STATUS_CONFIG.pending;
                                    const StatusIcon = config.icon;

                                    return (
                                        <tr key={app.id} className="group hover:bg-zinc-50/50 transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="text-lg font-black text-zinc-900 tracking-tighter leading-none">{app.application_code}</p>
                                                    <div className="flex items-center gap-2 text-zinc-400">
                                                        <Calendar className="h-3 w-3" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 text-[9px] font-black text-blue-400 tracking-widest">GRM</div>
                                                        <span className="text-sm font-black text-zinc-800 tracking-tight">{app.groom_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 text-[9px] font-black text-pink-400 tracking-widest">BRD</div>
                                                        <span className="text-sm font-black text-zinc-800 tracking-tight">{app.bride_name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.color} border border-current/10 shadow-sm`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{app.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-sm">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-zinc-900 leading-none truncate max-w-[140px] uppercase tracking-tight">{app.submitted_by}</p>
                                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Registrant</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link href={`/dashboard/admin/applications/${app.id}`}>
                                                    <button className="h-11 w-11 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all shadow-sm active:scale-90">
                                                        <ChevronRight className="h-6 w-6" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
