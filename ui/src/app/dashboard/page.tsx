import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { logout } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  ShieldCheck,
  Mail,
  Key,
  Bell,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function DashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userInitials = user.email?.split("@")[0].substring(0, 2).toUpperCase() || "US";

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden w-64 border-r border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="h-8 w-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white dark:text-black h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight dark:text-white">AdminPro</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Button variant="secondary" className="w-full justify-start gap-3 h-11 px-3 bg-zinc-100 dark:bg-zinc-900">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-3 text-zinc-500 hover:text-black dark:hover:text-white">
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-3 text-zinc-500 hover:text-black dark:hover:text-white">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-3 text-zinc-500 hover:text-black dark:hover:text-white">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <form action={logout}>
            <Button variant="ghost" type="submit" className="w-full justify-start gap-3 h-11 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-zinc-200 bg-white px-8 flex items-center justify-between dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search..."
              className="h-9 bg-zinc-50 dark:bg-zinc-900 border-none"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
            </button>
            <Avatar fallback={userInitials} className="cursor-pointer hover:ring-2 ring-zinc-200 dark:ring-zinc-800 transition-all" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Welcome back, {user.email}</p>
              </div>
              <Button className="font-semibold shadow-md active:scale-95 transition-transform">
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex items-center justify-center">
                    <Mail className="text-blue-600 dark:text-blue-400 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium">Email Address</p>
                    <p className="text-base font-bold dark:text-white truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex items-center justify-center">
                    <Key className="text-emerald-600 dark:text-emerald-400 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium">User ID</p>
                    <p className="text-base font-bold dark:text-white truncate max-w-[150px]">{user.id.substring(0, 12)}...</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="text-purple-600 dark:text-purple-400 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 font-medium">Account Status</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">Verified</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-lg dark:text-white">Account Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                  <span className="text-zinc-500 font-medium">Role</span>
                  <span className="text-right font-semibold dark:text-zinc-200">Administrator</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                  <span className="text-zinc-500 font-medium">Last Login</span>
                  <span className="text-right font-semibold dark:text-zinc-200">Just now</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <span className="text-zinc-500 font-medium">Auth Provider</span>
                  <span className="text-right font-semibold dark:text-zinc-200 uppercase">{user.app_metadata.provider || "Email"}</span>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}