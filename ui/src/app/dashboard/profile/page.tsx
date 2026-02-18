import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch full profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch marriage application for contact number
    const { data: application } = await supabase
        .from("marriage_applications")
        .select("contact_number")
        .eq("created_by", user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return (
        <div className="max-w-2xl mx-auto space-y-12 py-4">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Profile Settings</h1>
                <p className="text-zinc-500 font-medium">Manage your personal information and contact details.</p>
            </div>

            <ProfileForm
                profile={profile}
                application={application}
                userEmail={user.email || ""}
            />
        </div>
    );
}
