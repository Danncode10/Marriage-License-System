"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FileText, Search, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Loader2, X
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { updateApplicationStatus, deleteApplication, updateRegistryNumber, restoreApplication } from "./actions";
import PhotoCaptureModal from "@/components/PhotoCaptureModal";
import AdminMarriageForm from "./AdminMarriageForm";
import DeleteApplicationModal from "./components/DeleteApplicationModal";
import AdminOnlyModal from "./components/AdminOnlyModal";
import RegistryNumberModal from "./components/RegistryNumberModal";

import { toTitleCase, calculateAge, splitName } from "../../../marriage/utils";

// Extracted Components
import ApplicationTable from "./components/ApplicationTable";
import ApplicationDetailModal from "./components/ApplicationDetailModal";
import RowManualUpdateModal from "./components/RowManualUpdateModal";
import EditApplicationModal from "../../../marriage/components/EditApplicationModal";

// ── Main Component ──────────────────────────────────────────────────────────
export default function GlobalOversightClient({
    apps: initialApps,
    totalCount,
    totalPages,
    currentPage,
    limit,
    userRole,
    allCounts: initialCounts,
    initialStatus = 'pending'
}: {
    apps: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    userRole: string | null;
    allCounts: { all: number, pending: number, approved: number, completed: number, rejected: number, deleted: number };
    initialStatus?: string;
}) {
    const router = useRouter();
    const [apps, setApps] = useState<any[]>(initialApps || []);

    // Sync state with props when server data refreshes
    useEffect(() => {
        setApps(initialApps || []);
    }, [initialApps]);

    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [search, setSearch] = useState("");

    // Initialize from the server-passed prop to avoid hydration mismatch
    const [activeTab, setActiveTab] = useState(initialStatus);

    // Sync activeTab if the initialStatus prop changes (e.g. via navigation)
    useEffect(() => {
        setActiveTab(initialStatus);
    }, [initialStatus]);
    const [counts, setCounts] = useState(initialCounts || { all: 0, pending: 0, approved: 0, completed: 0, rejected: 0, deleted: 0 });

    useEffect(() => {
        if (initialCounts) setCounts(initialCounts);
    }, [initialCounts]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadMessage, setDownloadMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    // Row-based manual update modal state
    const [rowManualApp, setRowManualApp] = useState<any | null>(null);
    const [rowManualStatus, setRowManualStatus] = useState("approved");
    const [rowManualUpdating, setRowManualUpdating] = useState(false);
    const [rowManualMessage, setRowManualMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Photo capture modal state
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // Admin marriage form modal state
    const [showAdminForm, setShowAdminForm] = useState(false);

    // Edit application modal state
    const [showEditForm, setShowEditForm] = useState(false);
    const [appToEdit, setAppToEdit] = useState<any | null>(null);

    // Delete application state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [appToDelete, setAppToDelete] = useState<any | null>(null);

    // Admin only restriction modal
    const [showAdminOnlyModal, setShowAdminOnlyModal] = useState(false);

    // Registry Number modal state
    const [registryApp, setRegistryApp] = useState<any | null>(null);

    const handleRefresh = () => {
        window.location.reload();
    };

    async function handleRowManualStatusUpdate() {
        if (!rowManualApp) return;

        setRowManualUpdating(true);
        setRowManualMessage(null);

        try {
            const result = await updateApplicationStatus(rowManualApp.id, rowManualStatus);

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

    async function handleRegistryUpdate(appId: string, registryCode: string) {
        const result = await updateRegistryNumber(appId, registryCode);
        if (result.success) {
            // Update local state
            setApps(prev => prev.map(a => a.id === appId ? {
                ...a,
                registry_number: result.registryNumber,
                status: 'completed'
            } : a));

            if (selectedApp?.id === appId) {
                setSelectedApp((prev: any) => ({
                    ...prev,
                    registry_number: result.registryNumber,
                    status: 'completed'
                }));
            }
        }
        return result;
    }

    async function handleDeleteApplication() {
        if (!appToDelete) return;

        try {
            const result = await deleteApplication(appToDelete.id);
            if (result.success) {
                // If the app was not in 'deleted' status, it's now 'deleted' (soft delete)
                // If it was already 'deleted', it's now permanently removed.
                const isPermanent = appToDelete.status === 'deleted';

                if (isPermanent) {
                    setApps(prev => prev.filter(a => a.id !== appToDelete.id));
                    setDownloadMessage({ type: 'success', text: `Application ${appToDelete.application_code} permanently deleted.` });
                } else {
                    // Refresh counts or move to deleted tab if we want immediate local update
                    // For simplicity, just reload or rely on server-side filtering on next tab change
                    handleRefresh();
                }
                setTimeout(() => setDownloadMessage(null), 3000);
            } else {
                setDownloadMessage({ type: 'error', text: `Failed to delete application: ${result.error}` });
            }
        } catch (error) {
            console.error("Delete error:", error);
            setDownloadMessage({ type: 'error', text: 'An error occurred while deleting the application.' });
        } finally {
            setShowDeleteModal(false);
            setAppToDelete(null);
        }
    }

    async function handleRestoreApplication(appId: string) {
        try {
            const result = await restoreApplication(appId);
            if (result.success) {
                setDownloadMessage({ type: 'success', text: `Application restored to pending.` });
                handleRefresh();
            } else {
                setDownloadMessage({ type: 'error', text: `Restore failed: ${result.error}` });
            }
        } catch (error) {
            console.error("Restore error:", error);
            setDownloadMessage({ type: 'error', text: 'An error occurred while restoring.' });
        }
    }

    const handleDownloadExcel = async (app: any) => {
        if (downloadingId) return;

        setDownloadingId(app.id);
        setDownloadMessage({ type: 'info', text: `Preparing Excel for ${app.application_code}...` });

        try {
            // Prepare data for Excel generation
            console.log("Preparing Excel for application:", app);

            const groomFather = splitName(app.groom?.father_name);
            const groomMother = splitName(app.groom?.mother_name);
            const groomGiver = splitName(app.groom?.giver_name);

            console.log("Groom Giver Info:", {
                fullName: app.groom?.giver_name,
                split: groomGiver,
                age: app.groom?.age,
                relationship: app.groom?.giver_relationship
            });

            const brideFather = splitName(app.bride?.father_name);
            const brideMother = splitName(app.bride?.mother_name);
            const brideGiver = splitName(app.bride?.giver_name);

            const excelData = {
                // Groom
                gFirst: app.groom?.first_name || '',
                gMiddle: app.groom?.middle_name || '',
                gLast: app.groom?.last_name || '',
                gSuffix: app.groom?.suffix || '',
                gCustomSuffix: app.groom?.suffix || '', // If it's custom, it's already the value
                gBday: app.groom?.birth_date ? new Date(app.groom.birth_date).toLocaleDateString('en-US') : '',
                gAge: app.groom?.age || 0,
                gBirthPlace: app.groom?.birth_place || (app.groom?.addresses ? `${app.groom.addresses.municipality}, ${app.groom.addresses.province}` : ""),
                gBirthCountry: app.groom?.birth_country || (app.groom?.is_not_born_in_ph ? "" : "Philippines"),
                gTown: (Array.isArray(app.groom?.addresses) ? app.groom.addresses[0]?.municipality : app.groom?.addresses?.municipality) || '',
                gProv: (Array.isArray(app.groom?.addresses) ? app.groom.addresses[0]?.province : app.groom?.addresses?.province) || 'Nueva Vizcaya',
                gBrgy: (Array.isArray(app.groom?.addresses) ? app.groom.addresses[0]?.barangay : app.groom?.addresses?.barangay) || '',
                gCountry: (Array.isArray(app.groom?.addresses) ? app.groom.addresses[0]?.country : app.groom?.addresses?.country) || 'Philippines',
                gCitizen: app.groom?.citizenship || '',
                gReligion: app.groom?.religion || '',
                gCustomReligion: app.groom?.religion || '',
                gStatus: 'Single',
                gFathF: groomFather.first,
                gFathM: groomFather.middle,
                gFathL: groomFather.last,
                gMothF: groomMother.first,
                gMothM: groomMother.middle,
                gMothL: groomMother.last,
                gGiverF: groomGiver.first,
                gGiverM: groomGiver.middle,
                gGiverL: groomGiver.last,
                gGiverRelation: app.groom?.giver_relationship || '',

                // Bride
                bFirst: app.bride?.first_name || '',
                bMiddle: app.bride?.middle_name || '',
                bLast: app.bride?.last_name || '',
                bSuffix: app.bride?.suffix || '',
                bCustomSuffix: app.bride?.suffix || '',
                bBday: app.bride?.birth_date ? new Date(app.bride.birth_date).toLocaleDateString('en-US') : '',
                bAge: app.bride?.age || 0,
                bBirthPlace: app.bride?.birth_place || (app.bride?.addresses ? `${app.bride.addresses.municipality}, ${app.bride.addresses.province}` : ""),
                bBirthCountry: app.bride?.birth_country || (app.bride?.is_not_born_in_ph ? "" : "Philippines"),
                bTown: (Array.isArray(app.bride?.addresses) ? app.bride.addresses[0]?.municipality : app.bride?.addresses?.municipality) || '',
                bProv: (Array.isArray(app.bride?.addresses) ? app.bride.addresses[0]?.province : app.bride?.addresses?.province) || 'Nueva Vizcaya',
                bBrgy: (Array.isArray(app.bride?.addresses) ? app.bride.addresses[0]?.barangay : app.bride?.addresses?.barangay) || '',
                bCountry: (Array.isArray(app.bride?.addresses) ? app.bride.addresses[0]?.country : app.bride?.addresses?.country) || 'Philippines',
                bCitizen: app.bride?.citizenship || '',
                bReligion: app.bride?.religion || '',
                bCustomReligion: app.bride?.religion || '',
                bStatus: 'Single',
                bFathF: brideFather.first,
                bFathM: brideFather.middle,
                bFathL: brideFather.last,
                bMothF: brideMother.first,
                bMothM: brideMother.middle,
                bMothL: brideMother.last,
                bGiverF: brideGiver.first,
                bGiverM: brideGiver.middle,
                bGiverL: brideGiver.last,
                bGiverRelation: app.bride?.giver_relationship || '',

                // Groom ID fields
                gIdType: app.groom?.id_type || '',
                gIdNo: app.groom?.id_no || '',
                gIdCustomType: app.groom?.id_type || '',
                gIncludeId: !!app.groom?.include_id,
                gGiverIdType: app.groom?.giver_id_type || '',
                gGiverIdNo: app.groom?.giver_id_no || '',
                gGiverIdCustomType: app.groom?.giver_id_type || '',
                gGiverIncludeId: !!app.groom?.giver_include_id,

                // Bride ID fields
                bIdType: app.bride?.id_type || '',
                bIdNo: app.bride?.id_no || '',
                bIdCustomType: app.bride?.id_type || '',
                bIncludeId: !!app.bride?.include_id,
                bGiverIdType: app.bride?.giver_id_type || '',
                bGiverIdNo: app.bride?.giver_id_no || '',
                bGiverIdCustomType: app.bride?.giver_id_type || '',
                bGiverIncludeId: !!app.bride?.giver_include_id,
            };

            const response = await fetch('/api/generate-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...excelData,
                    applicationCode: app.application_code,
                    registryNumber: app.registry_number,
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
                setDownloadMessage({ type: 'success', text: `Successfully downloaded Excel for ${app.application_code}.` });
                setTimeout(() => setDownloadMessage(null), 3000);
            } else {
                // Determine if the error is JSON or text
                const contentType = response.headers.get("content-type");
                let errorMessage = "Server error";

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.details || errorData.error || errorMessage;
                } else {
                    const errorText = await response.text();
                    console.error("Non-JSON error response:", errorText);
                    errorMessage = "Server returned an invalid response (500). Please check server logs.";
                }

                setDownloadMessage({
                    type: 'error',
                    text: `Download failed: ${errorMessage}`
                });
            }
        } catch (error) {
            console.error('Error downloading Excel:', error);
            setDownloadMessage({ type: 'error', text: 'An unexpected error occurred while downloading the Excel file.' });
        } finally {
            setDownloadingId(null);
        }
    };

    const handleTabChange = (status: string) => {
        setActiveTab(status);
        const params = new URLSearchParams(window.location.search);
        params.set('status', status);
        params.set('page', '1'); // Reset to first page
        router.push(`/dashboard/admin/applications?${params.toString()}`);
    };

    const filtered = useMemo(() => {
        let result = apps;

        // Note: Server already filters by status, but we keep this for immediate local updates
        result = result.filter(app => {
            if (activeTab === 'all') return true;
            const status = (app.status || 'pending').toLowerCase();
            if (activeTab === "pending") {
                return status === "pending" || status === "submitted" || status === "processing" || status === "draft";
            }
            return status === activeTab;
        });

        // 2. Filter by Search Query
        const q = search.toLowerCase().trim();
        if (q) {
            result = result.filter(app => {
                return (
                    (app.application_code?.toLowerCase() || "").includes(q) ||
                    (app.groom_name?.toLowerCase() || "").includes(q) ||
                    (app.bride_name?.toLowerCase() || "").includes(q) ||
                    (app.submitted_by?.toLowerCase() || "").includes(q)
                );
            });
        }

        return result;
    }, [apps, search, activeTab]);

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10" suppressHydrationWarning>
            {/* ── Header ── */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Global Oversight</h1>
                        <p className="text-zinc-500 font-medium mt-2">Monitoring all marriage license applications across the municipality.</p>
                    </div>
                    <button
                        onClick={() => setShowAdminForm(true)}
                        className="h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-2 md:w-auto w-full"
                        suppressHydrationWarning
                    >
                        <FileText className="h-4 w-4" />
                        Create Application
                    </button>
                </div>

                {/* ── Status Tabs ── */}
                <div className="flex p-1.5 bg-zinc-100 rounded-[2rem] w-fit border border-zinc-200 shadow-inner overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'All', count: counts.all, color: 'text-zinc-600', bg: 'bg-zinc-200' },
                        { id: 'pending', label: 'Pending', count: counts.pending, color: 'text-amber-600', bg: 'bg-amber-100' },
                        { id: 'approved', label: 'Approve', count: counts.approved, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                        { id: 'completed', label: 'Complete', count: counts.completed, color: 'text-blue-600', bg: 'bg-blue-100' },
                        { id: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-rose-600', bg: 'bg-rose-100' },
                        { id: 'deleted', label: 'Deleted', count: counts.deleted, color: 'text-zinc-600', bg: 'bg-zinc-100' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                relative flex items-center gap-3 px-6 py-3 rounded-[1.5rem] transition-all duration-300
                                ${activeTab === tab.id ? 'bg-white shadow-xl shadow-zinc-200/50' : 'hover:bg-zinc-200/50'}
                            `}
                        >
                            <span className={`text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                {tab.label}
                            </span>
                            <span className={`
                                flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black
                                ${activeTab === tab.id ? `${tab.bg} ${tab.color}` : 'bg-zinc-200 text-zinc-500'}
                            `}>
                                {tab.count}
                            </span>
                            {activeTab === tab.id && (
                                <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-zinc-900 shadow-lg`} />
                            )}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by Code or Name..."
                        className="h-14 w-full bg-white border border-zinc-100 rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                        suppressHydrationWarning
                    />
                </div>

                {/* Download Status Toast */}
                {downloadMessage && (
                    <div className="fixed bottom-8 right-8 z-[60] max-w-md w-full animate-in slide-in-from-right duration-300">
                        <Alert
                            type={downloadMessage.type === 'info' ? 'info' : downloadMessage.type}
                            message={downloadMessage.text}
                            onClose={() => setDownloadMessage(null)}
                            className="shadow-2xl border-zinc-200/50 backdrop-blur-md bg-white/90"
                        />
                    </div>
                )}
            </div>

            {/* ── Photo Capture Form ── */}
            {(activeTab === 'pending' || activeTab === 'approved') && (
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-8">
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-6">Photo Capture</h3>
                    <p className="text-sm text-zinc-600 mb-6">
                        Capture and upload photos for marriage license applications. The application status will be automatically set to "approved" upon successful photo upload.
                    </p>
                    <button
                        onClick={() => setShowPhotoModal(true)}
                        className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/20"
                        suppressHydrationWarning
                    >
                        Open Photo Capture
                    </button>
                </div>
            )}

            {/* ── Table ── */}
            <ApplicationTable
                filtered={filtered}
                onView={(app) => setSelectedApp(app)}
                onDownloadExcel={handleDownloadExcel}
                onManualUpdate={(app) => {
                    setRowManualApp(app);
                    setRowManualStatus(app.status || "approved");
                    setRowManualMessage(null);
                }}
                onRegistry={(app) => {
                    setRegistryApp(app);
                }}
                onDelete={(app) => {
                    if (userRole !== 'admin') {
                        setShowAdminOnlyModal(true);
                        return;
                    }
                    setAppToDelete(app);
                    setShowDeleteModal(true);
                }}
                onRestore={handleRestoreApplication}
                updatingId={updatingId}
                downloadingId={downloadingId}
                onRefresh={handleRefresh}
            />

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-6 gap-4">
                    <div className="text-sm font-bold text-zinc-600">
                        Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} applications
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push(`/dashboard/admin/applications?page=${currentPage - 1}&limit=${limit}&status=${activeTab}`)}
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
                                        onClick={() => router.push(`/dashboard/admin/applications?page=${pageNum}&limit=${limit}&status=${activeTab}`)}
                                        className={`h-10 w-10 rounded-2xl font-bold text-sm transition-all ${pageNum === currentPage
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
                            onClick={() => router.push(`/dashboard/admin/applications?page=${currentPage + 1}&limit=${limit}&status=${activeTab}`)}
                            disabled={currentPage >= totalPages}
                            className="flex items-center gap-2 h-10 px-4 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400 text-zinc-900 rounded-2xl font-bold text-sm transition-all disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modals ── */}
            <ApplicationDetailModal
                selectedApp={selectedApp}
                onClose={() => setSelectedApp(null)}
                onEdit={(app) => {
                    setAppToEdit(app);
                    setShowEditForm(true);
                }}
            />

            {showEditForm && appToEdit && (
                <EditApplicationModal
                    isOpen={showEditForm}
                    onClose={() => {
                        setShowEditForm(false);
                        setAppToEdit(null);
                    }}
                    onSuccess={handleRefresh}
                    selectedApp={appToEdit}
                />
            )}

            <RowManualUpdateModal
                rowManualApp={rowManualApp}
                rowManualStatus={rowManualStatus}
                setRowManualStatus={setRowManualStatus}
                rowManualUpdating={rowManualUpdating}
                rowManualMessage={rowManualMessage}
                onClose={() => setRowManualApp(null)}
                onUpdate={handleRowManualStatusUpdate}
            />

            {showPhotoModal && (
                <PhotoCaptureModal
                    isOpen={showPhotoModal}
                    onClose={() => setShowPhotoModal(false)}
                    onSuccess={handleRefresh}
                />
            )}

            {showAdminForm && (
                <AdminMarriageForm
                    isOpen={showAdminForm}
                    onClose={() => setShowAdminForm(false)}
                    onSuccess={handleRefresh}
                />
            )}

            {showDeleteModal && appToDelete && (
                <DeleteApplicationModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setAppToDelete(null);
                    }}
                    onConfirm={handleDeleteApplication}
                    applicationCode={appToDelete.application_code}
                    isSoftDelete={appToDelete.status !== 'deleted'}
                />
            )}

            <AdminOnlyModal
                isOpen={showAdminOnlyModal}
                onClose={() => setShowAdminOnlyModal(false)}
            />

            {registryApp && (
                <RegistryNumberModal
                    app={registryApp}
                    onClose={() => setRegistryApp(null)}
                    onUpdate={handleRegistryUpdate}
                />
            )}
        </div>
    );
}
