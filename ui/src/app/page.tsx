import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  if (!supabase) {
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}