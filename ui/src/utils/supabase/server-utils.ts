import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  try {
    const cookieStore = await cookies();

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
}

/**
 * Admin client using the service role key.
 * Uses the plain supabase-js createClient (NOT the SSR wrapper) so that
 * the service role key is applied correctly and RLS is fully bypassed.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("createAdminClient called", {
    hasUrl: !!url,
    hasServiceKey: !!serviceKey,
    urlPrefix: url?.substring(0, 20) + "...",
    keyPrefix: serviceKey?.substring(0, 10) + "..."
  });

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables for admin client");
  }

  return createSupabaseClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
