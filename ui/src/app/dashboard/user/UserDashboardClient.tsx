"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Calendar,
    MapPin,
    PenSquare,
    Edit2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import ApplicationReviewOverlay from "./components/ApplicationReviewOverlay";

interface Application {
    id: string;
    application_code: string;
    status: string;
    created_at: string;
    applicants: Array<{
        id: string;
        type: string;
        first_name: string;
        middle_name?: string | null;
        last_name: string;
        suffix?: string | null;
        birth_date: string;
        age: number;
        citizenship: string;
        religion?: string | null;
        father_name?: string | null;
        mother_name?: string | null;
        addresses: any;
    }>;
}

export default function UserDashboard() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<unknown>(null);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    const fetchApplications = async (supabase: ReturnType<typeof createClient>, userId: string) => {
        setLoading(true);

        // Fetch applications first
        const { data: apps, error: appsError } = await supabase
            .from("marriage_applications")
            .select("*")
            .eq("created_by", userId)
            .order("created_at", { ascending: false });

        if (appsError) {
            console.error('Failed to fetch applications:', appsError);
            setLoading(false);
            return;
        }

        if (!apps || apps.length === 0) {
            setApplications([]);
            setLoading(false);
            return;
        }

        // Fetch applicants for each application
        const applicationsWithApplicants = await Promise.all(
            apps.map(async (app) => {
                const { data: applicants, error: applicantsError } = await supabase
                    .from("applicants")
                    .select(`
                        *,
                        addresses (*)
                    `)
                    .eq("application_id", app.id);

                if (applicantsError) {
                    console.error('Failed to fetch applicants for app', app.id, applicantsError.message, applicantsError);
                    return { ...app, applicants: [] };
                }

                return { ...app, applicants: applicants || [] };
            })
        );

        setApplications(applicationsWithApplicants);
        setLoading(false);
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            const supabase = createClient();

            // Check authentication
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                window.location.href = "/login";
                return;
            }
            setUser(authUser);

            // NEW FLOW: Check for full pending application data in localStorage (Guest conversion)
            const pendingAppDataStr = localStorage.getItem('pending_marriage_application');
            if (pendingAppDataStr) {
                localStorage.removeItem('pending_marriage_application');
                try {
                    setLoading(true);
                    const { formData, applicationCode } = JSON.parse(pendingAppDataStr);
                    console.log('Found full pending application data. Finalizing submission to DB...');

                    const { submitApplication } = await import('../../marriage/submission-utils');
                    await submitApplication(formData, applicationCode, authUser.id);

                    console.log('Application finalized successfully for user:', authUser.id);
                    localStorage.removeItem('application_code'); // Clean up buddy key if exists
                } catch (e) {
                    console.error('Failed to finalize pending application:', e);
                    // Re-store the data if submission failed
                    localStorage.setItem('pending_marriage_application', pendingAppDataStr);
                }
            }

            // ALTERNATIVE FLOW: Check for orphaned application code (from signup flow)
            const pendingCode = localStorage.getItem('pending_application_code');
            if (pendingCode && !pendingAppDataStr) {
                console.log('Checking for orphaned application code:', pendingCode);
                try {
                    const { data: existingApp, error: checkError } = await supabase
                        .from('marriage_applications')
                        .select('id, created_by, application_code')
                        .eq('application_code', pendingCode)
                        .maybeSingle();

                    if (checkError) {
                        console.error('Error checking orphaned application:', checkError.message);
                    } else if (existingApp && !existingApp.created_by) {
                        // Found orphaned application, claim it
                        console.log('Found orphaned application. Claiming for user...');
                        const { error: claimError } = await supabase
                            .from('marriage_applications')
                            .update({ created_by: authUser.id })
                            .eq('id', existingApp.id);

                        if (!claimError) {
                            console.log('Orphaned application claimed successfully.');
                            localStorage.removeItem('pending_application_code');
                        } else {
                            console.error('Failed to claim orphaned application:', claimError.message);
                        }
                    } else if (existingApp && existingApp.created_by) {
                        // Already claimed
                        console.log('Application already claimed by someone else or self.');
                        localStorage.removeItem('pending_application_code');
                    }
                } catch (e) {
                    console.error('Error in orphaned application check:', e);
                }
            }

            // RECONCILIATION: Check for application_code (Already in DB but needs claiming)
            const applicationCode = localStorage.getItem('application_code');
            if (applicationCode) {
                console.log('Checking for unclaimed application code:', applicationCode);

                const { data: existingApp, error: checkError } = await supabase
                    .from('marriage_applications')
                    .select('id, created_by')
                    .eq('application_code', applicationCode)
                    .maybeSingle();

                if (checkError) {
                    console.error('Error checking application status:', checkError.message || checkError);
                    localStorage.removeItem('application_code'); // Clean up on error
                } else if (existingApp) {
                    if (!existingApp.created_by) {
                        // Claim the orphaned application
                        console.log('Found unclaimed application. Linking to user...');
                        const { error: claimError } = await supabase
                            .from('marriage_applications')
                            .update({ created_by: authUser.id })
                            .eq('id', existingApp.id);

                        if (!claimError) {
                            console.log('Application claimed successfully.');
                            localStorage.removeItem('application_code');
                        } else {
                            console.error('Failed to claim application:', claimError.message);
                            localStorage.removeItem('application_code'); // Clean up on claim error
                        }
                    } else {
                        // Already claimed or owned
                        localStorage.removeItem('application_code');
                    }
                } else {
                    // No such application found
                    localStorage.removeItem('application_code');
                }
            }

            // Fetch applications
            await fetchApplications(supabase, authUser.id);

            // Set up real-time subscriptions for user's applications
            const applicationsSubscription = supabase
                .channel('user_applications_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'marriage_applications',
                    filter: `created_by=eq.${authUser.id}`
                }, () => {
                    fetchApplications(supabase, authUser.id);
                })
                .subscribe();

            // Also subscribe to applicants table changes (since applications include applicants data)
            const applicantsSubscription = supabase
                .channel('user_applicants_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'applicants'
                }, () => {
                    fetchApplications(supabase, authUser.id);
                })
                .subscribe();

            // Cleanup function
            return () => {
                applicationsSubscription.unsubscribe();
                applicantsSubscription.unsubscribe();
            };
        };

        const cleanup = initializeDashboard();

        // Return cleanup function
        return () => {
            cleanup?.then(cleanupFn => cleanupFn?.());
        };
    }, []);

    const handleEditSuccess = () => {
        const supabase = createClient();
        if (user) {
            fetchApplications(supabase, (user as any).id);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <DashboardHeader
                title="My Applications"
                subtitle="Track the status of your marriage license application"
                actions={
                    (!applications || applications.length === 0) ? (
                        <Link href="/marriage" className="w-full sm:w-auto">
                            <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                                <PenSquare className="mr-2 h-5 w-5" /> New Application
                            </Button>
                        </Link>
                    ) : undefined
                }
            />

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Applications List */}
                <div className="lg:col-span-2 space-y-6">
                    {!applications || applications.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2 bg-zinc-50/50">
                            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-zinc-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900">No Applications Yet</h3>
                            <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
                                You haven't submitted any marriage license applications yet. Get started by filling out the form.
                            </p>
                            <Link href="/marriage">
                                <Button variant="outline">Start Application</Button>
                            </Link>
                        </Card>
                    ) : (
                        applications.map((app) => (
                            <Card key={app.id} className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                <CardHeader className="bg-zinc-50/50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
                                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-zinc-200">
                                                    #{app.application_code}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-xl">Marriage License Application</CardTitle>
                                        </div>
                                        <StatusBadge status={app.status || 'submitted'} />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Applicants</h4>
                                            <div className="space-y-2">
                                                {!app.applicants || app.applicants.length === 0 ? (
                                                    <p className="text-sm text-zinc-400 italic">No applicant names loaded</p>
                                                ) : (
                                                    app.applicants.map((applicant) => (
                                                        <div key={applicant.id} className="text-sm">
                                                            <span className="font-medium text-zinc-900 capitalize">
                                                                {applicant.type}: {applicant.first_name} {applicant.last_name}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Next Step</h4>
                                            {getNextStep(app.status || 'submitted')}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-zinc-50/30 border-t border-zinc-100 flex justify-end gap-3 py-4">
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>View Details</Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Right Column: Information & Help */}
                <div className="space-y-6">
                    {/* Office Visit Instructions Card */}
                    {/* Restored & Improved Visit Instructions */}
                    <Card className="bg-blue-50 border-blue-100 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-blue-800 font-black italic tracking-tight">
                                <MapPin className="h-5 w-5" /> OFFICE VISIT GUIDE
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                                Please visit the <span className="text-blue-700 font-black">Solano Municipal Office</span> with the following:
                            </p>

                            <div className="space-y-3">
                                <div className="flex gap-4 items-start bg-white/60 p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="min-w-[28px] h-7 flex items-center justify-center bg-blue-200 text-blue-900 rounded-full text-xs font-black">1</div>
                                    <div className="space-y-0.5">
                                        <p className="text-slate-900 font-black text-sm">Birth Cert & CENOMAR</p>
                                        <p className="text-slate-600 text-[11px] font-bold">Original & Photocopy (For both parties)</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start bg-white/60 p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="min-w-[28px] h-7 flex items-center justify-center bg-blue-200 text-blue-900 rounded-full text-xs font-black">2</div>
                                    <div className="space-y-0.5">
                                        <p className="text-slate-900 font-black text-sm">Valid ID</p>
                                        <p className="text-slate-600 text-[11px] font-bold">Present to staff for verification</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start bg-white/60 p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="min-w-[28px] h-7 flex items-center justify-center bg-blue-200 text-blue-900 rounded-full text-xs font-black">3</div>
                                    <div className="space-y-0.5">
                                        <p className="text-slate-900 font-black text-sm">Application Code</p>
                                        <p className="text-blue-700 text-lg font-black font-mono tracking-widest leading-none mt-1">
                                            {applications && applications[0]?.application_code ? applications[0].application_code : '------'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Special Cases */}
                            <div className="mt-6 pt-6 border-t border-blue-200/50">
                                <p className="text-blue-800 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> For Special Cases
                                </p>
                                <div className="space-y-2">
                                    <div className="bg-amber-100/50 p-3 rounded-xl border border-amber-200/50">
                                        <p className="text-slate-800 text-[11px] font-bold leading-tight">
                                            <span className="text-amber-700">If Widowed:</span> Death certificate of past spouse
                                        </p>
                                    </div>
                                    <div className="bg-amber-100/50 p-3 rounded-xl border border-amber-200/50">
                                        <p className="text-slate-800 text-[11px] font-bold leading-tight">
                                            <span className="text-amber-700">If Divorced:</span> Court Order
                                        </p>
                                    </div>
                                    <div className="bg-amber-100/50 p-3 rounded-xl border border-amber-200/50">
                                        <p className="text-slate-800 text-[11px] font-bold leading-tight">
                                            <span className="text-amber-700">If Foreigner:</span> Legal Capacity
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-zinc-500 space-y-2">
                            <p>If you have questions about your application, please contact the MCR Office.</p>
                            <div className="flex items-center gap-2 font-medium text-zinc-900 pt-2">
                                <Clock className="h-4 w-4 text-zinc-400" />
                                <span>Mon - Fri, 8:00 AM - 5:00 PM</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Application Detail Overlay (Review only, no edit for users) */}
            <ApplicationReviewOverlay
                selectedApp={selectedApp}
                onClose={() => setSelectedApp(null)}
            />
        </div>
    );
}


function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        draft: "bg-zinc-100 text-zinc-600 border-zinc-200",
        submitted: "bg-blue-50 text-blue-700 border-blue-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        processing: "bg-purple-50 text-purple-700 border-purple-200",
        completed: "bg-green-50 text-green-700 border-green-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
    };

    const labels: Record<string, string> = {
        draft: "Draft",
        submitted: "Submitted",
        pending: "Pending Review",
        approved: "Approved",
        processing: "Processing",
        completed: "Ready for Pickup",
        rejected: "Rejected",
    };

    return (
        <Badge variant="outline" className={`px-3 py-1 capitalize font-semibold ${styles[status] || styles.draft}`}>
            {labels[status] || status}
        </Badge>
    );
}

function getNextStep(status: string) {
    switch (status) {
        case 'submitted':
            return (
                <div className="flex items-center gap-2 text-sm text-zinc-700">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <p>Visit the Municipal Office with your documents.</p>
                </div>
            );
        case 'processing':
            return (
                <div className="flex items-center gap-2 text-sm text-zinc-700">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4" />
                    </div>
                    <p>Wait for processing completion (approx. 1-2 hours).</p>
                </div>
            );
        case 'completed':
            return (
                <div className="flex items-center gap-2 text-sm text-zinc-700">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4" />
                    </div>
                    <p>Your documents are ready. Please pick them up.</p>
                </div>
            );
        default:
            return <p className="text-sm text-zinc-500">Wait for further updates.</p>;
    }
}
