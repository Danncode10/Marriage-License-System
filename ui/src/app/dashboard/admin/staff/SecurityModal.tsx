"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<{ success: boolean; error?: string }>;
    title: string;
    description: string;
    confirmText: string;
    variant?: "default" | "destructive";
}

export function SecurityModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    variant = "default"
}: SecurityModalProps) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!password) {
            setError("Password is required");
            return;
        }

        setLoading(true);
        setError(null);

        const result = await onConfirm(password);

        if (result.success) {
            setPassword("");
            onClose();
        } else {
            setError(result.error || "Verification failed");
        }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className={`h-16 w-16 rounded-[1.5rem] ${variant === 'destructive' ? 'bg-red-50 text-red-600' : 'bg-zinc-900 text-white'} flex items-center justify-center mb-4 shadow-xl`}>
                                    <ShieldAlert className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">{title}</h2>
                                <p className="text-sm font-medium text-zinc-500 mt-2">{description}</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Admin Password Required</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                            className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-tight flex items-center gap-2 animate-in shake duration-300">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={loading}
                                        className={`flex-1 h-14 rounded-[1.25rem] font-black uppercase tracking-widest text-xs ${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="h-14 px-8 rounded-[1.25rem] font-black uppercase tracking-widest text-xs text-zinc-400"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
