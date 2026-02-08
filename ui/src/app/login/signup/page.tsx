import Link from "next/link";
import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { NotificationHandler } from "@/components/ui/notification-handler";
import { Mail, Lock, UserPlus } from "lucide-react";
import { Suspense } from "react";

export default async function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl dark:bg-zinc-800/20" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl dark:bg-zinc-800/20" />
      </div>

      <main className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110 active:scale-95">
            <UserPlus className="text-white dark:text-black w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            Create account
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Join us to get started with your account
          </p>
        </div>

        <Card className="backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-md mb-6" />}>
            <NotificationHandler />
          </Suspense>

          <form action={signup} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 ml-1"
              >
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                icon={<Mail className="h-4 w-4" />}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 ml-1"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                minLength={6}
                required
              />
              <p className="text-xs text-zinc-500 ml-1">
                Must be at least 6 characters
              </p>
            </div>

            <Button type="submit" className="w-full text-sm h-11 rounded-xl mt-2 font-bold">
              Get Started
            </Button>
          </form>

        </Card>

        <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-black underline-offset-4 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}

