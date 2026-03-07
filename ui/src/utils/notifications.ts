import { createClient } from "@/utils/supabase/client";

export async function createTestNotification() {
    const supabase = createClient();
    
    if (!supabase) {
        return { success: false, error: "Failed to create database client" };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        return { success: false, error: "Not authenticated" };
    }

    // Create a test notification
    const { error } = await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_title: 'Test Notification',
        p_message: 'This is a test notification to verify the system is working.',
        p_type: 'system'
    });

    if (error) {
        console.error('Error creating test notification:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function createRegistryNotification(applicationId: string, registryNumber: string, applicationCode: string) {
    const supabase = createClient();
    
    if (!supabase) {
        return { success: false, error: "Failed to create database client" };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        return { success: false, error: "Not authenticated" };
    }

    // Create notification for staff member
    const { error: staffError } = await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_title: 'Registry Number Assigned',
        p_message: `You successfully added a registry number (${registryNumber}) for application (${applicationCode}). The application status has been updated to completed.`,
        p_type: 'registry_assigned',
        p_related_application_id: applicationId
    });

    if (staffError) {
        console.error('Error creating staff notification:', staffError);
        return { success: false, error: staffError.message };
    }

    return { success: true };
}

export async function createPickupNotification(userId: string, applicationCode: string, registryNumber: string, applicationId: string) {
    const supabase = createClient();
    
    if (!supabase) {
        return { success: false, error: "Failed to create database client" };
    }

    // Create notification for applicant
    const { error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: 'Application Completed',
        p_message: `Your application (${applicationCode}) is ready for pick up. Registry number: ${registryNumber}`,
        p_type: 'ready_for_pickup',
        p_related_application_id: applicationId
    });

    if (error) {
        console.error('Error creating pickup notification:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
