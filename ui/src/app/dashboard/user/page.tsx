import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Download,
    Calendar,
    MapPin,
    PenSquare
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch applications for this user
    const { data: applications, error } = await supabase
        .from("marriage_applications")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">My Applications</h1>
                    <p className="text-zinc-500 mt-1">Track the status of your marriage license applications.</p>
                </div>
                <Link href="/marriage">
                    <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                        <PenSquare className="mr-2 h-5 w-5" /> New Application
                    </Button>
                </Link>
            </div>

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
                                        <StatusBadge status={app.status} />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Next Step</h4>
                                            {getNextStep(app.status)}
                                        </div>

                                        {/* Status Timeline / Details - Simplified for now */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-900">Municipal Civil Registrar</p>
                                                    <p className="text-zinc-500 text-xs">Solano, Nueva Vizcaya</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-zinc-50/30 border-t border-zinc-100 flex justify-end gap-3 py-4">
                                    <Button variant="ghost" size="sm">View Details</Button>
                                    {app.status === 'completed' && (
                                        <Button size="sm" className="gap-2">
                                            <Download className="h-4 w-4" /> Download Documents
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Right Column: Information & Help */}
                <div className="space-y-6">
                    {/* Office Visit Instructions Card */}
                    <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <MapPin className="h-5 w-5" /> Visit Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-blue-900/80 dark:text-blue-200">
                            <p>
                                After submitting your application online, both parties must appear personally at the User Service Office.
                            </p>
                            <div className="space-y-2">
                                <div className="flex gap-3 items-start bg-white/50 p-3 rounded-lg">
                                    <div className="min-w-[24px] h-6 flex items-center justify-center bg-blue-200 text-blue-800 rounded-full text-xs font-bold">1</div>
                                    <p>Bring valid IDs for both parties.</p>
                                </div>
                                <div className="flex gap-3 items-start bg-white/50 p-3 rounded-lg">
                                    <div className="min-w-[24px] h-6 flex items-center justify-center bg-blue-200 text-blue-800 rounded-full text-xs font-bold">2</div>
                                    <p>Bring PSA Birth Certificates (Original & Photocopy).</p>
                                </div>
                                <div className="flex gap-3 items-start bg-white/50 p-3 rounded-lg">
                                    <div className="min-w-[24px] h-6 flex items-center justify-center bg-blue-200 text-blue-800 rounded-full text-xs font-bold">3</div>
                                    <p>Provide your <strong>Application Code</strong> to the staff.</p>
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
