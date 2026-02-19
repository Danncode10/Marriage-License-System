"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PenSquare, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Application {
    id: string;
    application_code: string;
    status: string;
    created_at: string;
}

export default function UserDashboard() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const supabase = createClient();

                // Check authentication
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
                if (authError) {
                    console.error('Auth error:', authError);
                    setError('Authentication error');
                    setLoading(false);
                    return;
                }

                if (!authUser) {
                    window.location.href = "/login";
                    return;
                }

                // Fetch applications
                const { data: apps, error: appsError } = await supabase
                    .from("marriage_applications")
                    .select("id, application_code, status, created_at")
                    .eq("created_by", authUser.id)
                    .order("created_at", { ascending: false });

                if (appsError) {
                    console.error('Failed to fetch applications:', appsError);
                    setError('Failed to load applications');
                } else {
                    setApplications(apps || []);
                }
            } catch (err) {
                console.error('Error in fetchData:', err);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <div className="h-9 w-64 bg-zinc-200 rounded animate-pulse" />
                        <div className="h-4 w-80 bg-zinc-200 rounded animate-pulse" />
                    </div>
                    <div className="h-11 w-40 bg-zinc-200 rounded animate-pulse" />
                </div>
                <Card className="p-12">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-zinc-200 rounded-full mx-auto animate-pulse" />
                        <div className="h-6 w-48 bg-zinc-200 rounded mx-auto animate-pulse" />
                        <div className="h-4 w-64 bg-zinc-200 rounded mx-auto animate-pulse" />
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-bold text-zinc-900">Error Loading Dashboard</h2>
                    <p className="text-zinc-500 text-center max-w-md">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">My Applications</h1>
                    <p className="text-zinc-500 mt-1">Track the status of your marriage license application.</p>
                </div>
                {applications.length === 0 && (
                    <Link href="/marriage">
                        <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                            <PenSquare className="mr-2 h-5 w-5" /> New Application
                        </Button>
                    </Link>
                )}
            </div>

            {/* Applications List */}
            <div className="space-y-6">
                {applications.length === 0 ? (
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
                                            <span>
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl">Marriage License Application</CardTitle>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                            app.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                            app.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            app.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {app.status || 'submitted'}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm text-zinc-600">
                                    Status: <span className="font-medium capitalize">{app.status || 'Submitted'}</span>
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}