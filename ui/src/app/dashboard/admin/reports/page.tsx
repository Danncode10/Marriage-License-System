import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { getUserRole } from "@/utils/roles";
import AdminReportsClient from "./AdminReportsClient";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
    const role = await getUserRole();

    if (role !== "admin") {
        redirect("/dashboard");
    }

    // Get data for reports
    const supabase = await createClient();

    // Fetch all applications with applicant data
    const { data: applications, error: appsError } = await supabase
        .from("marriage_applications")
        .select(`
            *,
            applicants (
                *,
                addresses (*)
            )
        `)
        .order("created_at", { ascending: false });

    if (appsError) {
        console.error("Error fetching applications for reports:", appsError);
    }

    return <AdminReportsClient applications={applications || []} />;
}