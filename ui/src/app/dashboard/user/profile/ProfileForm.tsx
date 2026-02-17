"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { User, Mail, Shield, CheckCircle2 } from "lucide-react";
import { updateProfilePhoneNumber } from "./actions";
import { useState } from "react";

interface ProfileFormProps {
    profile: any;
    application: any;
    userEmail: string;
}

export function ProfileForm({ profile, application, userEmail }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const result = await updateProfilePhoneNumber(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Phone number updated successfully!' });
        } else if (result.error) {
            setMessage({ type: 'error', text: result.error });
        }

        setLoading(false);
    }

    return (
        <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[2rem] overflow-hidden">
            <form action={handleSubmit}>
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black text-zinc-900 uppercase tracking-tight">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                    <div className="grid gap-6">
                        {/* READ ONLY FULL NAME */}
                        <div className="grid gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-500 font-bold text-sm">
                                    {profile?.full_name || "Not set"}
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-400 italic px-1">Fetched from records and cannot be changed.</p>
                        </div>

                        {/* EDITABLE PHONE NUMBER */}
                        <div className="grid gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-zinc-400 border-r border-zinc-100 pr-3 transition-colors group-focus-within:border-primary group-focus-within:text-primary">
                                    <span className="text-[10px] font-black">+63</span>
                                </div>
                                <Input
                                    name="phoneNumber"
                                    className="pl-16 h-12 bg-white border-zinc-200 focus:border-primary rounded-2xl font-bold text-zinc-900 transition-all shadow-sm"
                                    placeholder="912 345 6789"
                                    defaultValue={application?.contact_number || profile?.phone_number || ""}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium px-1">This contact number is linked to your active marriage application.</p>
                        </div>

                        {/* READ ONLY EMAIL */}
                        <div className="grid gap-2 opacity-60">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                <div className="pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-400 font-bold text-sm">
                                    {userEmail}
                                </div>
                            </div>
                        </div>

                        {/* READ ONLY ROLE */}
                        <div className="grid gap-2 opacity-60">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Account Role</label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                <div className="pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-400 font-bold text-sm capitalize">
                                    {profile?.role || "User"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {message.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                            <p className="text-xs font-bold uppercase tracking-tight">{message.text}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-100 flex justify-between items-center">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</p>
                    <Button
                        disabled={loading}
                        className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
