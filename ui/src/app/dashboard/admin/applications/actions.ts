"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

export async function getAllApplications(page: number = 1, limit: number = 50) {
    const supabase = createAdminClient();

    const offset = (page - 1) * limit;

    // Get total count first
    const { count: totalCount, error: countError } = await supabase
        .from("marriage_applications")
        .select("*", { count: "exact", head: true });

    if (countError) {
        console.error("Error getting total count:", countError);
        return { apps: [], totalCount: 0, totalPages: 0 };
    }

    // Get paginated data
    const { data: apps, error } = await supabase
        .from("marriage_applications")
        .select(`
            *,
            applicants (
                id,
                first_name,
                middle_name,
                last_name,
                suffix,
                type,
                birth_date,
                age,
                citizenship,
                religion,
                father_name,
                mother_name,
                addresses (
                    barangay,
                    municipality,
                    province
                )
            ),
            profiles!created_by (
                full_name
            )
        `)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error("CRITICAL: Error fetching applications:", error.message, error.details, error.hint);
        return { apps: [], totalCount: 0, totalPages: 0 };
    }

    const processedApps = (apps || []).map(app => {
        const applicants = Array.isArray(app.applicants) ? app.applicants : [];
        const groom = applicants.find((a: any) => a.type === 'groom');
        const bride = applicants.find((a: any) => a.type === 'bride');

        const profileData = (app as any).profiles;
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;

        return {
            ...app,
            groom_name: groom ? `${groom.first_name} ${groom.last_name}` : 'Unknown',
            bride_name: bride ? `${bride.first_name} ${bride.last_name}` : 'Unknown',
            submitted_by: profile?.full_name || 'Anonymous',
            groom: groom || null,
            bride: bride || null,
        };
    });

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return {
        apps: processedApps,
        totalCount: totalCount || 0,
        totalPages,
        currentPage: page,
        limit
    };
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
    console.log("updateApplicationStatus called with:", { applicationId, newStatus });

    const supabase = createAdminClient();
    console.log("Admin client created");

    const { data, error } = await supabase
        .from("marriage_applications")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", applicationId)
        .select();

    console.log("Update result:", { data, error });

    if (error) {
        console.error("Error updating status:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/applications");
    revalidatePath("/dashboard/admin");
    return { success: true };
}

export async function uploadApplicationPhoto(formData: FormData) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    if (!supabase) {
        return { success: false, error: "Failed to create database client" };
    }

    const applicationCode = formData.get("applicationCode") as string;
    const photoType = formData.get("photoType") as string;
    const photoFile = formData.get("photo") as File;

    if (!applicationCode || !photoType || !photoFile) {
        return { success: false, error: "Missing required fields" };
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { success: false, error: "Not authenticated" };
    }

    // Find application by code
    const { data: app, error: appError } = await adminSupabase
        .from("marriage_applications")
        .select("id")
        .eq("application_code", applicationCode.toUpperCase())
        .single();

    if (appError || !app) {
        return { success: false, error: "Application not found" };
    }

    // Delete any existing photo records for this application (file will be overwritten)
    const { error: deleteDbError } = await adminSupabase
        .from("application_photos")
        .delete()
        .eq("application_id", app.id);

    if (deleteDbError) {
        console.error("Error deleting old photo records:", deleteDbError);
        return { success: false, error: "Failed to delete old photo records" };
    }

    console.log("Old photo records deleted from database successfully");

    // Upload new file to storage (use application code as filename for consistent replacement)
    const fileName = `${applicationCode.toUpperCase()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("marriage-license-files")
        .upload(fileName, photoFile, {
            contentType: "image/jpeg",
            upsert: true
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, error: "Failed to upload photo" };
    }

    // Insert new record
    const { error: insertError } = await adminSupabase
        .from("application_photos")
        .insert({
            application_id: app.id,
            photo_type: photoType,
            file_path: uploadData.path,
            file_size: photoFile.size,
            uploaded_by: user.id
        });

    if (insertError) {
        console.error("Insert error:", insertError);
        // Try to delete the uploaded file
        await supabase.storage
            .from("marriage-license-files")
            .remove([uploadData.path]);
        return { success: false, error: "Failed to save photo record" };
    }

    revalidatePath("/dashboard/admin/applications");
    return { success: true };
}
