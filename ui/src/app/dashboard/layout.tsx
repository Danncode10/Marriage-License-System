import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/utils/roles";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

// This layout will wrap all dashboard pages, providing the Sidebar and Header
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        const supabase = await createClient();

        if (!supabase) {
            console.error("Failed to create Supabase client");
            redirect("/login");
            return;
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error("Auth error in dashboard layout:", authError);
            redirect("/login");
            return;
        }

        if (!user) {
            console.log("No user found, redirecting to login");
            redirect("/login");
            return;
        }

        const profile = await getUserProfile();
        const userRole = profile?.role || "user";
        const userInitials = user.email?.split("@")[0].substring(0, 2).toUpperCase() || "US";

        return (
            <div className="flex min-h-screen bg-zinc-50 w-full overflow-hidden">
                {/* Sidebar - Persistent */}
                <Sidebar userRole={userRole} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <Header userInitials={userInitials} userRole={userRole} />

                    <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
                        {children}
                    </main>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error in dashboard layout:", error);
        redirect("/login");
    }
}
