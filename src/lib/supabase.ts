import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const BLOG_IMAGES_BUCKET = "blog-images";

let client: SupabaseClient | undefined;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Server-side Supabase client using the service-role key, or null when the env vars aren't set. */
export function getSupabase(): SupabaseClient | null {
  if (!isDatabaseConfigured()) return null;
  return (client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}
