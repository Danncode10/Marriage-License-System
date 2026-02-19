"use client";

import Link from "next/link";
import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { NotificationHandler } from "@/components/ui/notification-handler";
import { Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Suspense, useEffect, use } from "react";

export default function SignupPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const params = use(searchParams);
  const applicationCode = params.code;

  // If we have an application code, store it for later use after signup
  useEffect(() => {
    if (applicationCode) {
      localStorage.setItem('pending_application_code', applicationCode);
    }
  }, [applicationCode]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-200/40 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-zinc-100/60 rounded-full blur-[80px]" />
      </div>

      <main className="w-full max-w-[440px] relative z-10 transition-all">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-black/10 transition-all hover:scale-105 active:scale-95">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase text-center leading-none">
            Create <br /> Account
          </h1>
          <p className="mt-4 text-zinc-500 font-medium tracking-tight text-center">
            Join the Solano Marriage License System
          </p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-4 bg-white/80 backdrop-blur-xl border border-white">
          <div className="p-6">
            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-zinc-100 rounded-2xl mb-6" />}>
              <NotificationHandler />
            </Suspense>
            <form action={signup} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="full_name"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Juan Dela Cruz"
                    className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex items-center gap-1.5 ml-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-zinc-300" />
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">At least 6 characters required</p>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl mt-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        <p className="mt-10 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black border-b-2 border-black/10 hover:border-black transition-all ml-1"
          >
            Sign in here
          </Link>
        </p>
      </main>
    </div >
  );
}

