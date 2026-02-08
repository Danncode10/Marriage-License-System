"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server-utils";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate input
  if (!email || !password) {
    return redirect("/login?error=Please fill in all fields");
  }

  if (password.length < 6) {
    return redirect("/login?error=Password must be at least 6 characters");
  }

  const supabase = await createClient();

  if (!supabase) {
    return redirect("/login?error=Server configuration error");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // If identities is empty, it means the user already exists 
  // (Supabase returns a fake success to prevent email enumeration, but with empty identities)
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    return redirect("/login?error=An account with this email already exists");
  }


  revalidatePath("/", "layout");
  redirect("/login?message=Check your email for the confirmation link");
}
