"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";
import { handleImageReplace } from "@/utils/supabase/storage-utils";

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
            submitter:profiles!created_by(full_name),
            processor:profiles!processed_by(full_name),
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
                giver_name,
                giver_relationship,
                include_id,
                id_type,
                id_no,
                giver_include_id,
                giver_id_type,
                giver_id_no,
                addresses (
                    barangay,
                    municipality,
                    province
                )
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

        // Use the submitter's name if available, otherwise use the processor's name (for walk-ins)
        const submittedBy = (app as any).submitter?.full_name || (app as any).processor?.full_name || 'Walk-in / Anonymous';

        return {
            ...app,
            groom_name: groom ? `${groom.first_name} ${groom.last_name}` : 'Unknown',
            bride_name: bride ? `${bride.first_name} ${bride.last_name}` : 'Unknown',
            submitted_by: submittedBy,
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

    // Get application details before update
    const { data: appData, error: fetchError } = await supabase
        .from("marriage_applications")
        .select(`
            id,
            application_code,
            created_by,
            status
        `)
        .eq("id", applicationId)
        .single();

    if (fetchError) {
        console.error("Error fetching application:", fetchError);
        return { success: false, error: fetchError.message };
    }

    console.log("Application data:", appData);

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

    // Create notification for the user who created the application
    if (appData.created_by) {
        try {
            console.log("Creating notification for user:", appData.created_by, "application:", appData.application_code);
            const { data: notificationResult, error: notificationError } = await supabase.rpc('create_notification', {
                p_user_id: appData.created_by,
                p_title: 'Application Status Updated',
                p_message: `Your marriage license application (${appData.application_code}) status has been changed to ${newStatus}.`,
                p_type: 'status_change',
                p_related_application_id: applicationId
            });

            if (notificationError) {
                console.error("Error creating notification:", notificationError);
            } else {
                console.log("Notification created successfully:", notificationResult);
            }
        } catch (err) {
            console.error("Failed to create notification:", err);
        }
    }

    revalidatePath("/dashboard/admin/applications");
    revalidatePath("/dashboard/admin");
    return { success: true };
}

export async function uploadApplicationPhoto(formData: FormData) {
    // IMPORTANT: Always check for null after createClient() - TypeScript requires this
    // DO NOT REMOVE THIS NULL CHECK - it prevents 'supabase' is possibly 'null' errors
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

    // Find application by code with applicant details
    const { data: app, error: appError } = await adminSupabase
        .from("marriage_applications")
        .select(`
            id,
            application_code,
            applicants (
                first_name,
                last_name,
                type
            )
        `)
        .eq("application_code", applicationCode.toUpperCase())
        .single();

    if (appError || !app) {
        return { success: false, error: "Application not found" };
    }

    // Robustly handle image replacement in storage (using admin client to bypass RLS)
    const storageResult = await handleImageReplace(
        adminSupabase,
        photoFile,
        "marriage-license-files",
        applicationCode.toUpperCase()
    );

    if (!storageResult.success || !storageResult.path) {
        return { success: false, error: storageResult.error || "Upload failed" };
    }

    const filePath = storageResult.path;

    // Upsert record: This ensures we only ever have ONE record per app/type
    const { error: insertError } = await adminSupabase
        .from("application_photos")
        .upsert({
            application_id: app.id,
            photo_type: photoType,
            file_path: filePath,
            file_size: photoFile.size,
            uploaded_by: user.id,
            uploaded_at: new Date().toISOString()
        }, {
            onConflict: 'application_id,photo_type'
        });

    if (insertError) {
        console.error("Insert error:", insertError);
        // Try to delete the uploaded file
        await supabase.storage
            .from("marriage-license-files")
            .remove([filePath]);
        return { success: false, error: "Failed to save photo record" };
    }

    // Get application details before status update
    const { data: appDetails, error: appDetailsError } = await adminSupabase
        .from("marriage_applications")
        .select("created_by, application_code")
        .eq("id", app.id)
        .single();

    // Update application status to approved
    const { error: statusError } = await adminSupabase
        .from("marriage_applications")
        .update({
            status: "approved",
            updated_at: new Date().toISOString(),
            processed_by: user.id
        })
        .eq("id", app.id);

    if (statusError) {
        console.error("Error updating application status:", statusError);
        // Don't return error here as photo upload was successful
        // Status update failure shouldn't block the photo upload success
    }

    // Create notifications
    if (appDetails && appDetails.created_by) {
        try {
            // Notification for the user whose application was processed
            const { error: userNotificationError } = await adminSupabase.rpc('create_notification', {
                p_user_id: appDetails.created_by,
                p_title: 'Photo Captured - Application Approved',
                p_message: `A photo has been captured for your marriage license application (${appDetails.application_code}). Your application has been approved and is ready for issuance.`,
                p_type: 'photo_captured',
                p_related_application_id: app.id
            });

            if (userNotificationError) {
                console.error("Error creating user notification (table may not exist yet):", userNotificationError);
            }

            // Notification for the employee who captured the photo
            const { error: employeeNotificationError } = await adminSupabase.rpc('create_notification', {
                p_user_id: user.id,
                p_title: 'Photo Capture Completed',
                p_message: `You successfully captured a photo for application ${appDetails.application_code}. The application status has been updated to approved.`,
                p_type: 'photo_captured',
                p_related_application_id: app.id
            });

            if (employeeNotificationError) {
                console.error("Error creating employee notification (table may not exist yet):", employeeNotificationError);
            }
        } catch (err) {
            console.error("Failed to create notifications:", err);
        }
    }

    // Get applicant names for success message
    const applicants = Array.isArray(app.applicants) ? app.applicants : [];
    const groom = applicants.find((a: { type: string; first_name: string; last_name: string }) => a.type === 'groom');
    const bride = applicants.find((a: { type: string; first_name: string; last_name: string }) => a.type === 'bride');
    const groomName = groom ? `${groom.first_name} ${groom.last_name}` : 'Unknown';
    const brideName = bride ? `${bride.first_name} ${bride.last_name}` : 'Unknown';

    revalidatePath("/dashboard/admin/applications");
    return {
        success: true,
        applicationCode: app.application_code,
        groomName,
        brideName
    };
}

