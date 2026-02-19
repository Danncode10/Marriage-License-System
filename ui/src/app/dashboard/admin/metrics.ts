"use server";

import { createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

export interface SystemMetrics {
    totalUsers: number;
    totalStaff: number;
    activeStaff: number;
    applicationStats: {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        rejected: number;
    };
    recentActivity: {
        id: string;
        action: string;
        details: any;
        created_at: string;
        user_name?: string;
    }[];
}

export async function getAdminMetrics(): Promise<SystemMetrics> {
    const supabase = await createAdminClient();

    // 1. Fetch Total Users (excluding staff)
    const { count: userCount, error: userError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");

    // 2. Fetch Staff details
    const { count: staffCount, error: staffError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("role", ["admin", "employee"]);

    // 3. Fetch Application Breakdown
    const { data: apps, error: appError } = await supabase
        .from("marriage_applications")
        .select("status");

    const appStats = {
        total: apps?.length || 0,
        pending: apps?.filter(a => a.status === 'pending').length || 0,
        processing: apps?.filter(a => a.status === 'processing').length || 0,
        completed: apps?.filter(a => a.status === 'completed' || a.status === 'issued' || a.status === 'approved').length || 0,
        rejected: apps?.filter(a => a.status === 'rejected').length || 0,
    };

    // 4. Recent Audit Logs
    const { data: logs, error: logError } = await supabase
        .from("audit_logs")
        .select("*, profiles!audit_logs_user_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        totalUsers: userCount || 0,
        totalStaff: staffCount || 0,
        activeStaff: 0, // Placeholder for real-time presence
        applicationStats: appStats,
        recentActivity: (logs || []).map(log => ({
            id: log.id,
            action: log.action,
            details: log.details,
            created_at: log.created_at,
            user_name: (log.profiles as any)?.full_name || 'System'
        }))
    };
}
