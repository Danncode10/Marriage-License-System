"use client";

import { Calendar, User, Search, RefreshCw, FileText } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { ActionDropdown } from "./ApplicationActions";

interface ApplicationTableProps {
    filtered: any[];
    onView: (app: any) => void;
    onDownloadExcel: (app: any) => void;
    onManualUpdate: (app: any) => void;
    onRegistry: (app: any) => void;
    updatingId: string | null;
    downloadingId: string | null;
    onDelete: (app: any) => void;
    onRestore: (appId: string) => void;
    onRefresh: () => void;
}

export default function ApplicationTable({
    filtered,
    onView,
    onDownloadExcel,
    onManualUpdate,
    onRegistry,
    updatingId,
    downloadingId,
    onDelete,
    onRestore,
    onRefresh
}: ApplicationTableProps) {
    return (
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
            <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                        <FileText className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Master Directory</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onRefresh}
                        className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
                        title="Refresh Applications"
                        suppressHydrationWarning
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filtered.length} records</span>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4 p-4">
                {filtered.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Search className="h-10 w-10 text-zinc-200" />
                        </div>
                        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">No records found</p>
                    </div>
                ) : (
                    filtered.map((app) => (
                        <div key={app.id} className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-xl font-black text-zinc-900 tracking-tighter leading-none">{app.application_code}</p>
                                    <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-blue-400 tracking-widest w-8">GRM</span>
                                    <span className="text-sm font-bold text-zinc-800">{app.groom_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-pink-400 tracking-widest w-8">BRD</span>
                                    <span className="text-sm font-bold text-zinc-800">{app.bride_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-zinc-400" />
                                    <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">{app.submitted_by}</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-2">
                                <ActionDropdown
                                    app={app}
                                    onView={() => onView(app)}
                                    onDownloadExcel={onDownloadExcel}
                                    onManualUpdate={onManualUpdate}
                                    onRegistry={onRegistry}
                                    onDelete={onDelete}
                                    onRestore={onRestore}
                                    isUpdating={updatingId === app.id}
                                    isDownloading={downloadingId === app.id}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto min-w-[900px]">
                    <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/10">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Application Info</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Citizen Pairing</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Status</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Submitted By</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                        <Search className="h-10 w-10 text-zinc-200" />
                                    </div>
                                    <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">No records found</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((app) => (
                                <tr key={app.id} className="group hover:bg-zinc-50/40 transition-all duration-200">
                                    <td className="px-8 py-6">
                                        <p className="text-lg font-black text-zinc-900 tracking-tighter leading-none">{app.application_code}</p>
                                        <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-blue-400 tracking-widest w-7">GRM</span>
                                                <span className="text-sm font-bold text-zinc-800">{app.groom_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-pink-400 tracking-widest w-7">BRD</span>
                                                <span className="text-sm font-bold text-zinc-800">{app.bride_name}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-6">
                                        <StatusBadge status={app.status} />
                                    </td>

                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <p className="text-xs font-black text-zinc-900 truncate max-w-[130px] uppercase tracking-tight">{app.submitted_by}</p>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6">
                                        <ActionDropdown
                                            app={app}
                                            onView={() => onView(app)}
                                            onDownloadExcel={onDownloadExcel}
                                            onManualUpdate={onManualUpdate}
                                            onRegistry={onRegistry}
                                            onDelete={onDelete}
                                            onRestore={onRestore}
                                            isUpdating={updatingId === app.id}
                                            isDownloading={downloadingId === app.id}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
