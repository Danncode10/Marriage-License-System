"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";
import { handleImageReplace } from "@/utils/supabase/storage-utils";

export async function getAllApplications(page: number = 1, limit: number = 50, statusFilter?: string) {
    const supabase = createAdminClient();

    const offset = (page - 1) * limit;

    // Get counts for all categories for the tabs
    const { data: countData, error: countError } = await supabase
        .from("marriage_applications")
        .select("status");

    if (countError) {
        console.error("Error getting counts:", countError);
    }

    const allCounts = { all: 0, pending: 0, approved: 0, completed: 0, rejected: 0, deleted: 0 };
    if (countData) {
        countData.forEach(row => {
            const s = (row.status || 'pending').toLowerCase();
            // Total 'all' should probably exclude deleted records to keep management clean, 
            // or include them if that's what the user wants. 
            // User said "i should see 5 branched: all, pending, approve, complete, and rejected" earlier.
            // Now adding a 6th: Deleted.
            if (s !== 'deleted') allCounts.all++;

            if (s === "pending" || s === "submitted" || s === "processing" || s === "draft") allCounts.pending++;
            else if (s === "approved") allCounts.approved++;
            else if (s === "completed") allCounts.completed++;
            else if (s === "rejected") allCounts.rejected++;
            else if (s === "deleted") allCounts.deleted++;
        });
    }

    let query = supabase.from("marriage_applications").select("*", { count: "exact" });

    // Auto-purge applications deleted for more than 1 week
    await purgeDeletedApplications();

    // Handle status filtering
    if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'pending') {
            query = query.in('status', ['pending', 'submitted', 'processing', 'draft']);
        } else {
            query = query.eq('status', statusFilter);
        }
    } else {
        // By default (All tab), exclude deleted applications
        query = query.neq('status', 'deleted');
    }

    // Get table data with count
    const { data: apps, count: totalCount, error } = await query
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
                birth_place,
                citizenship,
                religion,
                father_name,
                mother_name,
                giver_name,
                giver_relationship,
                giver_suffix,
                include_id,
                id_type,
                id_no,
                giver_include_id,
                giver_id_type,
                giver_id_no,
                is_not_born_in_ph,
                birth_country,
                addresses (
                    barangay,
                    municipality,
                    province,
                    country,
                    is_foreigner
                )
            ),
            application_photos (id)
        `)
        .order("created_at", { ascending: true })
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

        const photos = Array.isArray(app.application_photos) ? app.application_photos : [];
        const hasPhoto = photos.length > 0;

        return {
            ...app,
            groom_name: groom ? `${groom.first_name} ${groom.last_name}` : 'Unknown',
            bride_name: bride ? `${bride.first_name} ${bride.last_name}` : 'Unknown',
            submitted_by: submittedBy,
            groom: groom || null,
            bride: bride || null,
            has_photo: hasPhoto
        };
    });

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return {
        apps: processedApps,
        totalCount: totalCount || 0,
        totalPages,
        currentPage: page,
        limit,
        allCounts
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

    // Restriction 1: Cannot mark as "approved" if no photo exists
    if (newStatus === "approved") {
        const { count, error: photoError } = await supabase
            .from("application_photos")
            .select("id", { count: 'exact', head: true })
            .eq("application_id", applicationId);

        if (photoError) {
            console.error("Error checking photo for status update:", photoError);
            return { success: false, error: "Failed to verify application photo." };
        }

        if (!count || count === 0) {
            return { success: false, error: "Application cannot be approved without a couple photo. Use the Camera icon to capture a photo first." };
        }
    }

    // Restriction 2: Cannot mark as "completed" if no registry code/number
    if (newStatus === "completed") {
        const { data: registryCheck, error: registryError } = await supabase
            .from("marriage_applications")
            .select("registry_number")
            .eq("id", applicationId)
            .single();

        if (registryError) {
            console.error("Error checking registry number for status update:", registryError);
            return { success: false, error: "Failed to verify registry number." };
        }

        if (!registryCheck.registry_number) {
            return { success: false, error: "Application cannot be marked as completed without a Registry Number. Use the Registry icon to assign one first." };
        }
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

export async function updateRegistryNumber(applicationId: string, registryCode: string) {
    console.log("updateRegistryNumber called with:", { applicationId, registryCode });

    const role = await getCurrentUserRole();
    if (!role || !(['admin', 'employee'].includes(role))) {
        return { success: false, error: "Unauthorized: Only staff can edit registry numbers." };
    }

    const supabase = createAdminClient();

    // Verify photo exists before allowing registry number
    const { count, error: photoCheckError } = await supabase
        .from("application_photos")
        .select("id", { count: 'exact', head: true })
        .eq("application_id", applicationId);

    if (photoCheckError) {
        console.error("Error checking for photo:", photoCheckError);
        return { success: false, error: "Failed to verify application photo." };
    }

    if (!count || count === 0) {
        return { success: false, error: "Cannot assign registry number: Application photo has not been submitted yet." };
    }

    // Get current year
    const year = new Date().getFullYear();
    const fullRegistryNumber = `${year}-${registryCode}`;

    // Check if registry number already exists
    const { data: existingApp, error: checkError } = await supabase
        .from("marriage_applications")
        .select("application_code")
        .eq("registry_number", fullRegistryNumber)
        .neq("id", applicationId)
        .maybeSingle();

    if (checkError) {
        console.error("Error checking for duplicate registry number:", checkError);
    }

    if (existingApp) {
        return {
            success: false,
            error: `Registry Number "${fullRegistryNumber}" is already assigned to application ${existingApp.application_code}. Please use a different code.`
        };
    }

    // Update registry number and mark as completed
    const { data, error } = await supabase
        .from("marriage_applications")
        .update({
            registry_number: fullRegistryNumber,
            status: 'completed',
            updated_at: new Date().toISOString()
        })
        .eq("id", applicationId)
        .select();

    if (error) {
        console.error("Error updating registry number:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/applications");
    revalidatePath("/dashboard/admin");
    return { success: true, registryNumber: fullRegistryNumber };
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
                        country: formData[`${prefix}Country`] || "Philippines",
                        is_foreigner: !!formData[`${prefix}IsForeigner`],
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
                    citizenship: formData[`${prefix}Citizen`] ?? null,
                    birth_place: formData[`${prefix}BirthPlace`],
                    is_not_born_in_ph: !!formData[`${prefix}IsNotBornInPh`],
                    birth_country: formData[`${prefix}BirthCountry`] || "Philippines",
                    religion: formData[`${prefix}Religion`] === "Others" ? formData[`${prefix}CustomReligion`] : formData[`${prefix}Religion`],
                    father_name: `${formData[`${prefix}FathF`]} ${formData[`${prefix}FathM`]} ${formData[`${prefix}FathL`]}`.trim(),
                    mother_name: `${formData[`${prefix}MothF`]} ${formData[`${prefix}MothM`]} ${formData[`${prefix}MothL`]}`.trim(),
                    giver_name: `${formData[`${prefix}GiverF`]} ${formData[`${prefix}GiverM`]} ${formData[`${prefix}GiverL`]}`.trim(),
                    giver_suffix: formData[`${prefix}GiverSuffix`] === "Others" ? formData[`${prefix}GiverCustomSuffix`] : formData[`${prefix}GiverSuffix`],
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

export async function getCurrentUserRole() {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) return null;

    return profile.role;
}

export async function deleteApplication(applicationId: string) {
    console.log("deleteApplication called with:", { applicationId });

    const role = await getCurrentUserRole();
    if (role !== 'admin') {
        return { success: false, error: "Unauthorized: Only ADMIN can delete applications." };
    }

    const supabase = createAdminClient();

    // Check if it's already deleted (for permanent deletion)
    const { data: currentApp } = await supabase
        .from("marriage_applications")
        .select("status")
        .eq("id", applicationId)
        .single();

    if (currentApp?.status === 'deleted') {
        // Permanent deletion if already in deleted status (e.g. from Deleted tab)
        const { error } = await supabase
            .from("marriage_applications")
            .delete()
            .eq("id", applicationId);

        if (error) {
            console.error("Error permanently deleting application:", error);
            return { success: false, error: error.message };
        }
    } else {
        // Soft deletion
        const { error } = await supabase
            .from("marriage_applications")
            .update({
                status: 'deleted',
                updated_at: new Date().toISOString()
            })
            .eq("id", applicationId);

        if (error) {
            console.error("Error soft deleting application:", error);
            return { success: false, error: error.message };
        }
    }

    revalidatePath("/dashboard/admin/applications");
    revalidatePath("/dashboard/admin");
    return { success: true };
}

export async function restoreApplication(applicationId: string) {
    console.log("restoreApplication called with:", { applicationId });

    const role = await getCurrentUserRole();
    if (role !== 'admin') {
        return { success: false, error: "Unauthorized: Only ADMIN can restore applications." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from("marriage_applications")
        .update({
            status: 'pending',
            updated_at: new Date().toISOString()
        })
        .eq("id", applicationId);

    if (error) {
        console.error("Error restoring application:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/applications");
    revalidatePath("/dashboard/admin");
    return { success: true };
}

export async function purgeDeletedApplications() {
    const supabase = createAdminClient();

    // Applications in 'deleted' status for more than 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { error } = await supabase
        .from("marriage_applications")
        .delete()
        .eq("status", "deleted")
        .lt("updated_at", oneWeekAgo.toISOString());

    if (error) {
        console.error("Error purging old deleted applications:", error);
    }
}
