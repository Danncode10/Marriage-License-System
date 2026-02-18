import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    FileCheck,
    Search,
    Camera,
    Printer
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUserRole } from "@/utils/roles";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboard() {
    const role = await getUserRole();

    if (role !== "employee") {
        redirect("/dashboard");
    }

    // Placeholder for Employee Dashboard
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Employee Workspace</h1>
                    <p className="text-zinc-500 mt-1">Process applications and manage documents.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Print Logs
                    </Button>
                    <Button>
                        <Camera className="mr-2 h-4 w-4" /> Open Camera
                    </Button>
                </div>
            </div>

            <Card className="p-6 bg-blue-50/50 border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5" /> Process Application
                </h3>
                <div className="flex gap-4">
                    <Input placeholder="Enter Application Code (e.g., 123456)" className="bg-white border-blue-200" />
                    <Button>Process</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <FileCheck className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-zinc-500">Waitlisted items</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="border border-zinc-100 rounded-lg p-8 text-center bg-zinc-50">
                    <p className="text-zinc-500">No recent applications processed.</p>
                </div>
            </div>
        </div>
    );
}
