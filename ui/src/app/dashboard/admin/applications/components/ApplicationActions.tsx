"use client";

import { Eye, FileDown, MoreHorizontal, Loader2, Trash2 } from "lucide-react";

interface ActionDropdownProps {
    app: any;
    onView: () => void;
    onDownloadExcel: (app: any) => void;
    onManualUpdate: (app: any) => void;
    onDelete?: (app: any) => void;
    isUpdating: boolean;
    isDownloading: boolean;
}

export function ActionDropdown({
    app,
    onView,
    onDownloadExcel,
    onManualUpdate,
    onDelete,
    isUpdating,
    isDownloading,
}: ActionDropdownProps) {
    return (
        <div className="flex items-center gap-2 justify-center">
            <button
                title="View Details"
                onClick={onView}
                className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
                suppressHydrationWarning
            >
                <Eye className="h-4 w-4" />
            </button>

            <button
                title="Download Excel"
                onClick={() => onDownloadExcel(app)}
                disabled={isDownloading}
                className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
            >
                {isDownloading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <FileDown className="h-4 w-4" />
                }
            </button>

            <button
                title="Manual Status Update"
                onClick={() => onManualUpdate(app)}
                className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
                suppressHydrationWarning
            >
                {isUpdating
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <MoreHorizontal className="h-4 w-4" />
                }
            </button>

            {onDelete && (
                <button
                    title="Delete Application"
                    onClick={() => onDelete(app)}
                    className="h-9 w-9 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
                    suppressHydrationWarning
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

export function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-zinc-900">{value ?? <span className="italic text-zinc-300">N/A</span>}</p>
        </div>
    );
}
