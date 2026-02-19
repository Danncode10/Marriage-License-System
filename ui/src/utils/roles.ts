import { createClient } from "@/utils/supabase/server-utils"; // Adjust import if needed

export async function getUserRole() {
    const supabase = await createClient();
    if (!supabase) return "user";

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return "user";

    // Check public.profiles first
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return profile?.role ?? "user";
}

export async function getUserProfile() {
    const supabase = await createClient();
    if (!supabase) {
        return {
            id: 'unknown',
            role: 'user',
            full_name: 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            id: 'unknown',
            role: 'user',
            full_name: 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        // Return a default profile if not found
        return {
            id: user.id,
            role: 'user',
            full_name: user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    return profile;
}

export async function checkRole(requiredRole: string) {
    const role = await getUserRole();
    return role === requiredRole;
}
