"use server";

import { createClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

export async function updateProfilePhoneNumber(formData: FormData) {
    // IMPORTANT: Always check for null after createClient() - TypeScript requires this
    // DO NOT REMOVE THIS NULL CHECK - it prevents 'supabase' is possibly 'null' errors
    const supabase = await createClient();

    if (!supabase) {
        console.error("Failed to create Supabase client");
        return { error: "Database connection failed" };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const phoneNumber = formData.get("phoneNumber") as string;

    // Update profile
    const { error: profileError } = await supabase
        .from("profiles")
        .update({ phone_number: phoneNumber })
        .eq("id", user.id);

    if (profileError) {
        console.error("Profile update error:", profileError);
        return { error: profileError.message };
    }

    // Update marriage application if it exists
    const { error: appError } = await supabase
        .from("marriage_applications")
        .update({ contact_number: phoneNumber })
        .eq("created_by", user.id);

    if (appError) {
        console.error("Application update error:", appError);
        // We don't necessarily return error here if profile update succeeded, 
        // but for robustness we might want to.
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();

    if (!supabase) {
        console.error("Failed to create Supabase client");
        return { error: "Database connection failed" };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 6) {
        return { error: "Password must be at least 6 characters long" };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        console.error("Password update error:", error);
        return { error: error.message };
    }

    return { success: true };
}
