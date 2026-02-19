"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server-utils";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;

  // Validate input
  if (!email || !password) {
    return redirect("/login?error=Please fill in all fields");
  }

  if (password.length < 6) {
    return redirect("/login?error=Password must be at least 6 characters");
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin");

  if (!supabase) {
    return redirect("/login?error=Server configuration error");
  }

  console.log(`Starting signup for: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: full_name || null,
      },
    },
  });

  if (error) {
    console.error(`Signup error for ${email}:`, error.message);
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // If identities is empty, it means the user already exists 
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    console.log(`User already exists: ${email}`);
    return redirect("/login?error=An account with this email already exists");
  }

  console.log(`Signup successful (confirmation pending) for: ${email}`);

  revalidatePath("/", "layout");
  redirect("/login?message=Account created! Please check your email for the confirmation link to sign in.");
}
