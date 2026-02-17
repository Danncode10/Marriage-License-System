"use client";

import { Avatar } from "@/components/ui/avatar";
import { Bell, Search, Menu, X, LayoutDashboard, User, LogOut, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { logout } from "@/app/logout/actions";

interface HeaderProps {
    userInitials: string;
    userRole: string;
}

export function Header({ userInitials, userRole }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { href: `/dashboard/${userRole}`, label: "Dashboard", icon: LayoutDashboard },
        { href: `/dashboard/${userRole}/profile`, label: "Profile", icon: User },
        { href: `/dashboard/${userRole}/notifications`, label: "Notifications", icon: Bell },
    ];

    return (
        <>
            <header className="h-16 border-b border-zinc-200 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 w-full shrink-0">
                <div className="flex items-center gap-4 flex-1">
                    {/* Hamburger Button - Mobile Only */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-lg md:hidden transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="hidden md:block flex-1 max-w-md">
                        {userRole !== "user" && (
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input placeholder="Search..." className="h-9 bg-zinc-50 border-none pl-9" />
                            </div>
                        )}
                    </div>

                    {/* Mobile Logo Visibility */}
                    <div className="flex md:hidden items-center gap-2">
                        <div className="h-7 w-7 bg-black rounded flex items-center justify-center">
                            <ShieldCheck className="text-white h-4 w-4" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Solano MLS</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <Link href={`/dashboard/${userRole}/notifications`}>
                        <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg relative transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                    </Link>
                    <Link href={`/dashboard/${userRole}/profile`}>
                        <Avatar className="cursor-pointer hover:ring-2 ring-zinc-200 transition-all" fallback={userInitials} />
                    </Link>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[50] md:hidden"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-white z-[60] md:hidden flex flex-col p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                                        <ShieldCheck className="text-white h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-xl tracking-tight">Solano MLS</span>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 -mr-2 text-zinc-400 hover:bg-zinc-50 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className={cn(
                                            "flex items-center gap-3 px-4 h-12 rounded-xl transition-all duration-200",
                                            isActive(link.href)
                                                ? "bg-zinc-900 text-white font-bold shadow-lg shadow-zinc-200"
                                                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                        )}>
                                            <link.icon className={cn("h-5 w-5", isActive(link.href) ? "text-white" : "text-zinc-400")} />
                                            <span className="text-sm uppercase tracking-widest font-black">{link.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </nav>

                            <div className="pt-6 border-t border-zinc-100">
                                <form action={logout}>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center gap-3 px-4 h-12 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold uppercase tracking-widest text-xs"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Sign Out
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
