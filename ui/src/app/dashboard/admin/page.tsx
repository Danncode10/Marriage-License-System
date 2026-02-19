import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
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
import { getAdminMetrics } from "./metrics";
import { Badge } from "@/components/ui/badge";
import { getUserRole } from "@/utils/roles";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const role = await getUserRole();

    if (role !== "admin") {
        redirect("/dashboard");
    }

    const metrics = await getAdminMetrics();

    return <AdminDashboardClient metrics={metrics} />;
}
