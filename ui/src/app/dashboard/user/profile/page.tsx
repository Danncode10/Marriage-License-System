import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { User, Mail, Shield } from "lucide-react";

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

    const userInitials = user.email?.split("@")[0].substring(0, 2).toUpperCase() || "US";

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Profile Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-zinc-100">
                        <Avatar className="h-24 w-24 text-2xl" fallback={userInitials} />
                        <Button variant="outline">Change Avatar</Button>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input className="pl-9" defaultValue={profile?.full_name || ""} placeholder="No name set" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input className="pl-9 bg-zinc-50" value={user.email} readOnly disabled />
                            </div>
                            <p className="text-xs text-zinc-500">Email cannot be changed.</p>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Role</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input className="pl-9 bg-zinc-50 capitalize" value={profile?.role || "User"} readOnly disabled />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-zinc-100 py-4 bg-zinc-50/50">
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
