"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    User,
    LogOut,
    ShieldCheck,
    Bell,
    Users,
    FileText,
    BarChart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    userRole?: string;
}

export function Sidebar({ userRole = "user" }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="hidden w-64 border-r border-zinc-200 bg-white p-6 flex-col md:flex h-screen sticky top-0">
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-white h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">Solano MLS</span>
            </div>

            <nav className="flex-1 space-y-1">
                <Link href={`/dashboard/${userRole}`}>
                    <Button
                        variant={isActive(`/dashboard/${userRole}`) ? "secondary" : "ghost"}
                        className={cn("w-full justify-start gap-3 h-11 px-3", isActive(`/dashboard/${userRole}`) ? "bg-zinc-100 font-medium" : "text-zinc-500 hover:text-black")}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>

                {userRole === "admin" && (
                    <>
                        <Link href="/dashboard/admin/staff">
                            <Button
                                variant={isActive("/dashboard/admin/staff") ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-3 h-11 px-3", isActive("/dashboard/admin/staff") ? "bg-zinc-100 font-medium" : "text-zinc-500 hover:text-black")}
                            >
                                <Users className="h-4 w-4" />
                                Staff Management
                            </Button>
                        </Link>
                        <Link href="/dashboard/admin/applications">
                            <Button
                                variant={isActive("/dashboard/admin/applications") ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-3 h-11 px-3", isActive("/dashboard/admin/applications") ? "bg-zinc-100 font-medium" : "text-zinc-500 hover:text-black")}
                            >
                                <FileText className="h-4 w-4" />
                                Global Applications
                            </Button>
                        </Link>
                        <Link href="/dashboard/admin/reports">
                            <Button
                                variant={isActive("/dashboard/admin/reports") ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-3 h-11 px-3", isActive("/dashboard/admin/reports") ? "bg-zinc-100 font-medium" : "text-zinc-500 hover:text-black")}
                            >
                                <BarChart className="h-4 w-4" />
                                Reports & Analytics
                            </Button>
                        </Link>
                    </>
                )}


                <Link href="/dashboard/profile">
                    <Button
                        variant={isActive("/dashboard/profile") ? "secondary" : "ghost"}
                        className={cn("w-full justify-start gap-3 h-11 px-3", isActive("/dashboard/profile") ? "bg-zinc-100 font-medium" : "text-zinc-500 hover:text-black")}
                    >
                        <User className="h-4 w-4" />
                        Profile
                    </Button>
                </Link>

                <Link href="/dashboard/notifications">
                    <Button
                        variant={isActive("/dashboard/notifications") ? "secondary" : "ghost"}
                        className={cn("w-full justify-start gap-3 h-11 px-3", isActive("/dashboard/notifications") ? "bg-zinc-100 font-medium" : "text-zinc-500 hover:text-black")}
                    >
                        <Bell className="h-4 w-4" />
                        Notifications
                    </Button>
                </Link>
            </nav>

            <div className="mt-auto pt-6 border-t border-zinc-200">
                <form action={logout}>
                    <Button variant="ghost" type="submit" className="w-full justify-start gap-3 h-11 px-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </form>
            </div>
        </aside>
    );
}
