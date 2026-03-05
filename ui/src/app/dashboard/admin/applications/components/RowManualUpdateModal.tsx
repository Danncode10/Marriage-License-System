"use client";

import { X, Loader2, AlertCircle } from "lucide-react";

interface RowManualUpdateModalProps {
    rowManualApp: any;
    rowManualStatus: string;
    setRowManualStatus: (status: string) => void;
    rowManualUpdating: boolean;
    rowManualMessage: { type: 'success' | 'error', text: string } | null;
    onClose: () => void;
    onUpdate: () => void;
}

export default function RowManualUpdateModal({
    rowManualApp,
    rowManualStatus,
    setRowManualStatus,
    rowManualUpdating,
    rowManualMessage,
    onClose,
    onUpdate
}: RowManualUpdateModalProps) {
    if (!rowManualApp) return null;

    const isMissingPhoto = rowManualStatus === "approved" && !rowManualApp.has_photo;
    const isMissingRegistry = rowManualStatus === "completed" && !rowManualApp.registry_number;
    const isDisabled = rowManualUpdating || isMissingPhoto || isMissingRegistry;

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight font-outfit">Status Update</h3>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all"
                    >
                        <X className="h-4 w-4 text-zinc-600" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mb-2">
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Application Code</label>
                        <p className="text-sm font-bold text-zinc-900">{rowManualApp.application_code}</p>
                        <div className="h-px bg-zinc-200 my-2" />
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Groom & Bride</label>
                        <p className="text-xs font-bold text-zinc-600 truncate">
                            {rowManualApp.groom_name} & {rowManualApp.bride_name}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Select New Status</label>
                        <select
                            className="w-full h-12 bg-white border border-zinc-100 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                            value={rowManualStatus}
                            onChange={(e) => setRowManualStatus(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {isMissingPhoto && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-rose-700 leading-tight">
                                Cannot approve: Photo required. Please capture photo first.
                            </p>
                        </div>
                    )}

                    {isMissingRegistry && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-rose-700 leading-tight">
                                Cannot complete: Registry Number required. Please assign one first.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={onUpdate}
                        disabled={isDisabled}
                        className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-900/10 disabled:cursor-not-allowed mt-4"
                    >
                        {rowManualUpdating ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating...
                            </div>
                        ) : (
                            'Confirm Status Update'
                        )}
                    </button>

                    {rowManualMessage && (
                        <div className={`mt-4 p-4 rounded-2xl text-sm font-bold ${rowManualMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {rowManualMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
