"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { User, Mail, Shield, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { updateProfilePhoneNumber, updatePassword } from "./actions";
import { useState, useRef } from "react";

interface ProfileFormProps {
    profile: any;
    application: any;
    userEmail: string;
}

export function ProfileForm({ profile, application, userEmail }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const passwordFormRef = useRef<HTMLFormElement>(null);

    const currentPhone = application?.contact_number || profile?.phone_number || "Not set";

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const result = await updateProfilePhoneNumber(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Phone number updated successfully!' });
            setIsEditing(false);
        } else if (result.error) {
            setMessage({ type: 'error', text: result.error });
        }

        setLoading(false);
    }

    async function handlePasswordSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const result = await updatePassword(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setIsChangingPassword(false);
            passwordFormRef.current?.reset();
        } else if (result.error) {
            setMessage({ type: 'error', text: result.error });
        }

        setLoading(false);
    }

    return (
        <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-zinc-900 uppercase tracking-tight">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
                <div className="grid gap-8">
                    {/* PHONE NUMBER SECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Primary Contact Number</label>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                                >
                                    Edit Number
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form action={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-zinc-400 border-r border-zinc-100 pr-3 transition-colors group-focus-within:border-primary group-focus-within:text-primary">
                                        <span className="text-[10px] font-black">+63</span>
                                    </div>
                                    <Input
                                        name="phoneNumber"
                                        autoFocus
                                        className="pl-16 h-14 bg-white border-primary/20 focus:border-primary rounded-2xl font-bold text-zinc-900 transition-all shadow-sm"
                                        placeholder="912 345 6789"
                                        defaultValue={currentPhone === "Not set" ? "" : currentPhone}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        disabled={loading}
                                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsEditing(false)}
                                        className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] text-zinc-400"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="pl-1 py-1 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                    <span className="text-xs font-black">+63</span>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-lg font-black text-zinc-900 tracking-tight">
                                        {currentPhone}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Active for official coordination</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-zinc-100" />

                    {/* PASSWORD SECTION */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Security</label>
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {isChangingPassword ? (
                            <form ref={passwordFormRef} action={handlePasswordSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <Input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            className="pl-12 h-14 bg-white border-primary/20 focus:border-primary rounded-2xl font-bold text-zinc-900 transition-all shadow-sm"
                                            placeholder="New Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <Input
                                            name="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            className="pl-12 h-14 bg-white border-primary/20 focus:border-primary rounded-2xl font-bold text-zinc-900 transition-all shadow-sm"
                                            placeholder="Confirm New Password"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        disabled={loading}
                                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                                    >
                                        {loading ? "Updating..." : "Update Password"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsChangingPassword(false)}
                                        className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] text-zinc-400"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="pl-1 py-1 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-lg font-black text-zinc-900 tracking-tight">
                                        ••••••••••••
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Last changed recently</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-zinc-100" />

                    {/* READ ONLY INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-zinc-300" />
                                <span className="text-sm font-bold text-zinc-500">{userEmail}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Account Role</label>
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-zinc-300" />
                                <span className="text-sm font-bold text-zinc-500 capitalize">{profile?.role || "User"}</span>
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
            <CardFooter className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    Last activity: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'New Account'}
                </p>
            </CardFooter>
        </Card>
    );
}
