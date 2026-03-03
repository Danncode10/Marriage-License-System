"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    applicationCode: string;
}

export default function DeleteApplicationModal({
    isOpen,
    onClose,
    onConfirm,
    applicationCode
}: DeleteApplicationModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmCode, setConfirmCode] = useState("");

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (confirmCode !== applicationCode) return;

        setIsDeleting(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Failed to delete application:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                    <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                        <Trash2 className="h-7 w-7" />
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center transition-all"
                    >
                        <X className="h-5 w-5 text-zinc-400" />
                    </button>
                </div>

                <div className="p-8 pt-6 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Delete Application</h2>
                        <p className="text-zinc-500 font-medium leading-relaxed">
                            This action is <span className="text-rose-600 font-bold">permanent</span> and cannot be undone. All data associated with <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-900 font-bold tracking-tight">#{applicationCode}</span> will be purged.
                        </p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-black text-amber-800 uppercase tracking-widest">System Warning</p>
                            <p className="text-[11px] text-amber-700 font-semibold leading-normal">
                                This includes applicants information, residence data, attached photos, and audit logs.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block ml-1">
                            Type <span className="text-zinc-900">{applicationCode}</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmCode}
                            onChange={(e) => setConfirmCode(e.target.value)}
                            placeholder="Enter Code"
                            className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 font-bold text-center tracking-widest placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 transition-all uppercase"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleConfirm}
                            disabled={confirmCode !== applicationCode || isDeleting}
                            className={`h-14 w-full rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${confirmCode === applicationCode && !isDeleting
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                                : 'bg-zinc-100 text-zinc-300 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Purging Records...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-5 w-5" />
                                    Delete Permanently
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="h-14 w-full bg-white hover:bg-zinc-50 text-zinc-500 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
