import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Placeholder for notifications
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Notifications</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-zinc-500">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900">No New Notifications</h3>
                        <p>Updates about your application status will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
