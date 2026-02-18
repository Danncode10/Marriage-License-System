import { redirect } from "next/navigation";
import { getUserRole } from "@/utils/roles";
import UserDashboardClient from "./UserDashboardClient";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
    const role = await getUserRole();

    // If not a regular user, redirect to the main dashboard to let it handle proper routing
    if (role !== "user" && role !== null) {
        redirect("/dashboard");
    }

    // If role is null (user not logged in), the middleware or dashboard root should handle it,
    // but we can be safe:
    if (role === null) {
        redirect("/login");
    }

    return <UserDashboardClient />;
}
