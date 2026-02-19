"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Users,
    ShieldCheck,
    Activity,
    Clock,
    CheckCircle2,
    ArrowRight,
    Search,
    FileText,
    BarChart,
    ChevronRight,
    Camera
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminCameraModal from "./AdminCameraModal";

interface AdminDashboardClientProps {
    metrics: {
        totalUsers: number;
        totalStaff: number;
        applicationStats: {
            pending: number;
            processing: number;
            completed: number;
            total: number;
        };
    };
}

export default function AdminDashboardClient({ metrics }: AdminDashboardClientProps) {
    const [showCameraModal, setShowCameraModal] = useState(false);

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header - Matching Theme from 7773a9cc */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Admin Dashboard</h1>
                        <p className="text-sm text-zinc-500 font-medium tracking-tight">System control and monitoring interface</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/admin/staff">
                            <Button className="rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-[10px] bg-zinc-900 hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                                <ShieldCheck className="mr-2 h-4 w-4" /> Manage Staff
                            </Button>
                        </Link>
                        <Link href="/dashboard/admin/applications">
                            <Button variant="outline" className="rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-[10px] border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95">
                                <FileText className="mr-2 h-4 w-4" /> Applications
                            </Button>
                        </Link>
                        <Link href="/dashboard/admin/reports">
                            <Button variant="outline" className="rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-[10px] border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95">
                                <BarChart className="mr-2 h-4 w-4" /> Reports
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Metrics Grid - Layout from 7773a9cc with Real Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden group hover:border-zinc-200 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Residents</CardTitle>
                            <Users className="h-4 w-4 text-zinc-900 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-zinc-900 tracking-tighter">{metrics.totalUsers}</div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">+12% vs last month</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden group hover:border-zinc-200 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Staff Officers</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-zinc-900 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-zinc-900 tracking-tighter">{metrics.totalStaff}</div>
                            <Badge className="bg-zinc-50 text-zinc-400 border-none font-black text-[9px] uppercase mt-2">Active Patrol</Badge>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden group hover:border-zinc-200 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pending Apps</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-zinc-900 tracking-tighter">{metrics.applicationStats.pending}</div>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Requires Action</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden group hover:border-zinc-200 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Completed</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-zinc-900 tracking-tighter">{metrics.applicationStats.completed}</div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Growth 100%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        onClick={() => setShowCameraModal(true)}
                        className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden group hover:border-zinc-200 transition-all duration-300 cursor-pointer"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Photo Capture</CardTitle>
                            <Camera className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-zinc-900 tracking-tighter">-</div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Quick Access</p>
                        </CardContent>
                    </Card>
                </div>

                {/* System Analytics Section - Layout from 7773a9cc */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                        <div className="p-8 pb-4">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
                                        <BarChart className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Application Pipeline</h3>
                                </div>
                                <Link href="/dashboard/admin/applications">
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 group">
                                        Oversight <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="space-y-8 max-w-4xl">
                                {[
                                    { status: "Pending Verification", count: metrics.applicationStats.pending, color: "bg-amber-400", total: metrics.applicationStats.total },
                                    { status: "Under Staff Review", count: metrics.applicationStats.processing, color: "bg-blue-600", total: metrics.applicationStats.total },
                                    { status: "Issued Licenses", count: metrics.applicationStats.completed, color: "bg-zinc-900", total: metrics.applicationStats.total }
                                ].map((row, i) => {
                                    const percentage = row.total > 0 ? (row.count / row.total) * 100 : 0;
                                    return (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{row.status}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-2xl font-black text-zinc-900 tracking-tighter tabular-nums">{row.count}</p>
                                                    <p className="text-[10px] font-bold text-zinc-300">({Math.round(percentage)}%)</p>
                                                </div>
                                            </div>
                                            <div className="h-3 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100/50">
                                                <div
                                                    className={`h-full ${row.color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                                    style={{ width: `${Math.max(percentage, 2)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-12 pt-8 border-t border-zinc-50 flex flex-col sm:flex-row gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Integrity</p>
                                        <p className="text-sm font-bold text-zinc-900 uppercase">Operational</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <AdminCameraModal
                isOpen={showCameraModal}
                onClose={() => setShowCameraModal(false)}
            />
        </>
    );
}