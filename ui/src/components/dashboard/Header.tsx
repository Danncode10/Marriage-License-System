"use client";

import { Avatar } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
    userInitials: string;
}

export function Header({ userInitials }: HeaderProps) {
    return (
        <header className="h-16 border-b border-zinc-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 w-full shrink-0">
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input placeholder="Search..." className="h-9 bg-zinc-50 border-none pl-9" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg relative transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <Avatar className="cursor-pointer hover:ring-2 ring-zinc-200 transition-all" fallback={userInitials} />
            </div>
        </header>
    );

}
