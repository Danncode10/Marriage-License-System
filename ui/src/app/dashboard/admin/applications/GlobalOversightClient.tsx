"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FileText, Search, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Loader2, X
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { updateApplicationStatus, deleteApplication } from "./actions";
import PhotoCaptureModal from "@/components/PhotoCaptureModal";
import AdminMarriageForm from "./AdminMarriageForm";
import DeleteApplicationModal from "./components/DeleteApplicationModal";
import AdminOnlyModal from "./components/AdminOnlyModal";

import { toTitleCase, calculateAge, splitName } from "../../../marriage/utils";

// Extracted Components
import ApplicationTable from "./components/ApplicationTable";
import ApplicationDetailModal from "./components/ApplicationDetailModal";
import RowManualUpdateModal from "./components/RowManualUpdateModal";
import ManualStatusUpdateForm from "./components/ManualStatusUpdateForm";
import EditApplicationModal from "../../../marriage/components/EditApplicationModal";

// ── Main Component ──────────────────────────────────────────────────────────
export default function GlobalOversightClient({
    apps: initialApps,
    totalCount,
    totalPages,
    currentPage,
    limit,
    userRole
}: {
    apps: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    userRole: string | null;
}) {
    const router = useRouter();
    const [apps, setApps] = useState<any[]>(initialApps || []);

    // Sync state with props when server data refreshes
    useEffect(() => {
        setApps(initialApps || []);
    }, [initialApps]);

    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadMessage, setDownloadMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    // Manual status update form state
    const [manualAppCode, setManualAppCode] = useState("");
    const [manualStatus, setManualStatus] = useState("approved");
    const [manualUpdating, setManualUpdating] = useState(false);
    const [manualMessage, setManualMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

    const handleRefresh = () => {
        window.location.reload();
    };

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

            const result = await updateApplicationStatus(appToUpdate.id, manualStatus);

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

    async function handleDeleteApplication() {
        if (!appToDelete) return;

        try {
            const result = await deleteApplication(appToDelete.id);
            if (result.success) {
                setApps(prev => prev.filter(a => a.id !== appToDelete.id));
                setDownloadMessage({ type: 'success', text: `Application ${appToDelete.application_code} deleted successfully.` });
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

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return apps;

        return apps.filter(app => {
            return (
                (app.application_code?.toLowerCase() || "").includes(q) ||
                (app.groom_name?.toLowerCase() || "").includes(q) ||
                (app.bride_name?.toLowerCase() || "").includes(q) ||
                (app.submitted_by?.toLowerCase() || "").includes(q)
            );
        });
    }, [apps, search]);

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

            {/* ── Photo Capture and Manual Status Update Forms ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Photo Capture */}
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

                {/* Manual Status Update Form */}
                <ManualStatusUpdateForm
                    manualAppCode={manualAppCode}
                    setManualAppCode={setManualAppCode}
                    manualStatus={manualStatus}
                    setManualStatus={setManualStatus}
                    manualUpdating={manualUpdating}
                    manualMessage={manualMessage}
                    onUpdate={handleManualStatusUpdate}
                />
            </div>

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
                onDelete={(app) => {
                    if (userRole !== 'admin') {
                        setShowAdminOnlyModal(true);
                        return;
                    }
                    setAppToDelete(app);
                    setShowDeleteModal(true);
                }}
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
                />
            )}

            <AdminOnlyModal
                isOpen={showAdminOnlyModal}
                onClose={() => setShowAdminOnlyModal(false)}
            />
        </div>
    );
}
