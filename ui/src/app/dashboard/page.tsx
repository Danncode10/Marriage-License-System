import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/utils/roles";

export const dynamic = "force-dynamic";

export default async function DashboardRedirect() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();
  const role = profile?.role || "user";

  // Role-based redirection
  // Redirect to the main page of that role's dashboard
  if (role === 'admin') {
    redirect("/dashboard/admin");
  } else if (role === 'employee') {
    redirect("/dashboard/employee");
  } else {
    // Default to /dashboard/user for regular users
    redirect("/dashboard/user");
  }

  // This part is unreachable due to redirect
  return null;
}