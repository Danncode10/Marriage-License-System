import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Account Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" /> Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-900">Email Notifications</p>
                                <p className="text-sm text-zinc-500">Receive status updates via email.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-zinc-900">SMS Notifications</p>
                                <p className="text-sm text-zinc-500">Receive alerts via text message.</p>
                            </div>
                            <Switch disabled />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
