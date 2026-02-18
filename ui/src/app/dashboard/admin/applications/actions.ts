"use server";

import { createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

export async function getAllApplications() {
    const supabase = await createAdminClient();

    const { data: apps, error } = await supabase
        .from("marriage_applications")
        .select(`
            *,
            applicants (
                first_name,
                last_name,
                type
            ),
            profiles!created_by (
                full_name,
                email
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("CRITICAL: Error fetching all applications:", error.message, error.details, error.hint);
        return [];
    }

    return (apps || []).map(app => {
        const applicants = Array.isArray(app.applicants) ? app.applicants : [];
        const groom = applicants.find((a: any) => a.type === 'groom');
        const bride = applicants.find((a: any) => a.type === 'bride');

        // Handle alias from join (can be single object or array depending on client version/join type)
        const profileData = (app as any).profiles;
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;

        return {
            ...app,
            groom_name: groom ? `${groom.first_name} ${groom.last_name}` : 'Unknown',
            bride_name: bride ? `${bride.first_name} ${bride.last_name}` : 'Unknown',
            submitted_by: profile?.full_name || profile?.email || 'Anonymous'
        };
    });
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from("marriage_applications")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", applicationId);

    if (error) {
        console.error("Error updating status:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/applications");
    revalidatePath("/dashboard/admin");
    return { success: true };
}
