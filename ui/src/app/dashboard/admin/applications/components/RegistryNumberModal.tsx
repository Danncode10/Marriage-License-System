"use client";

import { X, Loader2, Clipboard, AlertCircle } from "lucide-react";
import { useState } from "react";

interface RegistryNumberModalProps {
    app: any;
    onClose: () => void;
    onUpdate: (appId: string, registryCode: string) => Promise<{ success: boolean; error?: string; registryNumber?: string }>;
}

export default function RegistryNumberModal({
    app,
    onClose,
    onUpdate
}: RegistryNumberModalProps) {
    const [registryCode, setRegistryCode] = useState(() => {
        if (app?.registry_number) {
            const parts = app.registry_number.split('-');
            if (parts.length === 2) {
                return parts[1];
            }
        }
        return "";
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!app) return null;

    const currentYear = new Date().getFullYear();

    const handleUpdate = async () => {
        if (!registryCode.trim()) {
            setMessage({ type: 'error', text: "Please enter a registry code." });
            return;
        }

        setIsUpdating(true);
        setMessage(null);

        try {
            const result = await onUpdate(app.id, registryCode);
            if (result.success) {
                setMessage({ type: 'success', text: `Successfully updated registry number to ${result.registryNumber}.` });
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setMessage({ type: 'error', text: result.error || "Failed to update registry number." });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "An unexpected error occurred." });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 transform transition-all duration-300 animate-in fade-in zoom-in-95"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                            <Clipboard className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Registry Number</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all active:scale-90"
                    >
                        <X className="h-5 w-5 text-zinc-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {!app.has_photo && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-rose-800 uppercase tracking-tight">Photo Required</p>
                                <p className="text-[10px] text-rose-600 font-bold leading-tight mt-0.5">
                                    Capture the couple's photo first before assigning a registry number.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Application</p>
                        <p className="text-sm font-bold text-zinc-900">{app.application_code}</p>
                        <div className="h-px bg-zinc-200 my-3" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Applicants</p>
                        <p className="text-sm font-bold text-zinc-900 truncate">
                            {app.groom_name} & {app.bride_name}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1 text-center font-outfit">Registry Code</label>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="01"
                                value={registryCode}
                                onChange={(e) => setRegistryCode(e.target.value)}
                                disabled={!app.has_photo}
                                className="w-full h-16 bg-zinc-50 border-2 border-zinc-100 rounded-3xl px-6 text-center text-xl font-black focus:outline-none focus:ring-8 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all shadow-sm text-zinc-900 placeholder:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                autoFocus
                            />
                        </div>
                        <div className="mt-6 p-4 rounded-3xl bg-zinc-50 border border-dashed border-zinc-200 text-center">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Final Registry Number</p>
                            <p className="text-2xl font-black text-zinc-900 tracking-tight">
                                <span className="text-zinc-400">{currentYear}-</span>{registryCode || "00"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating || !registryCode.trim() || !app.has_photo}
                        className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-900/10 disabled:cursor-not-allowed group"
                    >
                        {isUpdating ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            <span className="group-active:scale-95 transition-transform">Complete Registration</span>
                        )}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-2 duration-300 ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
