"use client";

import { ShieldAlert, X, Lock } from "lucide-react";

interface AdminOnlyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminOnlyModal({
    isOpen,
    onClose
}: AdminOnlyModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-300 relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start relative z-10">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <div className="relative">
                            <ShieldAlert className="h-8 w-8" />
                            <Lock className="h-4 w-4 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center transition-all active:scale-90"
                    >
                        <X className="h-5 w-5 text-zinc-400" />
                    </button>
                </div>

                <div className="p-8 pt-6 space-y-6 relative z-10">
                    <div className="space-y-2 text-center sm:text-left">
                        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none">Restricted Access</h2>
                        <p className="text-zinc-500 font-medium leading-relaxed">
                            Only <span className="text-amber-600 font-bold px-1.5 py-0.5 bg-amber-50 rounded-lg">ADMIN</span> roles have the authority to delete marriage applications from the master directory.
                        </p>
                    </div>

                    <div className="p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100">
                        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest text-center leading-tight">
                            Please contact your system administrator if you believe this is an error.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="h-14 w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
                    >
                        Understood
                    </button>
                </div>
            </div>
        </div>
    );
}
