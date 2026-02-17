import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Calendar,
    MapPin,
    Clock,
    Download,
    AlertHorizontal,
    PenSquare
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: applications } = await supabase
        .from("marriage_applications")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Your Applications</h1>
                    <p className="text-zinc-500 mt-1">View details and history of all your submissions.</p>
                </div>
                <Link href="/marriage">
                    <Button>
                        <PenSquare className="mr-2 h-4 w-4" /> New Application
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {!applications || applications.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
                        <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900">No applications found</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mt-2">Start a new marriage license application to see it listed here.</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
                            <div className="flex flex-col md:flex-row">
                                {/* Status Indicator Strip */}
                                <div className={`w-full md:w-2 ${getStatusColor(app.status)}`} />

                                <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-zinc-900">Application #{app.application_code}</h3>
                                            <StatusBadge status={app.status} />
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Created: {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                            {app.updated_at && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    Updated: {new Date(app.updated_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button variant="outline">View Details</Button>
                                        {app.status === 'completed' && (
                                            <Button variant="secondary" className="gap-2">
                                                <Download className="h-4 w-4" /> Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'submitted': return "bg-blue-500";
        case 'pending': return "bg-amber-500";
        case 'processing': return "bg-purple-500";
        case 'approved': return "bg-emerald-500";
        case 'completed': return "bg-green-600";
        case 'rejected': return "bg-red-500";
        default: return "bg-zinc-200";
    }
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

    return (
        <Badge variant="outline" className={`px-3 py-1 capitalize font-semibold ${styles[status] || styles.draft}`}>
            {status}
        </Badge>
    );
}
