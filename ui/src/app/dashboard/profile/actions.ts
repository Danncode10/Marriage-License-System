"use server";

import { createClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

export async function updateProfilePhoneNumber(formData: FormData) {
    const supabase = await createClient();
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
