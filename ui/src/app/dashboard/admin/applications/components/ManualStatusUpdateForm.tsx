"use client";

import { Loader2 } from "lucide-react";

interface ManualStatusUpdateFormProps {
    manualAppCode: string;
    setManualAppCode: (code: string) => void;
    manualStatus: string;
    setManualStatus: (status: string) => void;
    manualUpdating: boolean;
    manualMessage: { type: 'success' | 'error', text: string } | null;
    onUpdate: () => void;
}

export default function ManualStatusUpdateForm({
    manualAppCode,
    setManualAppCode,
    manualStatus,
    setManualStatus,
    manualUpdating,
    manualMessage,
    onUpdate
}: ManualStatusUpdateFormProps) {
    return (
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-8">
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-6">Manual Status Update</h3>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-bold text-zinc-700 mb-2 text-center">Application Code</label>
                    <input
                        type="text"
                        placeholder="Enter application code (e.g., ABC123)"
                        className="w-full h-12 bg-white border border-zinc-100 rounded-2xl px-4 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                        value={manualAppCode}
                        onChange={(e) => setManualAppCode(e.target.value.toUpperCase())}
                        suppressHydrationWarning
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-bold text-zinc-700 mb-2 text-center">Set Status</label>
                    <select
                        className="w-full h-12 bg-white border border-zinc-100 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                        value={manualStatus}
                        onChange={(e) => setManualStatus(e.target.value)}
                        suppressHydrationWarning
                    >
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <button
                    onClick={onUpdate}
                    disabled={manualUpdating || !manualAppCode.trim()}
                    className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/20 disabled:cursor-not-allowed"
                    suppressHydrationWarning
                >
                    {manualUpdating ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                        </div>
                    ) : (
                        'Update Status'
                    )}
                </button>
            </div>

            {manualMessage && (
                <div className={`mt-4 p-4 rounded-2xl text-sm font-bold ${manualMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {manualMessage.text}
                </div>
            )}
        </div>
    );
}