export async function updateApplicationDetails(applicationId: string, formData: any) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    if (!supabase) return { success: false, error: "Failed to create database client" };

    // Check if current user is admin or employee
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: "Not authenticated" };

    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !(['admin', 'employee'].includes(profile.role))) {
        return { success: false, error: "Unauthorized: Only staff can edit submitted applications." };
    }

    try {
        // 1. Update marriage_applications table
        const { error: appError } = await adminSupabase
            .from("marriage_applications")
            .update({
                contact_number: formData.contactNumber,
                updated_at: new Date().toISOString()
            })
            .eq("id", applicationId);

        if (appError) throw appError;

        // 2. Update applicants and their addresses
        const types = ['groom', 'bride'] as const;
        for (const type of types) {
            const prefix = type === 'groom' ? 'g' : 'b';

            // Get current applicant to get address_id
            const { data: applicant, error: applicantFetchError } = await adminSupabase
                .from("applicants")
                .select("address_id")
                .eq("application_id", applicationId)
                .eq("type", type)
                .single();

            if (applicantFetchError) throw applicantFetchError;

            // Update Address
            if (applicant.address_id) {
                const { error: addressError } = await adminSupabase
                    .from("addresses")
                    .update({
                        barangay: formData[`${prefix}Brgy`],
                        municipality: formData[`${prefix}Town`],
                        province: formData[`${prefix}Prov`],
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", applicant.address_id);

                if (addressError) throw addressError;
            }

            // Update Applicant
            const { error: updateApplicantError } = await adminSupabase
                .from("applicants")
                .update({
                    first_name: formData[`${prefix}First`],
                    middle_name: formData[`${prefix}Middle`],
                    last_name: formData[`${prefix}Last`],
                    suffix: formData[`${prefix}Suffix`] === "Others" ? formData[`${prefix}CustomSuffix`] : formData[`${prefix}Suffix`],
                    birth_date: formData[`${prefix}Bday`],
                    age: formData[`${prefix}Age`],
                    religion: formData[`${prefix}Religion`] === "Others" ? formData[`${prefix}CustomReligion`] : formData[`${prefix}Religion`],
                    father_name: `${formData[`${prefix}FathF`]} ${formData[`${prefix}FathM`]} ${formData[`${prefix}FathL`]}`.trim(),
                    mother_name: `${formData[`${prefix}MothF`]} ${formData[`${prefix}MothM`]} ${formData[`${prefix}MothL`]}`.trim(),
                    giver_name: `${formData[`${prefix}GiverF`]} ${formData[`${prefix}GiverM`]} ${formData[`${prefix}GiverL`]}`.trim(),
                    giver_relationship: formData[`${prefix}GiverRelation`] === "Other" ? formData[`${prefix}GiverOtherTitle`] : formData[`${prefix}GiverRelation`],

                    // ID fields
                    include_id: formData[`${prefix}IncludeId`],
                    id_type: formData[`${prefix}IdType`] === "Others" ? formData[`${prefix}IdCustomType`] : formData[`${prefix}IdType`],
                    id_no: formData[`${prefix}IdNo`],
                    giver_include_id: formData[`${prefix}GiverIncludeId`],
                    giver_id_type: formData[`${prefix}GiverIdType`] === "Others" ? formData[`${prefix}GiverIdCustomType`] : formData[`${prefix}GiverIdType`],
                    giver_id_no: formData[`${prefix}GiverIdNo`],

                    updated_at: new Date().toISOString()
                })
                .eq("application_id", applicationId)
                .eq("type", type);

            if (updateApplicantError) throw updateApplicantError;
        }

        revalidatePath("/dashboard/admin/applications");
        revalidatePath("/dashboard/user");
        return { success: true };

    } catch (error: any) {
        console.error("Error updating application details:", error);
        return { success: false, error: error.message };
    }
}
