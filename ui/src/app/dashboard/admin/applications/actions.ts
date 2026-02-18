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
            profiles!marriage_applications_created_by_fkey (
                full_name,
                email
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching all applications:", error);
        return [];
    }

    return apps.map(app => {
        const groom = app.applicants.find((a: any) => a.type === 'groom');
        const bride = app.applicants.find((a: any) => a.type === 'bride');

        return {
            ...app,
            groom_name: groom ? `${groom.first_name} ${groom.last_name}` : 'Unknown',
            bride_name: bride ? `${bride.first_name} ${bride.last_name}` : 'Unknown',
            submitted_by: (app.profiles as any)?.full_name || (app.profiles as any)?.email || 'Anonymous'
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
