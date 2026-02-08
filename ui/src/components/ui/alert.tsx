"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
    message: string;
    type?: "error" | "success" | "info";
    className?: string;
    onClose?: () => void;
}

export function Alert({ message, type = "info", className, onClose }: AlertProps) {
    if (!message) return null;

    const variants = {
        error: "bg-red-50 text-red-800 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20",
        success: "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20",
        info: "bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20",
    };

    const icons = {
        error: <AlertCircle className="h-4 w-4" />,
        success: <CheckCircle2 className="h-4 w-4" />,
        info: <AlertCircle className="h-4 w-4" />, // Simplified
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "flex w-full gap-3 rounded-xl border p-4 text-sm font-medium items-center",
                variants[type],
                className
            )}
        >
            <div className="shrink-0">{icons[type]}</div>
            <p className="flex-1">{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    className="shrink-0 hover:opacity-70 transition-opacity"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </motion.div>
    );
}
