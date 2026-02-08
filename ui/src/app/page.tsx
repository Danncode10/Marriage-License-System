import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/marriage");
}