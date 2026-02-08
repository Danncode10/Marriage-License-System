"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server-utils";

export async function logout() {
  const supabase = await createClient();

  if (!supabase) {
    return redirect("/login?error=Server configuration error");
  }

  // Clear session cookies server-side to prevent "Ghost Sessions"
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login?message=Successfully signed out");
}
