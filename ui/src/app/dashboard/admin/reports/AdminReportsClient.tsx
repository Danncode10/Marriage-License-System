"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    MapPin,
    Calendar,
    Download,
    Filter,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ExportButton } from "@/components/common/ExportButton";

interface Application {
    id: string;
    application_code: string;
    status: string;
    created_at: string;
    submitted_by: string;
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
        addresses: {
            barangay: string;
            municipality: string;
            province: string;
        } | null;
    }>;
}

export default function AdminReportsClient() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState<"all" | "month" | "week">("all");

    // Fetch data on component mount
    useEffect(() => {
        const fetchReportsData = async () => {
            try {
                setLoading(true);
                setError(null);

                const supabase = createClient();

                // First fetch applications
                const { data: applicationsData, error: appsError } = await supabase
                    .from("marriage_applications")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (appsError) {
                    console.error("Error fetching applications:", appsError);
                    setError("Failed to load applications data");
                    setLoading(false);
                    return;
                }

                if (!applicationsData || applicationsData.length === 0) {
                    setApplications([]);
                    setLoading(false);
                    return;
                }

                // Then fetch applicants for each application
                const applicationsWithApplicants = await Promise.all(
                    applicationsData.map(async (app) => {
                        const { data: applicants, error: applicantsError } = await supabase
                            .from("applicants")
                            .select(`
                                *,
                                addresses (*)
                            `)
                            .eq("application_id", app.id);

                        if (applicantsError) {
                            console.error('Failed to fetch applicants for app', app.id, applicantsError);
                            return { ...app, applicants: [] };
                        }

                        return { ...app, applicants: applicants || [] };
                    })
                );

                setApplications(applicationsWithApplicants);
            } catch (err) {
                console.error("Error in fetchReportsData:", err);
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchReportsData();
    }, []);

    // Calculate statistics
    const stats = useMemo(() => {
        const filteredApps = selectedTimeframe === "all" ? applications :
            selectedTimeframe === "month" ?
                applications.filter(app => {
                    const appDate = new Date(app.created_at);
                    const now = new Date();
                    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    return appDate >= oneMonthAgo;
                }) :
                applications.filter(app => {
                    const appDate = new Date(app.created_at);
                    const now = new Date();
                    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return appDate >= oneWeekAgo;
                });

        // Status breakdown
        const statusCounts = {
            pending: 0,
            processing: 0,
            approved: 0,
            completed: 0,
            rejected: 0
        };

        // Municipality breakdown
        const municipalityCounts: Record<string, number> = {};

        // Age distribution
        const ageGroups = {
            "18-20": 0,
            "21-24": 0,
            "25-30": 0,
            "31-40": 0,
            "41-50": 0,
            "51+": 0
        };

        // Religion breakdown
        const religionCounts: Record<string, number> = {};

        // Monthly applications
        const monthlyData: Record<string, number> = {};

        filteredApps.forEach(app => {
            // Status counts
            const status = app.status?.toLowerCase() || 'pending';
            if (statusCounts[status as keyof typeof statusCounts] !== undefined) {
                statusCounts[status as keyof typeof statusCounts]++;
            }

            // Municipality counts
            app.applicants?.forEach(applicant => {
                if (applicant.addresses?.municipality) {
                    municipalityCounts[applicant.addresses.municipality] =
                        (municipalityCounts[applicant.addresses.municipality] || 0) + 1;
                }

                // Age groups
                if (applicant.age) {
                    if (applicant.age >= 18 && applicant.age <= 20) ageGroups["18-20"]++;
                    else if (applicant.age >= 21 && applicant.age <= 24) ageGroups["21-24"]++;
                    else if (applicant.age >= 25 && applicant.age <= 30) ageGroups["25-30"]++;
                    else if (applicant.age >= 31 && applicant.age <= 40) ageGroups["31-40"]++;
                    else if (applicant.age >= 41 && applicant.age <= 50) ageGroups["41-50"]++;
                    else if (applicant.age >= 51) ageGroups["51+"]++;
                }

                // Religion counts
                if (applicant.religion) {
                    religionCounts[applicant.religion] =
                        (religionCounts[applicant.religion] || 0) + 1;
                }
            });

            // Monthly data
            const month = new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        return {
            filteredApps,
            total: filteredApps.length,
            statusCounts,
            municipalityCounts,
            ageGroups,
            religionCounts,
            monthlyData,
            averageProcessingTime: calculateAverageProcessingTime(filteredApps)
        };
    }, [applications, selectedTimeframe]);

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="h-9 w-64 bg-zinc-200 rounded animate-pulse" />
                        <div className="h-4 w-80 bg-zinc-200 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-20 bg-zinc-200 rounded animate-pulse" />
                        <div className="h-9 w-20 bg-zinc-200 rounded animate-pulse" />
                        <div className="h-9 w-20 bg-zinc-200 rounded animate-pulse" />
                        <div className="h-9 w-24 bg-zinc-200 rounded animate-pulse" />
                    </div>
                </div>

                {/* Key Metrics Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                                <div className="h-4 w-4 bg-zinc-200 rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-zinc-200 rounded animate-pulse mb-1" />
                                <div className="h-3 w-20 bg-zinc-200 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 bg-zinc-200 rounded animate-pulse" />
                                    <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <div key={j} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 bg-zinc-200 rounded-full animate-pulse" />
                                            <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-8 bg-zinc-200 rounded animate-pulse" />
                                            <div className="h-3 w-8 bg-zinc-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Trends Skeleton */}
                <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-zinc-200 rounded animate-pulse" />
                            <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="text-center p-4 bg-zinc-50 rounded-2xl">
                                    <div className="h-8 w-8 bg-zinc-200 rounded animate-pulse mx-auto mb-2" />
                                    <div className="h-3 w-12 bg-zinc-200 rounded animate-pulse mx-auto" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-bold text-zinc-900">Failed to Load Reports</h2>
                <p className="text-zinc-500 text-center max-w-md">{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="mt-4"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Reports & Analytics</h1>
                    <p className="text-zinc-500 font-medium mt-2">Comprehensive insights into marriage license applications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-xl bg-zinc-100 p-1">
                        <Button
                            variant={selectedTimeframe === "all" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedTimeframe("all")}
                            className="rounded-lg"
                        >
                            All Time
                        </Button>
                        <Button
                            variant={selectedTimeframe === "month" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedTimeframe("month")}
                            className="rounded-lg"
                        >
                            Last Month
                        </Button>
                        <Button
                            variant={selectedTimeframe === "week" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedTimeframe("week")}
                            className="rounded-lg"
                        >
                            Last Week
                        </Button>
                    </div>
                    <ExportButton
                        data={stats.filteredApps}
                        metadata={{
                            generationDate: new Date().toLocaleString(),
                            timeframe: selectedTimeframe === "all" ? "All Time" :
                                selectedTimeframe === "month" ? "Last Month" : "Last Week",
                            totalRecords: stats.total
                        }}
                        stats={stats}
                        fileName="Marriage_License_Analytics"
                        variant="outline"
                        className="rounded-xl"
                    />
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">Total Applications</CardTitle>
                        <FileText className="h-4 w-4 text-zinc-900" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 tracking-tighter">{stats.total}</div>
                        <p className="text-xs text-zinc-500 mt-1">Marriage license applications</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">Avg Processing Time</CardTitle>
                        <Clock className="h-4 w-4 text-zinc-900" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 tracking-tighter">{stats.averageProcessingTime}</div>
                        <p className="text-xs text-zinc-500 mt-1">Days from submission</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">Completion Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 tracking-tighter">
                            {stats.total > 0 ? Math.round((stats.statusCounts.completed / stats.total) * 100) : 0}%
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Successfully processed</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">Active Municipalities</CardTitle>
                        <MapPin className="h-4 w-4 text-zinc-900" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-zinc-900 tracking-tighter">
                            {Object.keys(stats.municipalityCounts).length}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Areas represented</p>
                    </CardContent>
                </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-black text-zinc-900 uppercase tracking-tight">
                            <PieChart className="h-6 w-6" />
                            Application Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(stats.statusCounts).map(([status, count]) => {
                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            const statusConfig = getStatusConfig(status);

                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                                        <span className="text-sm font-semibold capitalize">{status}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-zinc-900">{count}</span>
                                        <span className="text-xs text-zinc-500 w-12 text-right">
                                            {Math.round(percentage)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-black text-zinc-900 uppercase tracking-tight">
                            <MapPin className="h-6 w-6" />
                            Top Municipalities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(stats.municipalityCounts)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 8)
                            .map(([municipality, count]) => (
                                <div key={municipality} className="flex items-center justify-between">
                                    <span className="text-sm font-semibold truncate max-w-[200px]">{municipality}</span>
                                    <Badge variant="secondary" className="font-bold">
                                        {count} applicants
                                    </Badge>
                                </div>
                            ))}
                    </CardContent>
                </Card>
            </div>

            {/* Age Distribution & Religion */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-black text-zinc-900 uppercase tracking-tight">
                            <Users className="h-6 w-6" />
                            Age Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(stats.ageGroups).map(([ageGroup, count]) => {
                            const percentage = Object.values(stats.ageGroups).reduce((a, b) => a + b, 0) > 0
                                ? (count / Object.values(stats.ageGroups).reduce((a, b) => a + b, 0)) * 100
                                : 0;

                            return (
                                <div key={ageGroup} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold">{ageGroup} years</span>
                                        <span className="font-bold">{count} ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-black text-zinc-900 uppercase tracking-tight">
                            <BarChart3 className="h-6 w-6" />
                            Religious Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(stats.religionCounts)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 6)
                            .map(([religion, count]) => (
                                <div key={religion} className="flex items-center justify-between">
                                    <span className="text-sm font-semibold capitalize">{religion}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 bg-zinc-200 rounded-full flex-1 w-16">
                                            <div
                                                className="h-full bg-zinc-900 rounded-full"
                                                style={{
                                                    width: `${Object.values(stats.religionCounts).reduce((a, b) => a + b, 0) > 0
                                                        ? (count / Object.values(stats.religionCounts).reduce((a, b) => a + b, 0)) * 100
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold w-8 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trends */}
            <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-black text-zinc-900 uppercase tracking-tight">
                        <TrendingUp className="h-6 w-6" />
                        Application Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(stats.monthlyData)
                            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                            .slice(-6)
                            .map(([month, count]) => (
                                <div key={month} className="text-center p-4 bg-zinc-50 rounded-2xl">
                                    <div className="text-2xl font-black text-zinc-900">{count}</div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{month}</div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function getStatusConfig(status: string) {
    const configs = {
        pending: { color: "bg-amber-400" },
        processing: { color: "bg-blue-500" },
        approved: { color: "bg-emerald-500" },
        completed: { color: "bg-green-600" },
        rejected: { color: "bg-red-500" }
    };
    return configs[status as keyof typeof configs] || configs.pending;
}

function calculateAverageProcessingTime(applications: Application[]): string {
    const completedApps = applications.filter(app => app.status?.toLowerCase() === 'completed');

    if (completedApps.length === 0) return "N/A";

    const totalDays = completedApps.reduce((sum, app) => {
        const created = new Date(app.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
    }, 0);

    return Math.round(totalDays / completedApps.length).toString();
}