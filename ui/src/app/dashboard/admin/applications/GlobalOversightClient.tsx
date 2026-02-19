"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FileText, Search, Calendar, User, Clock,
    CheckCircle2, XCircle, Eye, X, MoreHorizontal,
    Loader2, ChevronLeft, ChevronRight, FileDown
} from "lucide-react";
import { updateApplicationStatus } from "./actions";
import PhotoCaptureModal from "@/components/PhotoCaptureModal";

const STATUS_CONFIG: Record<string, { color: string; icon: any; bg: string; border: string; dot: string }> = {
    pending: { color: "text-amber-700", icon: Clock, bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400" },
    approved: { color: "text-emerald-700", icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-400" },
    completed: { color: "text-blue-700", icon: CheckCircle2, bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-400" },
    rejected: { color: "text-red-700", icon: XCircle, bg: "bg-red-50", border: "border-red-200", dot: "bg-red-400" },
};

const STATUS_ACTIONS = [
    { value: "pending", label: "Set as Pending", dot: "bg-amber-400", hover: "hover:bg-amber-50" },
    { value: "approved", label: "Set as Approved", dot: "bg-emerald-400", hover: "hover:bg-emerald-50" },
    { value: "completed", label: "Set as Completed", dot: "bg-blue-400", hover: "hover:bg-blue-50" },
    { value: "rejected", label: "Set as Rejected", dot: "bg-red-400", hover: "hover:bg-red-50" },
];

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-zinc-900">{value ?? <span className="italic text-zinc-300">N/A</span>}</p>
        </div>
    );
}

// ── Per-row action buttons: Eye + Document + Horizontal-dots manual update ────────────
function ActionDropdown({
    app,
    onView,
    onDownloadExcel,
    onManualUpdate,
    isUpdating,
}: {
    app: any;
    onView: () => void;
    onDownloadExcel: (app: any) => void;
    onManualUpdate: (app: any) => void;
    isUpdating: boolean;
}) {
    return (
        <div className="flex items-center gap-2 justify-center">
            {/* Eye — View Details */}
            <button
                title="View Details"
                onClick={onView}
                className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
            >
                <Eye className="h-4 w-4" />
            </button>

            {/* Document — Download Excel */}
            <button
                title="Download Excel"
                onClick={() => onDownloadExcel(app)}
                className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
            >
                <FileDown className="h-4 w-4" />
            </button>

            {/* Horizontal dots — Manual Update (opens modal with code auto-detected) */}
            <button
                title="Manual Status Update"
                onClick={() => onManualUpdate(app)}
                className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
            >
                {isUpdating
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <MoreHorizontal className="h-4 w-4" />
                }
            </button>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function GlobalOversightClient({
    apps: initialApps,
    totalCount,
    totalPages,
    currentPage,
    limit
}: {
    apps: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}) {
    const router = useRouter();
    const [apps, setApps] = useState<any[]>(initialApps);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Manual status update form state
    const [manualAppCode, setManualAppCode] = useState("");
    const [manualStatus, setManualStatus] = useState("approved");
    const [manualUpdating, setManualUpdating] = useState(false);
    const [manualMessage, setManualMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Row-based manual update modal state
    const [rowManualApp, setRowManualApp] = useState<any | null>(null);
    const [rowManualStatus, setRowManualStatus] = useState("approved");
    const [rowManualUpdating, setRowManualUpdating] = useState(false);
    const [rowManualMessage, setRowManualMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Photo capture modal state
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    async function handleStatusChange(appCode: string, newStatus: string) {
        console.log("UI: handleStatusChange called with:", { appCode, newStatus });

        // Find the application by application_code (like the manual form)
        const appToUpdate = apps.find(app => app.application_code?.toUpperCase() === appCode.toUpperCase());
        if (!appToUpdate) {
            console.error("Application not found with code:", appCode);
            alert("Application not found");
            return;
        }

        console.log("UI: Found application with id:", appToUpdate.id);
        setUpdatingId(appToUpdate.id);

        try {
            console.log("UI: Calling updateApplicationStatus...");
            const result = await updateApplicationStatus(appToUpdate.id, newStatus);
            console.log("UI: updateApplicationStatus result:", result);
            if (result.success) {
                console.log("UI: Update successful, updating local state");
                setApps(prev => prev.map(a => a.id === appToUpdate.id ? { ...a, status: newStatus } : a));
                if (selectedApp?.id === appToUpdate.id) setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
            } else {
                console.error("Failed to update status:", result.error);
                alert(`Failed to update status: ${result.error}`);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred while updating the status");
        }
        setUpdatingId(null);
    }

    async function handleManualStatusUpdate() {
        if (!manualAppCode.trim()) return;

        setManualUpdating(true);
        setManualMessage(null);

        try {
            // Find the application by code
            const appToUpdate = apps.find(app => app.application_code?.toUpperCase() === manualAppCode.toUpperCase());

            if (!appToUpdate) {
                setManualMessage({ type: 'error', text: `Application with code "${manualAppCode}" not found.` });
                return;
            }

            console.log("Manual update: Found application", appToUpdate.id);

            const result = await updateApplicationStatus(appToUpdate.id, manualStatus);
            console.log("Manual update result:", result);

            if (result.success) {
                // Update local state
                setApps(prev => prev.map(a => a.id === appToUpdate.id ? { ...a, status: manualStatus } : a));
                if (selectedApp?.id === appToUpdate.id) {
                    setSelectedApp((prev: any) => ({ ...prev, status: manualStatus }));
                }

                setManualMessage({ type: 'success', text: `Status updated to "${manualStatus}" for application ${manualAppCode}.` });
                setManualAppCode(""); // Clear the input
            } else {
                setManualMessage({ type: 'error', text: `Failed to update status: ${result.error}` });
            }
        } catch (error) {
            console.error("Manual update error:", error);
            setManualMessage({ type: 'error', text: 'An error occurred while updating the status.' });
        } finally {
            setManualUpdating(false);
        }
    }

    async function handleRowManualStatusUpdate() {
        if (!rowManualApp) return;

        setRowManualUpdating(true);
        setRowManualMessage(null);

        try {
            const result = await updateApplicationStatus(rowManualApp.id, rowManualStatus);
            console.log("Row manual update result:", result);

            if (result.success) {
                // Update local state
                setApps(prev => prev.map(a => a.id === rowManualApp.id ? { ...a, status: rowManualStatus } : a));
                if (selectedApp?.id === rowManualApp.id) {
                    setSelectedApp((prev: any) => ({ ...prev, status: rowManualStatus }));
                }

                setRowManualMessage({ type: 'success', text: `Status updated to "${rowManualStatus}" for application ${rowManualApp.application_code}.` });
                setRowManualApp(null); // Close modal
            } else {
                setRowManualMessage({ type: 'error', text: `Failed to update status: ${result.error}` });
            }
        } catch (error) {
            console.error("Row manual update error:", error);
            setRowManualMessage({ type: 'error', text: 'An error occurred while updating the status.' });
        } finally {
            setRowManualUpdating(false);
        }
    }

    const handleDownloadExcel = async (app: any) => {
        try {
            // Prepare data for Excel generation
            const excelData = {
                gFirst: app.groom?.first_name || '',
                gMiddle: app.groom?.middle_name || '',
                gLast: app.groom?.last_name || '',
                gBday: app.groom?.birth_date ? new Date(app.groom.birth_date).toLocaleDateString('en-US') : '',
                gAge: app.groom?.age || 0,
                gTown: app.groom?.addresses?.municipality || '',
                gProv: app.groom?.addresses?.province || 'Nueva Vizcaya',
                gBrgy: app.groom?.addresses?.barangay || '',
                gCountry: app.groom?.citizenship || 'Philippines',
                gCitizen: app.groom?.citizenship || 'Filipino',
                gReligion: app.groom?.religion || '',
                gStatus: 'Single',
                gFathF: app.groom?.father_name?.split(' ')[0] || '',
                gFathM: app.groom?.father_name?.split(' ')[1] || '',
                gFathL: app.groom?.father_name?.split(' ')[2] || '',
                gMothF: app.groom?.mother_name?.split(' ')[0] || '',
                gMothM: app.groom?.mother_name?.split(' ')[1] || '',
                gMothL: app.groom?.mother_name?.split(' ')[2] || '',
                gGiverF: '',
                gGiverM: '',
                gGiverL: '',
                gGiverRelation: '',

                bFirst: app.bride?.first_name || '',
                bMiddle: app.bride?.middle_name || '',
                bLast: app.bride?.last_name || '',
                bBday: app.bride?.birth_date ? new Date(app.bride.birth_date).toLocaleDateString('en-US') : '',
                bAge: app.bride?.age || 0,
                bTown: app.bride?.addresses?.municipality || '',
                bProv: app.bride?.addresses?.province || 'Nueva Vizcaya',
                bBrgy: app.bride?.addresses?.barangay || '',
                bCountry: app.bride?.citizenship || 'Philippines',
                bCitizen: app.bride?.citizenship || 'Filipino',
                bReligion: app.bride?.religion || '',
                bStatus: 'Single',
                bFathF: app.bride?.father_name?.split(' ')[0] || '',
                bFathM: app.bride?.father_name?.split(' ')[1] || '',
                bFathL: app.bride?.father_name?.split(' ')[2] || '',
                bMothF: app.bride?.mother_name?.split(' ')[0] || '',
                bMothM: app.bride?.mother_name?.split(' ')[1] || '',
                bMothL: app.bride?.mother_name?.split(' ')[2] || '',
                bGiverF: '',
                bGiverM: '',
                bGiverL: '',
                bGiverRelation: '',
            };

            const response = await fetch('/api/generate-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...excelData,
                    applicationCode: app.application_code,
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `MARRIAGE_APPLICATION_${app.application_code}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                console.error('Failed to generate Excel file');
                alert('Failed to download Excel file. Please try again.');
            }
        } catch (error) {
            console.error('Error downloading Excel:', error);
            alert('An error occurred while downloading the Excel file.');
        }
    };

    const filtered = apps.filter(app => {
        const q = search.toLowerCase();
        return (
            app.application_code?.toLowerCase().includes(q) ||
            app.groom_name?.toLowerCase().includes(q) ||
            app.bride_name?.toLowerCase().includes(q) ||
            app.submitted_by?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Global Oversight</h1>
                    <p className="text-zinc-500 font-medium mt-2">Monitoring all marriage license applications across the municipality.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by Code or Name..."
                        className="h-12 w-[300px] bg-white border border-zinc-100 rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                    />
                </div>
            </div>

            {/* ── Manual Status Update and Photo Capture Forms ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manual Status Update Form */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-8">
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-6">Manual Status Update</h3>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Application Code</label>
                            <input
                                type="text"
                                placeholder="Enter application code (e.g., ABC123)"
                                className="w-full h-12 bg-white border border-zinc-100 rounded-2xl px-4 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                                value={manualAppCode}
                                onChange={(e) => setManualAppCode(e.target.value.toUpperCase())}
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-bold text-zinc-700 mb-2">Set Status</label>
                            <select
                                className="w-full h-12 bg-white border border-zinc-100 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                                value={manualStatus}
                                onChange={(e) => setManualStatus(e.target.value)}
                            >
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <button
                            onClick={handleManualStatusUpdate}
                            disabled={manualUpdating || !manualAppCode.trim()}
                            className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/20 disabled:cursor-not-allowed"
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
                        <div className={`mt-4 p-4 rounded-2xl text-sm font-bold ${
                            manualMessage.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {manualMessage.text}
                        </div>
                    )}
                </div>

                {/* Photo Capture */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-8">
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-6">Photo Capture</h3>

                    <p className="text-sm text-zinc-600 mb-6">
                        Capture and upload photos for marriage license applications. The application status will be automatically set to "approved" upon successful photo upload.
                    </p>

                    <button
                        onClick={() => setShowPhotoModal(true)}
                        className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/20"
                    >
                        Open Photo Capture
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
                <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Master Directory</h2>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filtered.length} records</span>
                </div>

                <div className="overflow-x-auto">
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
                                filtered.map((app) => {
                                    const config = STATUS_CONFIG[app.status?.toLowerCase()] || STATUS_CONFIG.pending;
                                    const StatusIcon = config.icon;

                                    return (
                                        <tr key={app.id} className="group hover:bg-zinc-50/40 transition-all duration-200">
                                            {/* Application Info */}
                                            <td className="px-8 py-6">
                                                <p className="text-lg font-black text-zinc-900 tracking-tighter leading-none">{app.application_code}</p>
                                                <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                                        {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Citizen Pairing */}
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

                                            {/* Status Badge */}
                                            <td className="px-6 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${config.bg} ${config.border}`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{app.status}</span>
                                                </div>
                                            </td>

                                            {/* Submitted By */}
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs font-black text-zinc-900 truncate max-w-[130px] uppercase tracking-tight">{app.submitted_by}</p>
                                                </div>
                                            </td>

                                            {/* Action Dropdown */}
                                            <td className="px-8 py-6">
                                                <ActionDropdown
                                                    app={app}
                                                    onView={() => setSelectedApp(app)}
                                                    onDownloadExcel={handleDownloadExcel}
                                                    onManualUpdate={(app) => {
                                                        setRowManualApp(app);
                                                        setRowManualStatus(app.status || "approved");
                                                        setRowManualMessage(null);
                                                    }}
                                                    isUpdating={updatingId === app.id}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-6">
                    <div className="text-sm font-bold text-zinc-600">
                        Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} applications
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push(`/dashboard/admin/applications?page=${currentPage - 1}&limit=${limit}`)}
                            disabled={currentPage <= 1}
                            className="flex items-center gap-2 h-10 px-4 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400 text-zinc-900 rounded-2xl font-bold text-sm transition-all disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => router.push(`/dashboard/admin/applications?page=${pageNum}&limit=${limit}`)}
                                        className={`h-10 w-10 rounded-2xl font-bold text-sm transition-all ${
                                            pageNum === currentPage
                                                ? 'bg-zinc-900 text-white'
                                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => router.push(`/dashboard/admin/applications?page=${currentPage + 1}&limit=${limit}`)}
                            disabled={currentPage >= totalPages}
                            className="flex items-center gap-2 h-10 px-4 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400 text-zinc-900 rounded-2xl font-bold text-sm transition-all disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Detail Modal ── */}
            {selectedApp && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={() => setSelectedApp(null)}
                >
                    <div
                        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b px-8 py-5 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Application Review</h2>
                                <p className="text-sm text-zinc-400 font-medium mt-0.5">
                                    #{selectedApp.application_code} &bull; {new Date(selectedApp.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    {selectedApp.contact_number && ` · ${selectedApp.contact_number}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all"
                            >
                                <X className="h-5 w-5 text-zinc-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 bg-zinc-50/50">
                            {/* Status + Submitter */}
                            <div className="flex items-center gap-3 flex-wrap">
                                {(() => {
                                    const cfg = STATUS_CONFIG[selectedApp.status?.toLowerCase()] || STATUS_CONFIG.pending;
                                    return (
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-black text-xs uppercase tracking-widest ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                            {selectedApp.status || 'pending'}
                                        </div>
                                    );
                                })()}
                                <span className="text-xs text-zinc-400 font-bold">Submitted by: {selectedApp.submitted_by}</span>
                            </div>

                            {/* Groom & Bride Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['groom', 'bride'].map((type) => {
                                    const person = type === 'groom' ? selectedApp.groom : selectedApp.bride;
                                    const isGroom = type === 'groom';

                                    if (!person) return (
                                        <div key={type} className="bg-white rounded-3xl border border-zinc-100 p-6 flex items-center justify-center h-40">
                                            <p className="text-zinc-400 text-sm italic">No {type} data found</p>
                                        </div>
                                    );

                                    const fullName = [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") + (person.suffix ? `, ${person.suffix}` : "");
                                    const address = person.addresses
                                        ? [person.addresses.barangay, person.addresses.municipality, person.addresses.province].filter(Boolean).join(", ")
                                        : null;

                                    return (
                                        <div key={type} className="space-y-3">
                                            <div className={`p-4 rounded-2xl border ${isGroom ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                                <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${isGroom ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                                    {type}'s Information
                                                </h3>
                                            </div>

                                            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
                                                <section className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Personal Details</h4>
                                                    <DetailItem label="Full Name" value={fullName} />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <DetailItem label="Birthday" value={person.birth_date ? new Date(person.birth_date).toLocaleDateString() : null} />
                                                        <DetailItem label="Age" value={person.age} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <DetailItem label="Citizenship" value={person.citizenship} />
                                                        <DetailItem label="Religion" value={person.religion} />
                                                    </div>
                                                </section>

                                                {address && (
                                                    <section className="space-y-2">
                                                        <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Current Residence</h4>
                                                        <DetailItem label="Address" value={address} />
                                                    </section>
                                                )}

                                                <section className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Parental Information</h4>
                                                    <DetailItem label="Father's Name" value={person.father_name} />
                                                    <DetailItem label="Mother's Name" value={person.mother_name} />
                                                </section>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t pt-4 text-center">
                                <p className="text-xs text-zinc-400 italic">This application record is encrypted and legally binding under RA 10173.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Row Manual Update Modal ── */}
            {rowManualApp && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={() => setRowManualApp(null)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Status Update</h3>
                            <button
                                onClick={() => setRowManualApp(null)}
                                className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all"
                            >
                                <X className="h-4 w-4 text-zinc-600" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Application Code</label>
                                <input
                                    type="text"
                                    value={rowManualApp.application_code}
                                    readOnly
                                    className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-2xl px-4 text-sm font-bold text-zinc-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Set Status</label>
                                <select
                                    className="w-full h-12 bg-white border border-zinc-100 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                                    value={rowManualStatus}
                                    onChange={(e) => setRowManualStatus(e.target.value)}
                                >
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <button
                                onClick={handleRowManualStatusUpdate}
                                disabled={rowManualUpdating}
                                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/20 disabled:cursor-not-allowed"
                            >
                                {rowManualUpdating ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Updating...
                                    </div>
                                ) : (
                                    'Update Status'
                                )}
                            </button>

                            {rowManualMessage && (
                                <div className={`mt-4 p-4 rounded-2xl text-sm font-bold ${
                                    rowManualMessage.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    {rowManualMessage.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Photo Capture Modal ── */}
            <PhotoCaptureModal
                isOpen={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
            />

        </>
    );
}
